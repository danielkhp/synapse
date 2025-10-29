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
