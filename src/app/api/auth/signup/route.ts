import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const signupSchema = z.object({
  name: z.string().min(2).max(20),
  email: z.string().email(),
  password: z.string().min(6).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '입력값이 올바르지 않아요' },
        },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'EMAIL_EXISTS', message: '이미 사용 중인 이메일이에요' },
        },
        { status: 409 }
      )
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        provider: 'credentials',
      },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    )
  } catch (err) {
    console.error('[signup]', err)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'SERVER_ERROR', message: '서버 오류가 발생했어요' },
      },
      { status: 500 }
    )
  }
}
