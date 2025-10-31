import { PlannerAgent } from './agents/PlannerAgent'
import { SemanticSearchAgent } from './agents/SemanticSearchAgent'

class AiService {
  private planner = new PlannerAgent()
  private searcher = new SemanticSearchAgent()

  public getPlan(query: string, signal: AbortSignal): Promise<any> {
    return this.planner.getPlan(query, signal)
  }

  public findMatchingTabs(
    query: string,
    tabs: chrome.tabs.Tab[],
    signal: AbortSignal,
  ): Promise<chrome.tabs.Tab[]> {
    return this.searcher.findMatchingTabs(query, tabs, signal)
  }
}

export const aiService = new AiService()
