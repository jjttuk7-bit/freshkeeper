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
import { Refrigerator, Mail, Lock, AlertCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('이메일 또는 비밀번호가 올바르지 않아요')
      } else {
        router.push('/fridge')
        router.refresh()
      }
    } catch {
      setError('로그인 중 오류가 발생했어요. 다시 시도해주세요')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError(null)
    const result = await signIn('credentials', {
      email: 'demo@freshkeeper.kr',
      password: 'demo1234',
      redirect: false,
    })
    if (result?.error) {
      setError('데모 계정 로그인에 실패했어요')
      setIsLoading(false)
    } else {
      router.push('/fridge')
      router.refresh()
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
        <p className="mt-1 text-sm text-white/80">로그인하고 냉장고를 관리하세요</p>
      </div>

      {/* Form Card */}
      <div className="mx-auto w-full max-w-md flex-1 px-6 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-navy">로그인</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                  placeholder="비밀번호를 입력하세요"
                  className="pl-10"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-accent-red">{errors.password.message}</p>
              )}
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
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">또는</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Demo Login */}
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full rounded-xl border-2 border-dashed border-mint/40 bg-mint-light py-3 text-sm font-medium text-mint transition-colors hover:bg-mint/10 disabled:opacity-50"
          >
            데모 계정으로 체험하기
            <span className="ml-2 text-xs text-mint/70">demo@freshkeeper.kr</span>
          </button>
        </div>

        {/* Signup link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="font-semibold text-mint hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
