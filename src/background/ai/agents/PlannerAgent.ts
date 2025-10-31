import { PlanStep } from '../../../types'
import { PLANNER_SYSTEM_PROMPT } from '../prompts/planner.prompt'

export class PlannerAgent {
  public async getPlan(query: string, signal: AbortSignal): Promise<{ plan: PlanStep[] }> {
    const availability = await LanguageModel.availability()
    if (availability !== 'available') throw new Error('AI is not available.')

    let session: LanguageModel | null = null
    try {
      session = await LanguageModel.create({
        initialPrompts: [{ role: 'system', content: PLANNER_SYSTEM_PROMPT }],
      })

      const schema = {
        type: 'object',
        properties: {
          plan: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: {
                  type: 'string',
                  // We tell the model the exact valid strings for the 'action' property.
                  enum: ['FIND_TABS', 'GROUP_TABS', 'SWITCH_TO_TAB', 'CLOSE_TABS'],
                },
                params: {
                  type: 'object',
                },
              },
              required: ['action', 'params'],
            },
          },
        },
        required: ['plan'],
      }

      const result = await session.prompt(query, { responseConstraint: schema, signal })
      console.log(JSON.parse(result))
      return JSON.parse(result) as { plan: PlanStep[] }
    } finally {
      if (session) await session.destroy()
    }
  }
}
