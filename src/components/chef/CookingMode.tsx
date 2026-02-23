'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Clock, Play, Pause, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Recipe, RecipeStep } from '@/types/recipe'

interface CookingModeProps {
  recipe: Recipe
  onClose?: () => void
}

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export const CookingMode = ({ recipe, onClose }: CookingModeProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const step: RecipeStep = recipe.steps[currentStep]
  const totalSteps = recipe.steps.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  // Reset timer when step changes
  useEffect(() => {
    setIsRunning(false)
    setTimerSeconds(step.time ? step.time * 60 : 0)
  }, [currentStep, step.time])

  // Countdown
  useEffect(() => {
    if (!isRunning || timerSeconds <= 0) return
    const interval = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          setIsRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, timerSeconds])

  const goNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      setIsComplete(true)
    }
  }, [currentStep, totalSteps])

  const goPrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }, [currentStep])

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center">
        <div className="text-6xl">🎉</div>
        <div>
          <h2 className="text-2xl font-bold text-navy mb-2">완성!</h2>
          <p className="text-gray-500 text-sm">
            {recipe.name} 요리가 완료되었어요. 맛있게 드세요!
          </p>
        </div>
        <button
          onClick={onClose}
          className="px-8 py-4 bg-mint text-white rounded-2xl font-bold text-base shadow-lg shadow-mint/25 hover:bg-mint-dark transition-all"
        >
          완료
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-400">{recipe.name}</p>
          <p className="text-sm font-bold text-navy">
            {currentStep + 1} / {totalSteps}
          </p>
        </div>
        <div className="w-9" />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-mint transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">
        {/* Step number */}
        <div className="w-20 h-20 rounded-full bg-mint text-white flex items-center justify-center shadow-xl shadow-mint/30">
          <span className="text-4xl font-black">{step.order}</span>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2">
          {recipe.steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                idx === currentStep
                  ? 'w-8 bg-mint'
                  : idx < currentStep
                  ? 'w-4 bg-mint/40'
                  : 'w-4 bg-gray-200'
              )}
            />
          ))}
        </div>

        {/* Instruction */}
        <p className="text-lg font-medium text-navy text-center leading-relaxed">
          {step.instruction}
        </p>

        {/* Timer */}
        {step.time && (
          <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-3xl w-full">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock size={14} />
              <span>타이머 {step.time}분</span>
            </div>
            <p
              className={cn(
                'text-5xl font-black tabular-nums transition-colors',
                timerSeconds === 0 && step.time
                  ? 'text-freshness-urgent'
                  : isRunning
                  ? 'text-mint'
                  : 'text-navy'
              )}
            >
              {formatTime(timerSeconds)}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTimerSeconds(step.time! * 60)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-navy transition-colors"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsRunning((r) => !r)}
                className="flex items-center gap-2 px-6 py-2.5 bg-mint text-white rounded-full font-semibold text-sm hover:bg-mint-dark transition-colors"
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                {isRunning ? '일시정지' : '시작'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 px-4 pb-8">
        <button
          onClick={goPrev}
          disabled={currentStep === 0}
          className="flex-1 flex items-center justify-center gap-2 py-4 border border-gray-200 text-gray-500 rounded-2xl font-semibold text-sm disabled:opacity-30 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <ChevronLeft size={18} />
          이전
        </button>
        <button
          onClick={goNext}
          className="flex-[2] flex items-center justify-center gap-2 py-4 bg-mint text-white rounded-2xl font-bold text-sm shadow-lg shadow-mint/25 hover:bg-mint-dark active:scale-[0.98] transition-all"
        >
          {currentStep === totalSteps - 1 ? '완료!' : '다음 단계'}
          {currentStep < totalSteps - 1 && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  )
}
