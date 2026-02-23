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
import { Refrigerator, AlertCircle } from 'lucide-react'

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
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="px-6 pb-8 pt-20 text-center">
        <div className="mb-5 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/10">
            <Refrigerator className="h-7 w-7 text-mint" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">다시 오셨군요</h1>
        <p className="mt-2 text-sm text-gray-400">로그인하고 냉장고를 관리하세요</p>
      </div>

      {/* Form */}
      <div className="mx-auto w-full max-w-md flex-1 px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
              placeholder="비밀번호를 입력하세요"
              className="rounded-2xl border-0 bg-gray-50 px-4 py-3.5 text-[15px] focus:bg-white focus:ring-2 focus:ring-mint/20"
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-accent-red">{errors.password.message}</p>}
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
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-100" />
          <span className="text-xs text-gray-300">또는</span>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        {/* Demo Login */}
        <button
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full rounded-2xl border-2 border-gray-100 py-3.5 text-[15px] font-semibold text-gray-500 transition-colors hover:border-mint/30 hover:bg-mint/5 disabled:opacity-50 active:scale-[0.98]"
        >
          데모 계정으로 체험하기
        </button>

        {/* Signup link */}
        <p className="mt-8 pb-10 text-center text-sm text-gray-400">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="font-semibold text-mint">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
