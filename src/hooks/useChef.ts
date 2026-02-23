'use client'

import { useState, useCallback } from 'react'
import type { ChefMessage } from '@/types/recipe'

export function useChef() {
  const [messages, setMessages] = useState<ChefMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '안녕하세요! 오늘 뭐 해먹을까요? 냉장고 속 재료로 맛있는 레시피를 추천해드릴게요! 😊',
      timestamp: new Date().toISOString(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChefMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })
      const json = await res.json()
      const data = json.data ?? json

      const assistantMsg: ChefMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message ?? '레시피를 준비했어요!',
        recipes: data.recipes,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const errorMsg: ChefMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '죄송해요, 잠시 문제가 발생했어요. 다시 시도해주세요!',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { messages, isLoading, sendMessage }
}
