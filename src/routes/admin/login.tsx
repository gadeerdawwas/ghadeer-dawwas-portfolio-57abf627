import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/i18n'
import { getAdminAccessStatus, signOutAdmin } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/admin/login')({
  component: AdminLoginPage,
})

function AdminLoginPage() {
  const navigate = useNavigate()
  const { language, isRTL, t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const redirectIfAuthorized = async () => {
      const status = await getAdminAccessStatus()
      if (status.isAdmin) {
        await navigate({ to: '/admin/dashboard' })
      }
    }

    void redirectIfAuthorized()
  }, [navigate])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === 'access_denied') {
      setMessage(language === 'ar' ? 'تم رفض الوصول. يرجى استخدام حساب مسؤول نشط.' : 'Access denied. Please use an active admin account.')
    }
  }, [language])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Invalid email or password.')
      setLoading(false)
      return
    }

    if (!data.user) {
      setMessage(language === 'ar' ? 'تعذر إكمال تسجيل الدخول.' : 'Unable to complete sign in.')
      setLoading(false)
      return
    }

    const status = await getAdminAccessStatus()

    if (!status.isAdmin) {
      await signOutAdmin()
      setMessage(language === 'ar' ? 'تم رفض الوصول. هذا الحساب ليس مسؤولًا نشطًا.' : 'Access denied. This account is not an active admin.')
      setLoading(false)
      return
    }

    await navigate({ to: '/admin/dashboard' })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {language === 'ar' ? 'لوحة الإدارة' : 'Admin access'}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {language === 'ar' ? 'تسجيل الدخول' : 'Admin login'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {language === 'ar'
              ? 'استخدم بيانات المسؤول للوصول إلى لوحة الإدارة.'
              : 'Use your admin credentials to access the dashboard.'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</CardTitle>
            <CardDescription>
              {language === 'ar' ? 'البيانات محفوظة في Supabase Auth.' : 'Credentials are handled through Supabase Auth.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={language === 'ar' ? 'admin@example.com' : 'admin@example.com'}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{language === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                  required
                />
              </div>

              {message ? (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {message}
                </p>
              ) : null}

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? (language === 'ar' ? 'جارٍ تسجيل الدخول…' : 'Signing in…') : language === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          {language === 'ar' ? 'العودة إلى' : 'Back to'}{' '}
          <a className="font-medium text-primary hover:underline" href="/">
            {t('nav.home')}
          </a>
        </p>
      </div>
    </div>
  )
}
