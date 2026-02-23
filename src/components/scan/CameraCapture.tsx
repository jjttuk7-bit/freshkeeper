'use client'

import { useRef, useState, useCallback } from 'react'
import { Camera, Upload, X, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface CameraCaptureProps {
  onCapture: (base64: string, file: File) => void
  isProcessing?: boolean
  className?: string
}

export const CameraCapture = ({ onCapture, isProcessing = false, className }: CameraCaptureProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      if (file.size > 10 * 1024 * 1024) {
        alert('10MB 이하의 이미지만 업로드할 수 있어요.')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPreview(dataUrl)
        const base64 = dataUrl.split(',')[1]
        onCapture(base64, file)
      }
      reader.readAsDataURL(file)
    },
    [onCapture]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleReset = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="미리보기" className="w-full h-full object-cover" />
          {isProcessing && (
            <div className="absolute inset-0 bg-navy/60 flex flex-col items-center justify-center gap-3">
              <LoadingSpinner />
              <p className="text-white text-sm font-medium">AI가 식재료를 인식하는 중...</p>
            </div>
          )}
          {!isProcessing && (
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-navy/70 rounded-full text-white hover:bg-navy/90 transition-colors"
              aria-label="다시 찍기"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed aspect-square cursor-pointer transition-all',
            isDragging
              ? 'border-mint bg-mint/5 scale-[1.01]'
              : 'border-gray-200 bg-gray-50 hover:border-mint/50 hover:bg-mint/5'
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-full bg-mint/10 flex items-center justify-center">
            <Camera size={28} className="text-mint" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-semibold text-navy">사진을 찍거나 업로드하세요</p>
            <p className="text-xs text-gray-400 mt-1">냉장고 속 식재료를 찍으면 AI가 인식해요</p>
            <p className="text-xs text-gray-300 mt-1">최대 10MB · JPG, PNG, WebP</p>
          </div>
          <div className="flex gap-3">
            <span className="flex items-center gap-1.5 px-4 py-2 bg-mint text-white rounded-xl text-sm font-medium shadow-sm shadow-mint/30">
              <Camera size={14} />
              사진 촬영
            </span>
            <span className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium">
              <Upload size={14} />
              파일 선택
            </span>
          </div>
        </div>
      )}

      {!isProcessing && preview && (
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={14} />
          다시 촬영
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}
