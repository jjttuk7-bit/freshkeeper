'use client'

import { useState, useCallback, useRef } from 'react'
import type { ChefMessage } from '@/types/recipe'
import { useChefStore } from '@/stores/chefStore'

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
  const messagesRef = useRef(messages)
  messagesRef.current = messages

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
      // Build conversation history from previous messages (last 10 for context)
      const prev = messagesRef.current
      const history = prev
        .filter((m) => m.id !== 'welcome')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/ai/chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, history }),
      })
      const json = await res.json()
      const data = json.data ?? json

      // Map recipes to include required fields for Recipe type
      const recipes = data.recipes?.map((r: Record<string, unknown>, i: number) => ({
        id: `chef-${Date.now()}-${i}`,
        prepTime: 0,
        servings: r.servings ?? 2,
        calories: r.calories ?? null,
        nutrition: null,
        imageUrl: null,
        source: 'ai-generated',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...r,
        ingredients: Array.isArray(r.ingredients)
          ? r.ingredients.map((ing: Record<string, unknown>) => ({
              name: ing.name ?? '',
              amount: ing.amount ?? '',
              unit: '',
              required: true,
              inFridge: ing.inFridge ?? false,
            }))
          : [],
        steps: Array.isArray(r.steps)
          ? r.steps.map((s: unknown, idx: number) => ({
              order: idx + 1,
              instruction: String(s),
            }))
          : [],
      }))

      // Cache AI-generated recipes in store for detail page access
      if (recipes?.length) {
        useChefStore.getState().addRecipes(recipes)
      }

      const assistantMsg: ChefMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message ?? '레시피를 준비했어요!',
        recipes,
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
