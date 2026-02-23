'use client'

import { create } from 'zustand'

interface UiState {
  isSidebarOpen: boolean
  activeTab: string
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[]
  toggleSidebar: () => void
  setActiveTab: (tab: string) => void
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void
  removeToast: (id: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  activeTab: 'fridge',
  toasts: [],
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addToast: (message, type = 'info') =>
    set((s) => ({
      toasts: [...s.toasts, { id: Date.now().toString(), message, type }],
    })),
  removeToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),
}))
