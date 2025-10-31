import Fuse, { FuseResult } from 'fuse.js'
import { CommandResult } from '../types'
import { aiService } from './ai/ai.service'

// Perform a fuzzy search across all tabs
export async function findTabsByFuzzySearch(query: string): Promise<FuseResult<chrome.tabs.Tab>[]> {
  if (query.trim() === '') return []

  const allTabs = await chrome.tabs.query({})

  const fuse = new Fuse(allTabs, {
    keys: ['title', 'url'],
    threshold: 0.3,
  })

  return fuse.search(query)
}

// Perform a semantic search across all tabs
export async function findTabIdsByAi(query: string): Promise<number[]> {
  const allTabs = await chrome.tabs.query({})
  const matchedTabs = await aiService.findMatchingTabs(query, allTabs, new AbortController().signal)
  if (!matchedTabs || matchedTabs.length === 0) return []

  return matchedTabs.map((t) => t.id).filter((id): id is number => typeof id === 'number')
}

// Group a given set of tabs under a specified name
export async function groupTabs(tabIds: number[], groupName: string): Promise<void> {
  if (!tabIds || tabIds.length === 0) return

  try {
    const groupId = await chrome.tabs.group({ tabIds })
    await chrome.tabGroups.update(groupId, { title: groupName })
    console.log(`Helm Actions: Grouped ${tabIds.length} tabs under "${groupName}".`)
  } catch (e) {
    console.error('Helm Actions: Failed to group tabs.', e)
  }
}

// Switches focus to a specified tab
export async function switchToTab(tabId: number): Promise<void> {
  if (!tabId) return

  try {
    await chrome.tabs.update(tabId, { active: true })
    const tab = await chrome.tabs.get(tabId)
    if (tab.windowId) {
      await chrome.windows.update(tab.windowId, { focused: true })
    }
    console.log(`Helm Actions: Switched to tab ${tabId}.`)
  } catch (e) {
    console.error(`Helm Actions: Failed to switch to tab ${tabId}.`, e)
  }
}
