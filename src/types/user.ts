export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  householdSize: number
  dietaryRestrictions: string[]
  allergies: string[]
  preferredCuisine: string[]
  cookingLevel: 'beginner' | 'intermediate' | 'advanced'
  plan: 'free' | 'plus' | 'family' | 'premium'
  createdAt: string
  updatedAt: string
}

export interface Family {
  id: string
  ownerId: string
  name: string
  inviteCode: string
  members: FamilyMember[]
  createdAt: string
}

export interface FamilyMember {
  familyId: string
  userId: string
  role: 'owner' | 'member'
  joinedAt: string
  user?: Pick<User, 'id' | 'name' | 'email' | 'image'>
}

export interface Notification {
  id: string
  userId: string
  type: string
  ingredientId: string | null
  title: string
  body: string
  payload: Record<string, unknown> | null
  scheduledAt: string
  sentAt: string | null
  readAt: string | null
  status: 'pending' | 'sent' | 'read' | 'failed'
  createdAt: string
}

export interface NotificationPreferences {
  expiry: boolean
  weekly: boolean
  recipe: boolean
  shopping: boolean
}
