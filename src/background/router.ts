import { Message, CommandResult } from '../types'
import { aiService } from './ai/ai.service'
import { findTabsByFuzzySearch } from './actions'
import { executePlan } from './engine'

// The router that routes all incoming messages from the UI to the appropriate handlers.
export async function onMessage(message: Message, sender: chrome.runtime.MessageSender) {
  console.log('Helm Background: Received message from content script', message)
  switch (message.type) {
    case 'COMMAND_CHANGED': {
      const query = message.payload

      // 1. The instant fuzzy tab search
      findTabsForUI(query, sender)

      // 2. The slower, debounced AI pipeline
      triggerDebouncedAiPipeline(query, sender)
      break
    }
    case 'EXECUTE_ACTION': {
      const result = message.payload as CommandResult

      if (result.payload?.plan) {
        executePlan(result.payload.plan)

        if (sender.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, { type: 'TOGGLE_UI' })
        }
      }
      break
    }
    default:
      break
  }
}

// State for managing the debounced AI pipeline
let aiDebounceTimer: NodeJS.Timeout | null = null
const AI_DEBOUNCE_DELAY_MS = 350
let queryAbortController = new AbortController()

function triggerDebouncedAiPipeline(query: string, sender: chrome.runtime.MessageSender) {
  if (aiDebounceTimer) clearTimeout(aiDebounceTimer)
  queryAbortController.abort()
  aiDebounceTimer = setTimeout(() => handleDebouncedLogic(query, sender), AI_DEBOUNCE_DELAY_MS)
}

// The core logic that runs after a user has paused typing
// Decides whether to do nothing, or to engage the AI to
// perform a semantic search or formulate a multi-step action plan
async function handleDebouncedLogic(query: string, sender: chrome.runtime.MessageSender) {
  if (query.trim() === '') return

  // Create a new controller for this specific, debounced request.
  const signal = (queryAbortController = new AbortController()).signal

  try {
    // 1. Re-run the Fuse search with the final query to make a decision.
    const currentFuseResults = await findTabsByFuzzySearch(query)
    if (signal.aborted) return

    if (currentFuseResults.length > 0) {
      // Fuse search succeeded on the final query. The user is likely a "Tab Jumper."
      // The UI is already showing the correct results from the instant search.
      // We do nothing and let the AI stand down.
      return
    }

    // 2. Fuse failed. Escalate to AI.
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, { type: 'AI_PROCESSING_STARTED' })
    }

    // Get the AI's plan.
    const { plan } = await aiService.getPlan(query, signal)

    if (signal.aborted || !plan || plan.length === 0) {
      if (sender.tab?.id)
        chrome.tabs.sendMessage(sender.tab.id, { type: 'RESULTS_UPDATED', payload: [] })
      return
    }

    let finalResults: CommandResult[] = []

    // The AI returned a plan. Now we process it into results for the UI.
    if (plan.length > 1 || plan[0].action !== 'FIND_TABS') {
      // This is a complex "Mutation" plan. Create a single action result.
      finalResults.push({
        id: 'action-execute-plan',
        type: 'action',
        title: '', // The UI will generate the title!
        payload: { plan },
      })
    } else {
      // This is a "FIND_TABS" plan (a semantic rescue search).
      const semanticMatch = await aiService.findBestTabSemantically(
        query,
        await chrome.tabs.query({}),
        signal,
      )
      if (semanticMatch) {
        finalResults.push({
          id: `tab-${semanticMatch.id}`,
          type: 'tab',
          title: `✨ ${semanticMatch.title || ''}`,
          subtitle: `Suggested for "${query}"`,
          faviconUrl: semanticMatch.favIconUrl,
          payload: {
            plan: [{ action: 'SWITCH_TO_TAB', params: { tabId: semanticMatch.id } }],
          },
        })
      }
    }

    if (sender.tab?.id && !signal.aborted) {
      chrome.tabs.sendMessage(sender.tab.id, { type: 'RESULTS_UPDATED', payload: finalResults })
    }
  } catch (e: any) {
    if (e.name !== 'AbortError') console.error('Helm AI: AI pipeline failed:', e)
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, { type: 'AI_PROCESSING_FINISHED' })
    }
  }
}

// A UI-specific helper to get formatted results for the instant search
function findTabsForUI(query: string, sender: chrome.runtime.MessageSender) {
  findTabsByFuzzySearch(query).then((fuseResults) => {
    // Filter out tabs that don't have a valid ID
    const validTabs = fuseResults
      .map((result) => result.item)
      .filter((tab) => typeof tab.id === 'number')

    // Format into our CommandResult
    const commandResults: CommandResult[] = validTabs.map((tab) => ({
      id: `tab-${tab.id}`,
      type: 'tab',
      title: tab.title || 'Untitled Tab',
      subtitle: tab.url,
      faviconUrl: tab.favIconUrl,
      payload: {
        plan: [{ action: 'SWITCH_TO_TAB', params: { tabId: tab.id } }],
      },
    }))

    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'RESULTS_UPDATED',
        payload: commandResults.slice(0, 10),
      })
    }
  })
}
