'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Refrigerator, AlertCircle, CheckCircle } from 'lucide-react'

const signupSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 해요').max(20, '이름은 20자 이하여야 해요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 해요').max(100, '비밀번호가 너무 길어요'),
})

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error?.message ?? '회원가입에 실패했어요')
        return
      }
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        setError('회원가입은 완료됐지만 로그인에 실패했어요. 로그인 페이지로 이동하세요')
      } else {
        router.push('/fridge')
        router.refresh()
      }
    } catch {
      setError('오류가 발생했어요. 다시 시도해주세요')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="px-6 pb-8 pt-20 text-center">
        <div className="mb-5 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/10">
            <Refrigerator className="h-7 w-7 text-mint" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">시작하기</h1>
        <p className="mt-2 text-sm text-gray-400">무료로 냉장고를 스마트하게</p>
      </div>

      {/* Form */}
      <div className="mx-auto w-full max-w-md flex-1 px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-navy">이름</Label>
            <Input
              type="text"
              placeholder="이름을 입력하세요"
              className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-accent-red">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-navy">이메일</Label>
            <Input
              type="email"
              placeholder="이메일을 입력하세요"
              className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-accent-red">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-navy">비밀번호</Label>
            <Input
              type="password"
              placeholder="6자 이상 입력하세요"
              className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-accent-red">{errors.password.message}</p>}
          </div>

          {/* Benefits */}
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="mb-2.5 text-xs font-semibold text-gray-500">무료 플랜 혜택</p>
            {['식재료 최대 50개 등록', 'AI 사진 인식 월 10회', '유통기한 알림 무료'].map((b) => (
              <div key={b} className="flex items-center gap-2 py-0.5">
                <CheckCircle className="h-3.5 w-3.5 text-mint" />
                <span className="text-xs text-gray-500">{b}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-accent-red" />
              <p className="text-sm text-accent-red">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-2xl bg-mint py-4 text-[15px] font-semibold text-white shadow-lg shadow-mint/20 active:scale-[0.98] transition-transform hover:bg-mint-dark disabled:opacity-50"
          >
            {isLoading ? '가입 중...' : '무료로 시작하기'}
          </Button>
        </form>

        <p className="mt-8 pb-10 text-center text-sm text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-semibold text-mint">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
