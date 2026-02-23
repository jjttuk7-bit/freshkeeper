'use client'

import { useState, useRef, useEffect } from 'react'
import { useChef } from '@/hooks/useChef'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ChefMessage, Recipe } from '@/types/recipe'
import {
  ChefHat,
  Send,
  Loader2,
  Clock,
  Zap,
  Heart,
  Leaf,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

const QUICK_ACTIONS = [
  { label: '임박재료 활용', icon: Zap, prompt: '유통기한이 임박한 재료로 만들 수 있는 레시피 추천해줘' },
  { label: '간단 요리', icon: Clock, prompt: '15분 안에 만들 수 있는 간단한 레시피 알려줘' },
  { label: '건강식', icon: Leaf, prompt: '건강하고 영양 균형 잡힌 레시피 추천해줘' },
  { label: '냉장고 파먹기', icon: Heart, prompt: '냉장고에 있는 재료로 최대한 많이 활용할 수 있는 레시피 추천해줘' },
]

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' }
  const difficultyColor = {
    easy: 'text-freshness-fresh bg-freshness-fresh/10',
    medium: 'text-freshness-caution bg-freshness-caution/10',
    hard: 'text-freshness-urgent bg-freshness-urgent/10',
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="font-bold text-navy">{recipe.name}</h4>
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${difficultyColor[recipe.difficulty]}`}>
          {difficultyLabel[recipe.difficulty]}
        </span>
      </div>
      {recipe.description && (
        <p className="mb-3 text-sm text-gray-500">{recipe.description}</p>
      )}
      <div className="mb-3 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{recipe.cookTime}분</span>
        <span>{recipe.servings}인분</span>
        {recipe.calories && <span>{recipe.calories}kcal</span>}
      </div>
      <div className="mb-3 flex flex-wrap gap-1">
        {recipe.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            #{tag}
          </span>
        ))}
      </div>
      {/* Ingredients preview */}
      <div className="mb-3 flex flex-wrap gap-1">
        {recipe.ingredients.slice(0, 5).map((ing) => (
          <span
            key={ing.name}
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              ing.inFridge ? 'bg-mint-light text-mint' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {ing.inFridge ? '✓' : '+'} {ing.name}
          </span>
        ))}
        {recipe.ingredients.length > 5 && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">
            +{recipe.ingredients.length - 5}개
          </span>
        )}
      </div>
      <Link href={`/chef/recipe/${recipe.id}`}>
        <button className="flex w-full items-center justify-center gap-1 rounded-xl bg-mint py-2 text-sm font-bold text-white hover:bg-mint-dark">
          레시피 보기 <ArrowRight className="h-4 w-4" />
        </button>
      </Link>
    </div>
  )
}

function MessageBubble({ message }: { message: ChefMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mint to-mint-dark shadow-sm">
          <ChefHat className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={`flex max-w-[80%] flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-mint text-white rounded-tr-sm'
              : 'bg-white text-navy shadow-sm rounded-tl-sm'
          }`}
        >
          {message.content}
        </div>
        {message.recipes && message.recipes.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            {message.recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChefPage() {
  const { messages, isLoading, sendMessage } = useChef()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    await sendMessage(text)
  }

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt)
  }

  return (
    <div className="mx-auto flex max-w-md flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Header */}
      <div className="border-b border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-mint to-mint-dark shadow">
            <ChefHat className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-navy">AI 셰프</h1>
            <p className="text-xs text-gray-400">냉장고 재료로 맛있는 레시피를 추천해드려요</p>
          </div>
          <div className="ml-auto flex h-2 w-2 rounded-full bg-freshness-fresh shadow-sm shadow-freshness-fresh/50" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mint to-mint-dark shadow-sm">
                <ChefHat className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="overflow-x-auto border-t border-gray-100 bg-white px-4 py-2">
        <div className="flex gap-2">
          {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
            <button
              key={label}
              onClick={() => handleQuickAction(prompt)}
              disabled={isLoading}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-mint/40 hover:bg-mint-light hover:text-mint disabled:opacity-50"
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="오늘 뭐 해먹을까요?"
            className="flex-1 rounded-2xl border-gray-200 bg-gray-50 text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="h-10 w-10 flex-shrink-0 rounded-full bg-mint p-0 text-white hover:bg-mint-dark disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
