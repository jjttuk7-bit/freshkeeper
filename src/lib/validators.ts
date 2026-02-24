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
  purchasePrice: z.number().int().nonnegative().optional(),
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

export const bulkIngredientCreateSchema = z.object({
  items: z.array(z.object({
    name: z.string().min(1, '식재료명을 입력해주세요'),
    category: z.string().optional(),
    storageType: z.enum(['fridge', 'freezer', 'room']).optional(),
    quantity: z.number().positive().optional(),
    unit: z.string().optional(),
  })).min(1, '최소 1개의 항목이 필요합니다').max(50, '최대 50개까지 등록할 수 있습니다'),
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

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('올바른 endpoint URL이 필요합니다'),
  p256dh: z.string().min(1, 'p256dh 키가 필요합니다'),
  auth: z.string().min(1, 'auth 키가 필요합니다'),
})

export const notificationPreferencesSchema = z.object({
  expiry: z.boolean().optional(),
  weekly: z.boolean().optional(),
  recipe: z.boolean().optional(),
  shopping: z.boolean().optional(),
})
