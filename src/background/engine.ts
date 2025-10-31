import * as actions from './actions'
import { PlanStep } from '../types'

// An engine that executes a given sequence of actions
export async function executePlan(plan: PlanStep[]) {
  console.log('Helm Engine: Executing plan')
  let context: { previousResult: any } = { previousResult: null }

  for (const step of plan) {
    let params = { ...step.params }
    for (const key in params) {
      if (params[key] === '$PREVIOUS_RESULT') {
        params[key] = context.previousResult
      }
    }

    let stepResult: any = null
    switch (step.action) {
      case 'FIND_TABS':
        console.log('Helm Engine: Finding tabs')
        stepResult = await actions.findTabIdsByAi(params.query)
        break
      case 'GROUP_TABS':
        console.log('Helm Engine: Grouping tabs')
        await actions.groupTabs(params.tabIds, params.groupName)
        break
      case 'SWITCH_TO_TAB':
        console.log('Helm Engine: Switching tabs')
        await actions.switchToTab(params.tabId)
        break
      default:
        console.error(`Helm Engine: Unknown action type: ${step.action}`)
    }
    context.previousResult = stepResult
  }
  return context.previousResult
}
