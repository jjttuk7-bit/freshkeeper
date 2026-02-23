import { z } from 'zod'

export const ingredientCreateSchema = z.object({
  name: z.string().min(1, '식재료명을 입력해주세요'),
  category: z.enum(['vegetable', 'meat', 'seafood', 'dairy', 'grain', 'sauce', 'fruit', 'other']),
  storageType: z.enum(['fridge', 'freezer', 'room']),
  expiryDate: z.string().min(1, '유통기한을 입력해주세요'),
  quantity: z.number().positive().default(1),
  unit: z.string().default('개'),
  memo: z.string().optional(),
  imageUrl: z.string().optional(),
  purchasePrice: z.number().int().positive().optional(),
})

export const ingredientUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(['vegetable', 'meat', 'seafood', 'dairy', 'grain', 'sauce', 'fruit', 'other']).optional(),
  storageType: z.enum(['fridge', 'freezer', 'room']).optional(),
  expiryDate: z.string().optional(),
  freshnessStatus: z.enum(['fresh', 'caution', 'urgent', 'expired']).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  memo: z.string().optional(),
})

export const shoppingItemCreateSchema = z.object({
  name: z.string().min(1, '항목명을 입력해주세요'),
  quantity: z.number().positive().default(1),
  unit: z.string().default('개'),
  category: z.string().optional(),
  estimatedPrice: z.number().int().positive().optional(),
  sourceRecipeId: z.string().optional(),
})

export const chefMessageSchema = z.object({
  message: z.string().min(1, '메시지를 입력해주세요'),
  context: z.object({
    ingredients: z.array(z.object({
      name: z.string(),
      daysLeft: z.number(),
      category: z.string(),
    })).optional(),
  }).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(4, '비밀번호는 4자 이상이어야 합니다'),
})

export const signupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(4, '비밀번호는 4자 이상이어야 합니다'),
  name: z.string().min(1, '이름을 입력해주세요'),
})

export const familyInviteSchema = z.object({
  inviteCode: z.string().min(1, '초대 코드를 입력해주세요'),
})
