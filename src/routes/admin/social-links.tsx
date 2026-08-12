import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useI18n } from '@/i18n'
import { supabase } from '@/lib/supabase'

type SocialLinkRow = {
  id: string
  platform: string
  label_en: string
  label_ar: string
  url: string
  icon: string | null
  display_order: number
  is_active: boolean
}

type SocialLinkFormState = {
  platform: string
  label_en: string
  label_ar: string
  url: string
  icon: string
  display_order: string
  is_active: boolean
}

const createEmptyFormState = (): SocialLinkFormState => ({
  platform: '',
  label_en: '',
  label_ar: '',
  url: '',
  icon: '',
  display_order: '0',
  is_active: true,
})

export const Route = createFileRoute('/admin/social-links')({
  component: AdminSocialLinksPage,
})

function AdminSocialLinksPage() {
  const navigate = useNavigate()
  const { language, isRTL } = useI18n()

  const [checkingAccess, setCheckingAccess] = useState(true)
  const [links, setLinks] = useState<SocialLinkRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<SocialLinkFormState>(createEmptyFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [linkToDelete, setLinkToDelete] = useState<SocialLinkRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadLinks = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('social_links')
      .select('id,platform,label_en,label_ar,url,icon,display_order,is_active')
      .order('display_order', { ascending: true })
      .order('platform', { ascending: true })

    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر تحميل روابط التواصل.' : 'Unable to load social links.')
      setStatusType('error')
      setLinks([])
      setLoading(false)
      return
    }

    setLinks((data as SocialLinkRow[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    const checkAccessAndLoad = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        await navigate({
          to: '/admin/login',
          search: { error: 'access_denied' },
        })
        return
      }

      const { data: adminProfile, error: profileError } = await supabase
        .from('admin_profiles')
        .select('role, is_active')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (
        profileError ||
        !adminProfile ||
        adminProfile.role !== 'admin' ||
        adminProfile.is_active !== true
      ) {
        console.error('Admin profile check failed:', profileError)
        await navigate({
          to: '/admin/login',
          search: { error: 'access_denied' },
        })
        return
      }

      setCheckingAccess(false)
      await loadLinks()
    }

    void checkAccessAndLoad()
  }, [])

  const updateField = (field: keyof SocialLinkFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
    setStatusMessage(null)
    setStatusType(null)
  }

  const resetForm = () => {
    setForm(createEmptyFormState())
    setEditingId(null)
    setStatusMessage(null)
    setStatusType(null)
  }

  const validateForm = () => {
    if (!form.platform.trim()) {
      return language === 'ar' ? 'يرجى إدخال اسم المنصة.' : 'Please enter the platform.'
    }

    if (!form.label_en.trim()) {
      return language === 'ar' ? 'يرجى إدخال الاسم بالإنجليزية.' : 'Please enter the English label.'
    }

    if (!form.label_ar.trim()) {
      return language === 'ar' ? 'يرجى إدخال الاسم بالعربية.' : 'Please enter the Arabic label.'
    }

    if (!form.url.trim()) {
      return language === 'ar'
        ? 'يرجى إدخال الرابط أو البريد الإلكتروني.'
        : 'Please enter the URL or email.'
    }

    const value = form.url.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isEmail = emailRegex.test(value)

    if (!isEmail) {
      try {
        const parsed = new URL(value)

        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return language === 'ar'
            ? 'الرابط يجب أن يبدأ بـ http أو https.'
            : 'The URL must use http or https.'
        }
      } catch {
        return language === 'ar'
          ? 'أدخلي رابطًا صحيحًا أو بريدًا إلكترونيًا صحيحًا.'
          : 'Enter a valid URL or email address.'
      }
    }

    const displayOrder = Number(form.display_order)
    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      return language === 'ar' ? 'يرجى إدخال ترتيب عرض صحيح.' : 'Please enter a valid display order.'
    }

    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatusMessage(null)
    setStatusType(null)

    const validationMessage = validateForm()
    if (validationMessage) {
      setStatusMessage(validationMessage)
      setStatusType('error')
      return
    }

    const payload = {
      platform: form.platform.trim(),
      label_en: form.label_en.trim(),
      label_ar: form.label_ar.trim(),
      url: form.url.trim(),
      icon: form.icon.trim() || null,
      display_order: Number(form.display_order),
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    }

    setSubmitting(true)

    if (editingId) {
      const { error } = await supabase
        .from('social_links')
        .update(payload)
        .eq('id', editingId)

      if (error) {
        setStatusMessage(language === 'ar' ? 'تعذر تحديث الرابط.' : 'Unable to update the social link.')
        setStatusType('error')
        setSubmitting(false)
        return
      }

      setStatusMessage(language === 'ar' ? 'تم تحديث الرابط بنجاح.' : 'Social link updated successfully.')
      setStatusType('success')
    } else {
      const { error } = await supabase.from('social_links').insert([payload])

      if (error) {
        setStatusMessage(language === 'ar' ? 'تعذر إنشاء الرابط.' : 'Unable to create the social link.')
        setStatusType('error')
        setSubmitting(false)
        return
      }

      setStatusMessage(language === 'ar' ? 'تم إنشاء الرابط بنجاح.' : 'Social link created successfully.')
      setStatusType('success')
    }

    setSubmitting(false)
    setEditingId(null)
    setForm(createEmptyFormState())
    await loadLinks()
  }

  const handleEdit = (link: SocialLinkRow) => {
    setEditingId(link.id)
    setForm({
      platform: link.platform,
      label_en: link.label_en,
      label_ar: link.label_ar,
      url: link.url,
      icon: link.icon ?? '',
      display_order: String(link.display_order),
      is_active: link.is_active,
    })
    setStatusMessage(null)
    setStatusType(null)
  }

  const confirmDelete = (link: SocialLinkRow) => {
    setLinkToDelete(link)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!linkToDelete) return

    setDeleting(true)

    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('id', linkToDelete.id)

    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر حذف الرابط.' : 'Unable to delete the social link.')
      setStatusType('error')
      setDeleting(false)
      setDeleteDialogOpen(false)
      setLinkToDelete(null)
      return
    }

    setStatusMessage(language === 'ar' ? 'تم حذف الرابط بنجاح.' : 'Social link deleted successfully.')
    setStatusType('success')
    setDeleting(false)
    setDeleteDialogOpen(false)
    setLinkToDelete(null)
    await loadLinks()
  }

  if (checkingAccess) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background text-foreground"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <p className="text-sm text-muted-foreground">
          {language === 'ar' ? 'جارٍ التحقق من صلاحية الوصول…' : 'Checking access…'}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {language === 'ar' ? 'روابط التواصل' : 'Social links'}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {language === 'ar' ? 'إدارة روابط التواصل' : 'Social links management'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {language === 'ar'
                ? 'أضيفي أو عدّلي روابط حساباتك التي ستظهر في الموقع.'
                : 'Add or edit the social profiles shown on the portfolio.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: '/admin/dashboard' })}>
              {language === 'ar' ? 'العودة إلى لوحة الإدارة' : 'Back to dashboard'}
            </Button>
            <Button onClick={resetForm}>
              {language === 'ar' ? 'رابط جديد' : 'New link'}
            </Button>
          </div>
        </div>

        {statusMessage ? (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              statusType === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
                : 'border-destructive/30 bg-destructive/10 text-destructive'
            }`}
          >
            {statusMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId
                  ? language === 'ar'
                    ? 'تعديل الرابط'
                    : 'Edit social link'
                  : language === 'ar'
                    ? 'إضافة رابط'
                    : 'Add social link'}
              </CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'أدخلي اسم المنصة والعناوين والرابط والأيقونة.'
                  : 'Enter the platform, labels, URL, and icon.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="platform">{language === 'ar' ? 'المنصة' : 'Platform'}</Label>
                  <Input
                    id="platform"
                    value={form.platform}
                    onChange={(event) => updateField('platform', event.target.value)}
                    placeholder="LinkedIn"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="label_en">{language === 'ar' ? 'الاسم بالإنجليزية' : 'English label'}</Label>
                    <Input
                      id="label_en"
                      value={form.label_en}
                      onChange={(event) => updateField('label_en', event.target.value)}
                      placeholder="LinkedIn"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="label_ar">{language === 'ar' ? 'الاسم بالعربية' : 'Arabic label'}</Label>
                    <Input
                      id="label_ar"
                      value={form.label_ar}
                      onChange={(event) => updateField('label_ar', event.target.value)}
                      placeholder="لينكدإن"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">{language === 'ar' ? 'الرابط' : 'URL'}</Label>
                  <Input
                    id="url"
                    type="text"
                    value={form.url}
                    onChange={(event) => updateField('url', event.target.value)}
                    placeholder="https://... أو name@example.com"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="icon">{language === 'ar' ? 'الأيقونة' : 'Icon'}</Label>
                    <Input
                      id="icon"
                      value={form.icon}
                      onChange={(event) => updateField('icon', event.target.value)}
                      placeholder="Linkedin"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_order">{language === 'ar' ? 'ترتيب العرض' : 'Display order'}</Label>
                    <Input
                      id="display_order"
                      type="number"
                      min="0"
                      step="1"
                      value={form.display_order}
                      onChange={(event) => updateField('display_order', event.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{language === 'ar' ? 'نشط' : 'Active'}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar'
                        ? 'إظهار الرابط في الواجهة العامة.'
                        : 'Show this link on the public portfolio.'}
                    </p>
                  </div>

                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => updateField('is_active', checked)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting
                      ? language === 'ar'
                        ? 'جارٍ الحفظ…'
                        : 'Saving…'
                      : editingId
                        ? language === 'ar'
                          ? 'حفظ التغييرات'
                          : 'Save changes'
                        : language === 'ar'
                          ? 'إضافة الرابط'
                          : 'Add link'}
                  </Button>

                  <Button type="button" variant="outline" onClick={resetForm}>
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'الروابط الحالية' : 'Current links'}</CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'الروابط مرتبة حسب ترتيب العرض.'
                  : 'Links are ordered by display order.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'جارٍ تحميل الروابط…' : 'Loading links…'}
                </div>
              ) : links.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'لا توجد روابط حتى الآن.' : 'No social links yet.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'ar' ? 'المنصة' : 'Platform'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الاسم' : 'Label'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الترتيب' : 'Order'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead className="text-right">
                          {language === 'ar' ? 'الإجراءات' : 'Actions'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {links.map((link) => (
                        <TableRow key={link.id}>
                          <TableCell>
                            <div className="font-medium">{link.platform}</div>
                            <div className="text-xs text-muted-foreground">{link.icon ?? '—'}</div>
                          </TableCell>

                          <TableCell>
                            <a
                              href={
                                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(link.url)
                                  ? `mailto:${link.url}`
                                  : link.url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium underline underline-offset-4"
                            >
                              {language === 'ar' ? link.label_ar : link.label_en}
                            </a>
                          </TableCell>

                          <TableCell>{link.display_order}</TableCell>

                          <TableCell>
                            <Badge variant={link.is_active ? 'default' : 'secondary'}>
                              {link.is_active
                                ? language === 'ar'
                                  ? 'نشط'
                                  : 'Active'
                                : language === 'ar'
                                  ? 'غير نشط'
                                  : 'Inactive'}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(link)}>
                                {language === 'ar' ? 'تعديل' : 'Edit'}
                              </Button>

                              <Button variant="destructive" size="sm" onClick={() => confirmDelete(link)}>
                                {language === 'ar' ? 'حذف' : 'Delete'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'ar' ? 'تأكيد حذف الرابط' : 'Confirm deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? `هل أنت متأكد من حذف رابط “${linkToDelete?.platform ?? ''}”؟`
                : `Are you sure you want to delete the “${linkToDelete?.platform ?? ''}” link?`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>

            <AlertDialogAction disabled={deleting} onClick={handleDelete}>
              {deleting
                ? language === 'ar'
                  ? 'جارٍ الحذف…'
                  : 'Deleting…'
                : language === 'ar'
                  ? 'حذف الرابط'
                  : 'Delete link'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}