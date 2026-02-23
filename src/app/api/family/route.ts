import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api'

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()

    // Return the family the user belongs to (as owner or member)
    const membership = await prisma.familyMember.findFirst({
      where: { userId: user.id },
      include: {
        family: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true, image: true } } },
            },
            owner: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    })

    if (!membership) {
      return successResponse(null)
    }

    return successResponse(membership.family)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { action } = body as { action?: string }

    if (action === 'create') {
      // Check the user doesn't already own a family
      const existing = await prisma.family.findFirst({ where: { ownerId: user.id } })
      if (existing) {
        return errorResponse('CONFLICT', '이미 가족 그룹을 소유하고 있습니다', 409)
      }

      const name: string = body.name ?? '우리 가족'

      const family = await prisma.family.create({
        data: {
          ownerId: user.id,
          name,
        },
      })

      // Auto-add the owner as a member with role "owner"
      await prisma.familyMember.create({
        data: { familyId: family.id, userId: user.id, role: 'owner' },
      })

      const full = await prisma.family.findUnique({
        where: { id: family.id },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
          },
          owner: { select: { id: true, name: true, email: true, image: true } },
        },
      })

      return successResponse(full)
    }

    if (action === 'join') {
      const { inviteCode } = body as { inviteCode?: string }
      if (!inviteCode || typeof inviteCode !== 'string') {
        return errorResponse('VALIDATION_ERROR', '초대 코드가 필요합니다', 400)
      }

      const family = await prisma.family.findUnique({ where: { inviteCode } })
      if (!family) {
        return errorResponse('NOT_FOUND', '유효하지 않은 초대 코드입니다', 404)
      }

      // Check already a member
      const alreadyMember = await prisma.familyMember.findUnique({
        where: { familyId_userId: { familyId: family.id, userId: user.id } },
      })
      if (alreadyMember) {
        return errorResponse('CONFLICT', '이미 이 가족 그룹의 멤버입니다', 409)
      }

      await prisma.familyMember.create({
        data: { familyId: family.id, userId: user.id, role: 'member' },
      })

      const full = await prisma.family.findUnique({
        where: { id: family.id },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
          },
          owner: { select: { id: true, name: true, email: true, image: true } },
        },
      })

      return successResponse(full)
    }

    if (action === 'leave') {
      const membership = await prisma.familyMember.findFirst({
        where: { userId: user.id },
      })

      if (!membership) {
        return errorResponse('NOT_FOUND', '속한 가족 그룹이 없습니다', 404)
      }

      // Owner cannot leave — they must delete the family
      if (membership.role === 'owner') {
        return errorResponse(
          'FORBIDDEN',
          '가족 그룹 소유자는 탈퇴할 수 없습니다. 가족 그룹을 삭제하거나 소유권을 이전해주세요',
          403
        )
      }

      await prisma.familyMember.delete({
        where: {
          familyId_userId: { familyId: membership.familyId, userId: user.id },
        },
      })

      return successResponse({ left: true, familyId: membership.familyId })
    }

    return errorResponse('VALIDATION_ERROR', 'action은 create, join, leave 중 하나이어야 합니다', 400)
  } catch (error) {
    return handleApiError(error)
  }
}
