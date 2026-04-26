export interface Message {
  id: number
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatSession {
  id: string
  title: string
  created_at: string
}