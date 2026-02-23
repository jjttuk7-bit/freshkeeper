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
import { Refrigerator, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'

const signupSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 해요').max(20, '이름은 20자 이하여야 해요'),
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z
    .string()
    .min(6, '비밀번호는 6자 이상이어야 해요')
    .max(100, '비밀번호가 너무 길어요'),
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

      // Auto sign-in after signup
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
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Header */}
      <div className="bg-gradient-to-br from-mint to-mint-dark px-6 pb-10 pt-16 text-center">
        <div className="mb-3 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg">
            <Refrigerator className="h-8 w-8 text-mint" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white">FreshKeeper</h1>
        <p className="mt-1 text-sm text-white/80">무료로 시작하세요</p>
      </div>

      {/* Form Card */}
      <div className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-navy">회원가입</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-navy">
                이름
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  className="pl-10"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-accent-red">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-navy">
                이메일
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-accent-red">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-navy">
                비밀번호
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="6자 이상 입력하세요"
                  className="pl-10"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-accent-red">{errors.password.message}</p>
              )}
            </div>

            {/* Benefits */}
            <div className="rounded-xl bg-mint-light p-3">
              <p className="mb-2 text-xs font-semibold text-mint">무료 플랜 혜택</p>
              {[
                '식재료 최대 50개 등록',
                'AI 사진 인식 월 10회',
                '유통기한 알림 무료',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3 w-3 text-mint" />
                  <span className="text-xs text-navy/70">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-accent-red" />
                <p className="text-sm text-accent-red">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-mint py-5 text-base font-bold text-white hover:bg-mint-dark disabled:opacity-50"
            >
              {isLoading ? '가입 중...' : '무료로 시작하기'}
            </Button>
          </form>
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-semibold text-mint hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
