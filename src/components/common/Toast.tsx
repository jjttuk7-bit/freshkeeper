'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

export const ToastContainer = () => {
  const { toasts, removeToast } = useUiStore()

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

const ToastItem = ({
  id,
  message,
  type,
  onClose,
}: {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
}) => {
  const Icon = icons[type]

  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg animate-in slide-in-from-right',
        styles[type]
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} className="shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
