// A generic structure for all messages passed between scripts
export interface Message {
  type: string;
  payload?: any;
}

// The structure for a single result item to be displayed in the list
export interface CommandResult {
  id: string;
  type: 'tab' | 'action' | 'workspace';
  title: string;
  subtitle?: string;
  faviconUrl?: string;
}