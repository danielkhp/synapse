import Fuse from 'fuse.js'
import { CommandResult } from '../types'

// Perform a fuzzy search across all tabs
export async function findTabsByQuery(query: string): Promise<CommandResult[]> {
  console.log(`Helm background: Fuzzy searching for '${query}'`)
  const allTabs = await chrome.tabs.query({})

  const fuse = new Fuse(allTabs, {
    keys: ['title', 'url'],
    includeScore: true,
    threshold: 0.4,
  })

  const searchResults = fuse.search(query)
  console.log(`Helm background: Fuzzy search found ${searchResults.length} results`)

  // Format the Fuse results into our CommandResult type
  return searchResults.map(({ item: tab }) => ({
    id: String(tab.id),
    type: 'tab',
    title: tab.title || 'Untitled Tab',
    subtitle: tab.url,
    faviconUrl: tab.favIconUrl,
  }))
}
