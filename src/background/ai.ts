// This file manages the lifecycle of our single, reusable AI session,
let session: LanguageModel | null = null
let sessionDestroyTimer: NodeJS.Timeout | null = null
const SESSION_IDLE_TIMEOUT_MS = 60 * 1000

// Lazily creates and returns a LanguageModel session or null if not immediately available
export async function getLanguageModelSession(): Promise<LanguageModel | null> {
  if (session) {
    return session
  }

  const availability: Availability = await LanguageModel.availability()
  if (availability == 'unavailable') {
    console.warn(`Helm AI: The device or requested session options are not supported.`)
    return null
  }

  console.log('Helm AI: Creating new LanguageModel session.')
  const systemPrompt = `You are a command router for a Chrome extension that manages browser tabs. Your task is to analyze user text and classify it into an 'intent' and an associated 'query'.

# Intents & Rules:

1. intent: "FIND_TAB"
   - Use for commands about finding, switching to, or going to a specific tab.
   - The 'query' should be the name or subject of the tab.
   - Example: "find my budget spreadsheet" -> query: "budget spreadsheet"

2. intent: "GROUP_TABS"
   - Use for commands that explicitly mention the word "group".
   - The 'query' should be the subject of the tabs to be grouped.
   - Example: "group all my jira tickets" -> query: "jira tickets"

3. intent: "UNKNOWN"
   - Use for any command that does not fit the categories above.
   - The 'query' should be the original user text.
   - Example: "how to bake a cake" -> query: "how to bake a cake"`

  session = await LanguageModel.create({
    initialPrompts: [
      {
        role: 'system',
        content: systemPrompt,
      },
    ],
  })
  return session
}

// Destroys the active session to free resources
async function destroySession() {
  if (session) {
    session.destroy()
    session = null
    console.log('Helm AI: Session destroyed due to inactivity.')
  }
}

// Resets the idle timer that destroys the session
export function resetSessionDestroyTimer() {
  if (sessionDestroyTimer) {
    clearTimeout(sessionDestroyTimer)
  }
  sessionDestroyTimer = setTimeout(destroySession, SESSION_IDLE_TIMEOUT_MS)
}

// Use AI to classify the user's command
export async function getIntentFromLLM(
  text: string,
  signal: AbortSignal,
): Promise<{ intent: string; query: string }> {
  const currentSession = await getLanguageModelSession()

  if (!currentSession) {
    return { intent: 'FIND_TAB', query: text }
  }

  resetSessionDestroyTimer()

  const prompt = text

  // The JSON schema to constrain the model response
  const schema = {
    type: 'object',
    properties: {
      intent: { type: 'string', enum: ['FIND_TAB', 'GROUP_TABS', 'UNKNOWN'] },
      query: { type: 'string' },
    },
  }

  try {
    const result = await currentSession.prompt(prompt, { responseConstraint: schema, signal })
    const parsed = JSON.parse(result)
    return {
      intent: parsed.intent || 'UNKNOWN',
      query: parsed.query || text,
    }
  } catch (e: any) {
    if (e.name !== 'AbortError') {
      console.error('Helm AI: Intent classification failed.', e)
    }
    return { intent: 'FIND_TAB', query: text }
  }
}

export async function findBestTabSemantically(
  query: string,
  tabs: chrome.tabs.Tab[],
  signal: AbortSignal,
): Promise<chrome.tabs.Tab | null> {
  console.log(`Helm AI: Performing semantic tab search for ${query}`)
  const session = await getLanguageModelSession()
  if (!session) return null

  resetSessionDestroyTimer()

  // We provide the list of tabs as structured data for the model to search.
  // We only include the essential info to save tokens and improve speed.
  const tabListForPrompt = JSON.stringify(
    tabs.map((tab) => ({ id: tab.id, title: tab.title, url: tab.url })),
  )

  const prompt = `You are a semantic search engine for browser tabs. Your task is to find the single best tab from the following JSON list that semantically matches the user's query.

Consider synonyms, topics, and abstract concepts. For example, a query for "money" should match a tab about "budget" or "finance".

# Tab List:
${tabListForPrompt}

# User Query:
"${query}"

Analyze the list and the query. If you find a high-confidence match, respond with the JSON object of that single tab from the list. If no tab is a good semantic match, respond with an empty JSON object {}.`

  // We define a schema that expects an object, which might have an 'id'.
  // This allows the model to return an empty object for no match.
  const schema = {
    type: 'object',
    properties: {
      id: { type: 'number' },
    },
  }

  try {
    const result = await session.prompt(prompt, { responseConstraint: schema, signal })
    const parsed = JSON.parse(result)

    // If the model returned an object with a valid 'id', it found a match.
    if (parsed.id) {
      // Find the full, original tab object from our list and return it.
      return tabs.find((tab) => tab.id === parsed.id) || null
    }

    // The model returned {} indicating no confident match.
    return null
  } catch (e: any) {
    if (e.name !== 'AbortError') {
      console.error('Helm AI: Semantic search failed.', e)
    }
    return null
  }
}
