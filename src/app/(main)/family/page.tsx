'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Users, Copy, UserPlus, LogOut, CheckCircle, Share2 } from 'lucide-react'

interface FamilyMember {
  userId: string
  role: string
  user?: { name: string | null; email: string }
}

interface FamilyData {
  id: string
  name: string
  inviteCode: string
  members: FamilyMember[]
}

export default function FamilyPage() {
  const [family, setFamily] = useState<FamilyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/family')
      .then((r) => r.json())
      .then((json) => { if (json.success && json.data) setFamily(json.data) })
      .finally(() => setLoading(false))
  }, [])

  const createFamily = async () => {
    setIsCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' }),
      })
      const json = await res.json()
      if (json.success) setFamily(json.data)
      else setError(json.error?.message ?? '가족 생성에 실패했어요')
    } finally {
      setIsCreating(false)
    }
  }

  const joinFamily = async () => {
    if (!inviteCode.trim()) return
    setIsJoining(true)
    setError(null)
    try {
      const res = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', inviteCode: inviteCode.trim() }),
      })
      const json = await res.json()
      if (json.success) { setFamily(json.data); setInviteCode('') }
      else setError(json.error?.message ?? '참가에 실패했어요. 초대 코드를 확인해주세요')
    } finally {
      setIsJoining(false)
    }
  }

  const leaveFamily = async () => {
    if (!confirm('가족 그룹에서 나가시겠어요?')) return
    await fetch('/api/family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'leave' }),
    })
    setFamily(null)
  }

  const copyCode = () => {
    if (!family) return
    navigator.clipboard.writeText(family.inviteCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const getInitial = (member: FamilyMember) =>
    (member.user?.name ?? member.user?.email ?? '?')[0].toUpperCase()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold text-navy">가족 공유</h1>
        <p className="mt-0.5 text-sm text-gray-400">냉장고와 장보기 목록을 함께 관리하세요</p>
      </div>

      <div className="px-4 pb-6">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-accent-red">{error}</div>
        )}

        {family ? (
          <div className="flex flex-col gap-4">
            {/* Family info */}
            <div className="rounded-2xl bg-gradient-to-br from-navy to-navy-light p-5 text-white">
              <div className="mb-1 flex items-center gap-2">
                <Users className="h-5 w-5 text-mint" />
                <span className="text-sm text-white/70">가족 그룹</span>
              </div>
              <h2 className="mb-3 text-xl font-bold">{family.name}</h2>
              <p className="mb-1 text-xs text-white/60">멤버 {family.members.length}명</p>
              <div className="flex -space-x-2">
                {family.members.slice(0, 5).map((m) => (
                  <div
                    key={m.userId}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-navy bg-mint text-sm font-bold text-white"
                  >
                    {getInitial(m)}
                  </div>
                ))}
                {family.members.length > 5 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-navy bg-white/10 text-xs text-white">
                    +{family.members.length - 5}
                  </div>
                )}
              </div>
            </div>

            {/* Invite code */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Share2 className="h-4 w-4 text-mint" />
                <p className="font-semibold text-navy">초대 코드</p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-mint-light p-3">
                <code className="flex-1 font-mono text-sm font-bold tracking-widest text-mint">
                  {family.inviteCode}
                </code>
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 rounded-lg bg-mint px-3 py-1.5 text-xs font-medium text-white hover:bg-mint-dark"
                >
                  {copied ? (
                    <><CheckCircle className="h-3 w-3" /> 복사됨</>
                  ) : (
                    <><Copy className="h-3 w-3" /> 복사</>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                이 코드를 가족에게 공유하면 같은 냉장고를 관리할 수 있어요
              </p>
            </div>

            {/* Members list */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-3 font-semibold text-navy">구성원 ({family.members.length})</p>
              <div className="flex flex-col gap-3">
                {family.members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mint/10 text-base font-bold text-mint">
                      {getInitial(member)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-navy truncate">
                        {member.user?.name ?? '사용자'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{member.user?.email}</p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        member.role === 'owner'
                          ? 'bg-mint-light text-mint'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {member.role === 'owner' ? '관리자' : '구성원'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={leaveFamily}
              variant="outline"
              className="w-full rounded-xl border-accent-red/30 py-4 text-accent-red hover:bg-accent-red/5"
            >
              <LogOut className="mr-2 h-4 w-4" /> 가족 나가기
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Empty state */}
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-mint/10">
                <Users className="h-10 w-10 text-mint" />
              </div>
              <p className="font-semibold text-navy">가족 그룹이 없어요</p>
              <p className="mt-1 text-sm text-gray-400">
                가족을 만들거나 초대 코드로 참가하세요
              </p>
            </div>

            {/* Create family */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-2 font-semibold text-navy">새 가족 만들기</p>
              <p className="mb-4 text-sm text-gray-500">
                가족 그룹을 만들고 초대 코드로 가족을 초대하세요
              </p>
              <Button
                onClick={createFamily}
                disabled={isCreating}
                className="w-full rounded-xl bg-mint py-4 text-base font-bold text-white hover:bg-mint-dark disabled:opacity-50"
              >
                {isCreating ? '만드는 중...' : '새 가족 만들기'}
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">또는</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Join family */}
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="mb-2 font-semibold text-navy">초대 코드로 참가</p>
              <p className="mb-4 text-sm text-gray-500">
                가족에게 받은 초대 코드를 입력하세요
              </p>
              <div className="flex gap-2">
                <Input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="초대 코드 입력"
                  className="flex-1 font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && joinFamily()}
                />
                <Button
                  onClick={joinFamily}
                  disabled={!inviteCode.trim() || isJoining}
                  className="rounded-xl bg-navy px-4 text-white hover:bg-navy-light disabled:opacity-50"
                >
                  <UserPlus className="mr-1 h-4 w-4" />
                  {isJoining ? '...' : '참가'}
                </Button>
              </div>
            </div>

            {/* Benefits */}
            <div className="rounded-2xl bg-mint-light p-4">
              <p className="mb-2 text-sm font-semibold text-mint">가족 공유 혜택</p>
              {[
                '냉장고 식재료 함께 관리',
                '장보기 목록 실시간 공유',
                '가족 식비 통합 분석',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 py-0.5">
                  <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-mint" />
                  <span className="text-sm text-navy/70">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
