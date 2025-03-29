import { CodeHistory, CodeHistoryItem } from "./types"

const HISTORY_KEY = "code_history"

export function saveToHistory(item: Omit<CodeHistoryItem, "id" | "createdAt">) {
  const history = loadHistory()
  const newItem: CodeHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  }
  
  history.items.unshift(newItem)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  return newItem
}

export function loadHistory(): CodeHistory {
  const stored = localStorage.getItem(HISTORY_KEY)
  if (!stored) {
    return { items: [] }
  }
  
  const history = JSON.parse(stored)
  return {
    items: history.items.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
    })),
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
} 