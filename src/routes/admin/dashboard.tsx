import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Share2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useI18n } from '@/i18n'
import { getAdminAccessStatus, signOutAdmin } from '@/lib/admin-auth'

export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: async () => {
    const status = await getAdminAccessStatus()

    if (!status.isAdmin) {
      throw redirect({
        to: '/admin/login',
        search: { error: 'access_denied' },
      })
    }
  },
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const navigate = useNavigate()
  const { language, isRTL } = useI18n()

  const sections = [
    ['projects', 'المشاريع', 'Projects', 'إدارة المشاريع وإضافة وتعديل وحذف المحتوى.', 'Create, edit, and delete portfolio projects.', '/admin/projects'],
    ['skills', 'المهارات', 'Skills', 'إدارة المهارات وإضافة وتعديل وحذف المحتوى.', 'Create, edit, and delete portfolio skills.', '/admin/skills'],
    ['services', 'الخدمات', 'Services', 'إدارة الخدمات وإضافة وتعديل وحذف المحتوى.', 'Create, edit, and delete portfolio services.', '/admin/services'],
    ['experiences', 'الخبرات', 'Experiences', 'إدارة الخبرات المهنية وإضافة وتعديل وحذف المحتوى.', 'Create, edit, and delete professional experiences.', '/admin/experiences'],
    ['process', 'خطوات العمل', 'Process', 'إدارة خطوات وآلية تنفيذ المشاريع.', 'Manage portfolio process steps.', '/admin/process'],
    ['messages', 'الرسائل', 'Messages', 'عرض رسائل التواصل وإدارتها.', 'View and manage contact messages.', '/admin/messages'],
    ['settings', 'الإعدادات', 'Settings', 'إدارة النصوص والقيم العامة للموقع.', 'Manage general portfolio settings.', '/admin/settings'],
    ['social', 'روابط التواصل', 'Social Links', 'إدارة روابط وأيقونات وسائل التواصل الاجتماعي.', 'Manage social media links and icons.', '/admin/social-links'],
  ] as const

  const handleLogout = async () => {
    await signOutAdmin()
    await navigate({ to: '/admin/login' })
  }

  return (
    <div
      className="min-h-screen bg-background px-4 py-10 text-foreground"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'لوحة الإدارة' : 'Admin dashboard'}
              </p>

              <CardTitle className="mt-2 text-3xl">
                {language === 'ar' ? 'مرحبًا بك' : 'Welcome back'}
              </CardTitle>

              <CardDescription className="mt-2">
                {language === 'ar'
                  ? 'إدارة محتوى الموقع بالكامل من مكان واحد.'
                  : 'Manage all portfolio content from one place.'}
              </CardDescription>
            </div>

            <Button variant="outline" onClick={handleLogout}>
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sections.map(([key, titleAr, titleEn, descAr, descEn, route]) => (
            <Card key={key} className="flex h-full flex-col">
              <CardHeader>
                {key === 'social' ? (
                  <span className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Share2 className="size-5" />
                  </span>
                ) : null}

                <CardTitle>{language === 'ar' ? titleAr : titleEn}</CardTitle>
                <CardDescription>{language === 'ar' ? descAr : descEn}</CardDescription>
              </CardHeader>

              <CardContent className="mt-auto">
                <Button
                  className="w-full"
                  onClick={() => navigate({ to: route as any })}
                >
                  {language === 'ar'
                    ? `إدارة ${titleAr}`
                    : `Manage ${titleEn.toLowerCase()}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ar' ? 'الإجراءات السريعة' : 'Quick actions'}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-3">
            {sections.map(([key, titleAr, titleEn, , , route]) => (
              <Button
                key={key}
                variant="secondary"
                onClick={() => navigate({ to: route as any })}
              >
                {key === 'social' ? <Share2 className="size-4" /> : null}
                {language === 'ar'
                  ? `إدارة ${titleAr}`
                  : `Manage ${titleEn.toLowerCase()}`}
              </Button>
            ))}

            <Button variant="outline" onClick={handleLogout}>
              {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}