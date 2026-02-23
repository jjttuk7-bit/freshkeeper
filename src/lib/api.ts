import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './auth'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
  meta?: { page?: number; total?: number; timestamp: string }
}

export function successResponse<T>(data: T, meta?: { page?: number; total?: number }): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    meta: { ...meta, timestamp: new Date().toISOString() },
  })
}

export function errorResponse(code: string, message: string, status = 400): NextResponse {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  )
}

export async function getAuthUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return session.user as { id: string; email: string; name?: string | null }
}

export async function requireAuth() {
  const user = await getAuthUser()
  if (!user) {
    throw new AuthError()
  }
  return user
}

export class AuthError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'AuthError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return errorResponse('UNAUTHORIZED', '로그인이 필요합니다', 401)
  }
  console.error('API Error:', error)
  return errorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다', 500)
}
