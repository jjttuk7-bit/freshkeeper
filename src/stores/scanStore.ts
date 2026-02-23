'use client'

import { create } from 'zustand'
import type { RecognizedIngredient } from '@/lib/ai/vision'

interface ScanState {
  recognizedItems: RecognizedIngredient[]
  isProcessing: boolean
  setRecognizedItems: (items: RecognizedIngredient[]) => void
  setIsProcessing: (processing: boolean) => void
  clearScan: () => void
}

export const useScanStore = create<ScanState>((set) => ({
  recognizedItems: [],
  isProcessing: false,
  setRecognizedItems: (items) => set({ recognizedItems: items }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  clearScan: () => set({ recognizedItems: [], isProcessing: false }),
}))
