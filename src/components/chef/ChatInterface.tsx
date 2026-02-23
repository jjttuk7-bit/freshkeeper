'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, ChefHat, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChef } from '@/hooks/useChef'
import { RecipeCard } from './RecipeCard'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { ChefMessage, Recipe } from '@/types/recipe'

const QUICK_ACTIONS = [
  '임박 재료 활용 레시피',
  '15분 이내 간단 요리',
  '냉장고 털기 레시피',
  '오늘 저녁 뭐 먹지?',
]

interface ChatInterfaceProps {
  onRecipeSelect?: (recipe: Recipe) => void
}

export const ChatInterface = ({ onRecipeSelect }: ChatInterfaceProps) => {
  const { messages, isLoading, sendMessage } = useChef()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg: ChefMessage) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onRecipeSelect={onRecipeSelect}
          />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-purple/10 flex items-center justify-center flex-shrink-0">
              <ChefHat size={16} className="text-accent-purple" />
            </div>
            <div className="px-4 py-3 bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm">
              <LoadingSpinner />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => sendMessage(action)}
                disabled={isLoading}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-accent-purple/10 text-accent-purple rounded-xl text-xs font-medium border border-accent-purple/20 hover:bg-accent-purple/20 disabled:opacity-50 transition-colors"
              >
                <Sparkles size={11} />
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-3 p-1 bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-mint focus-within:ring-2 focus-within:ring-mint/20 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={1}
            className="flex-1 resize-none px-3 py-2.5 bg-transparent text-sm text-navy placeholder:text-gray-400 focus:outline-none max-h-32"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = `${t.scrollHeight}px`
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-9 h-9 mb-1 mr-1 flex items-center justify-center bg-mint text-white rounded-xl hover:bg-mint-dark active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="전송"
          >
            <Send size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

const MessageBubble = ({
  message,
  onRecipeSelect,
}: {
  message: ChefMessage
  onRecipeSelect?: (recipe: Recipe) => void
}) => {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-accent-purple/10 flex items-center justify-center flex-shrink-0">
          <ChefHat size={16} className="text-accent-purple" />
        </div>
      )}

      <div className={cn('flex flex-col gap-2 max-w-[80%]', isUser && 'items-end')}>
        {/* Text bubble */}
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap',
            isUser
              ? 'bg-mint text-white rounded-tr-sm'
              : 'bg-white border border-gray-100 text-navy rounded-tl-sm shadow-sm'
          )}
        >
          {message.content}
        </div>

        {/* Recipe cards */}
        {message.recipes && message.recipes.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            {message.recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => onRecipeSelect?.(recipe)}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-gray-300 px-1">
          {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}
