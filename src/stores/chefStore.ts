'use client'

import { create } from 'zustand'
import type { Recipe } from '@/types/recipe'

interface ChefState {
  recipes: Map<string, Recipe>
  addRecipes: (recipes: Recipe[]) => void
  getRecipe: (id: string) => Recipe | undefined
}

export const useChefStore = create<ChefState>((set, get) => ({
  recipes: new Map(),
  addRecipes: (recipes) =>
    set((s) => {
      const next = new Map(s.recipes)
      for (const r of recipes) {
        next.set(r.id, r)
      }
      return { recipes: next }
    }),
  getRecipe: (id) => get().recipes.get(id),
}))
