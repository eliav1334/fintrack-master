export interface CodeHistoryItem {
  id: string
  prompt: string
  code: string
  explanation: string
  createdAt: Date
}

export interface CodeHistory {
  items: CodeHistoryItem[]
} 