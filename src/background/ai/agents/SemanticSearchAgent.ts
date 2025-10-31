import { SEMANTIC_SEARCH_SYSTEM_PROMPT } from '../prompts/semantic-search.prompt'

export class SemanticSearchAgent {
  private session: LanguageModel | null = null

  private async getSession(): Promise<LanguageModel | null> {
    if (this.session) return this.session

    const availability = await LanguageModel.availability()
    if (availability !== 'available') throw new Error('AI is not available.')

    this.session = await LanguageModel.create({
      initialPrompts: [{ role: 'system', content: SEMANTIC_SEARCH_SYSTEM_PROMPT }],
    })
    return this.session
  }

  public async findMatchingTabs(
    query: string,
    tabs: chrome.tabs.Tab[],
    signal: AbortSignal,
  ): Promise<chrome.tabs.Tab[]> {
    const session = await this.getSession()
    if (!session) throw new Error('AI Searcher session not available.')

    const tabListForPrompt = JSON.stringify(
      tabs.map((t) => ({ id: t.id, title: t.title, url: t.url })),
    )
    const fullPrompt = `# Tab List:\n${tabListForPrompt}\n\n# User Query:\n"${query}"`
    const schema = {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
      },
      required: ['ids'],
    }

    const result = await session.prompt(fullPrompt, { responseConstraint: schema, signal })
    const parsed = JSON.parse(result)

    const tabIds = new Set(parsed.ids)
    return tabs.filter(t => tabIds.has(t.id))
  }
}
