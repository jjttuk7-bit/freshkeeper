'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useNotifications'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Button } from '@/components/ui/button'
import {
  LogOut,
  Bell,
  BellRing,
  User,
  ChefHat,
  Crown,
  Shield,
  Heart,
  CheckCircle,
} from 'lucide-react'

const COOKING_LEVELS = [
  { value: 'beginner', label: '입문자', emoji: '🌱' },
  { value: 'intermediate', label: '중급자', emoji: '🍳' },
  { value: 'advanced', label: '고급자', emoji: '👨‍🍳' },
]

const CUISINES = ['한식', '양식', '일식', '중식', '동남아', '인도식', '멕시칸', '지중해']
const RESTRICTIONS = ['채식', '비건', '할랄', '글루텐프리', '저탄수화물', '저염식', '저지방']
const ALLERGENS = ['땅콩', '갑각류', '유제품', '밀', '대두', '계란', '생선', '견과류']

const PLANS = [
  { value: 'free', label: 'Free', desc: '식재료 50개, AI 월 10회', price: '무료', active: true },
  { value: 'plus', label: 'Plus', desc: 'AI 무제한 + 심층 분석', price: '4,900원/월', active: false },
  { value: 'family', label: 'Family', desc: '가족 공유 + 모든 기능', price: '7,900원/월', active: false },
  { value: 'premium', label: 'Premium', desc: '프리미엄 기능 전체', price: '12,900원/월', active: false },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-mint' : 'bg-gray-200'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function TagButton({
  label,
  selected,
  onClick,
  activeClass,
}: {
  label: string
  selected: boolean
  onClick: () => void
  activeClass: string
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-3.5 py-2 text-sm transition-all ${
        selected ? activeClass : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [cookingLevel, setCookingLevel] = useState('beginner')
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(['한식'])
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([])
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([])
  const { data: notifPrefs } = useNotificationPreferences()
  const updatePrefs = useUpdateNotificationPreferences()
  const push = usePushNotifications()
  const [notifications, setNotifications] = useState({
    expiry: true,
    weekly: true,
    recipe: false,
    shopping: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Sync from server preferences
  useEffect(() => {
    if (notifPrefs) {
      setNotifications({
        expiry: notifPrefs.expiry,
        weekly: notifPrefs.weekly,
        recipe: notifPrefs.recipe,
        shopping: notifPrefs.shopping,
      })
    }
  }, [notifPrefs])

  const toggle = (list: string[], item: string, setter: (v: string[]) => void) =>
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updatePrefs.mutateAsync(notifications)
    } catch {
      // silent
    }
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const userName = session?.user?.name ?? '사용자'
  const userEmail = session?.user?.email ?? ''
  const userInitial = (session?.user?.name ?? session?.user?.email ?? '?')[0].toUpperCase()

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-navy">설정</h1>
      </div>

      <div className="px-5 pb-8 flex flex-col gap-4 animate-stagger">
        {/* Profile */}
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2.5">
            <User className="h-4 w-4 text-mint" />
            <h2 className="text-sm font-bold text-navy">프로필</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-xl font-bold text-white">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-navy truncate">{userName}</p>
              <p className="text-sm text-gray-400 truncate">{userEmail}</p>
              <span className="mt-1 inline-block rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-500">
                Free 플랜
              </span>
            </div>
          </div>
        </section>

        {/* Cooking level */}
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2.5">
            <ChefHat className="h-4 w-4 text-mint" />
            <h2 className="text-sm font-bold text-navy">요리 수준</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {COOKING_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setCookingLevel(level.value)}
                className={`flex flex-col items-center rounded-2xl py-3.5 transition-all ${
                  cookingLevel === level.value
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <span className="mb-1 text-lg">{level.emoji}</span>
                <span className="text-xs font-medium">{level.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Preferred cuisine */}
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-bold text-navy">선호 요리</h2>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((c) => (
              <TagButton
                key={c}
                label={c}
                selected={selectedCuisines.includes(c)}
                onClick={() => toggle(selectedCuisines, c, setSelectedCuisines)}
                activeClass="bg-mint/10 text-mint font-semibold"
              />
            ))}
          </div>
        </section>

        {/* Dietary restrictions */}
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2.5">
            <Heart className="h-4 w-4 text-accent-orange" />
            <h2 className="text-sm font-bold text-navy">식이 제한</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {RESTRICTIONS.map((r) => (
              <TagButton
                key={r}
                label={r}
                selected={selectedRestrictions.includes(r)}
                onClick={() => toggle(selectedRestrictions, r, setSelectedRestrictions)}
                activeClass="bg-accent-orange/10 text-accent-orange font-semibold"
              />
            ))}
          </div>
        </section>

        {/* Allergies */}
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-accent-red" />
            <h2 className="text-sm font-bold text-navy">알레르기</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS.map((a) => (
              <TagButton
                key={a}
                label={a}
                selected={selectedAllergens.includes(a)}
                onClick={() => toggle(selectedAllergens, a, setSelectedAllergens)}
                activeClass="bg-accent-red/10 text-accent-red font-semibold"
              />
            ))}
          </div>
          {selectedAllergens.length > 0 && (
            <p className="mt-3 text-xs text-gray-400">
              선택한 알레르기 재료는 레시피 추천에서 제외돼요
            </p>
          )}
        </section>

        {/* Notifications */}
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2.5">
            <Bell className="h-4 w-4 text-accent-blue" />
            <h2 className="text-sm font-bold text-navy">알림 설정</h2>
          </div>
          <div className="flex flex-col gap-5">
            {[
              { key: 'expiry' as const, label: '유통기한 알림', desc: 'D-3, D-1 만료 임박 알림' },
              { key: 'weekly' as const, label: '주간 요약', desc: '매주 월요일 냉장고 현황 리포트' },
              { key: 'recipe' as const, label: '레시피 추천', desc: '맞춤 레시피 푸시 알림' },
              { key: 'shopping' as const, label: '장보기 알림', desc: '공유 장보기 목록 업데이트' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-navy">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <Toggle
                  checked={notifications[item.key]}
                  onChange={() => setNotifications((p) => ({ ...p, [item.key]: !p[item.key] }))}
                />
              </div>
            ))}
          </div>

          {/* Push notification toggle */}
          {push.isSupported && (
            <div className="mt-5 border-t border-gray-50 pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BellRing className="h-4 w-4 text-accent-purple" />
                  <div>
                    <p className="text-sm font-medium text-navy">푸시 알림</p>
                    <p className="text-xs text-gray-400">
                      {push.permission === 'denied'
                        ? '브라우저에서 알림이 차단되었어요'
                        : push.isSubscribed
                          ? '브라우저 푸시 알림이 켜져있어요'
                          : '브라우저 푸시 알림을 받으세요'}
                    </p>
                  </div>
                </div>
                {push.permission === 'denied' ? (
                  <span className="text-xs text-gray-400">차단됨</span>
                ) : (
                  <Toggle
                    checked={push.isSubscribed}
                    onChange={() => {
                      if (push.isSubscribed) {
                        push.unsubscribe()
                      } else {
                        push.subscribe()
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </section>

        {/* Plan */}
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2.5">
            <Crown className="h-4 w-4 text-accent-yellow" />
            <h2 className="text-sm font-bold text-navy">구독 플랜</h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {PLANS.map((plan) => (
              <div key={plan.value} className={`rounded-2xl p-4 ${plan.active ? 'bg-mint/5' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {plan.active && <CheckCircle className="h-4 w-4 text-mint" />}
                    <div>
                      <span className="text-sm font-bold text-navy">{plan.label}</span>
                      <span className="ml-2 text-xs text-gray-400">{plan.desc}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-navy">{plan.price}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-2xl bg-navy py-3 text-sm font-semibold text-white active:scale-[0.98] transition-transform">
            플랜 업그레이드
          </button>
        </section>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-2xl bg-mint py-4 text-[15px] font-semibold text-white shadow-lg shadow-mint/20 hover:bg-mint-dark active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {saved ? (
            <><CheckCircle className="mr-2 h-5 w-5" /> 저장됨!</>
          ) : isSaving ? (
            '저장 중...'
          ) : (
            '설정 저장'
          )}
        </Button>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full rounded-2xl py-3.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-50 hover:text-accent-red"
        >
          <LogOut className="mr-2 inline h-4 w-4" /> 로그아웃
        </button>

        <p className="text-center text-xs text-gray-300">FreshKeeper v1.0.0</p>
      </div>
    </div>
  )
}
