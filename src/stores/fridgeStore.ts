'use client'

import { create } from 'zustand'
import type { StorageType, IngredientCategory } from '@/types/ingredient'

interface FridgeState {
  storageFilter: StorageType | 'all'
  categoryFilter: IngredientCategory | 'all'
  searchQuery: string
  sortBy: 'expiry' | 'name' | 'category' | 'registered'
  setStorageFilter: (filter: StorageType | 'all') => void
  setCategoryFilter: (filter: IngredientCategory | 'all') => void
  setSearchQuery: (query: string) => void
  setSortBy: (sort: 'expiry' | 'name' | 'category' | 'registered') => void
}

export const useFridgeStore = create<FridgeState>((set) => ({
  storageFilter: 'all',
  categoryFilter: 'all',
  searchQuery: '',
  sortBy: 'expiry',
  setStorageFilter: (filter) => set({ storageFilter: filter }),
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
}))
