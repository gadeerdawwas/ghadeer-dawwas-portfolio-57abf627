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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n'
import { supabase } from '@/lib/supabase'

type SettingRow = {
  id: string
  setting_key: string
  value_en: string | null
  value_ar: string | null
  value_json: unknown | null
  updated_at: string | null
}

type SettingFormState = {
  setting_key: string
  value_en: string
  value_ar: string
  value_json: string
}

const createEmptyFormState = (): SettingFormState => ({
  setting_key: '',
  value_en: '',
  value_ar: '',
  value_json: '',
})

export const Route = createFileRoute('/admin/settings')({
  component: AdminSettingsPage,
})

function AdminSettingsPage() {
  const navigate = useNavigate()
  const { language, isRTL } = useI18n()

  const [checkingAccess, setCheckingAccess] = useState(true)
  const [settings, setSettings] = useState<SettingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<SettingFormState>(createEmptyFormState)
  const [editingSettingId, setEditingSettingId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [settingToDelete, setSettingToDelete] = useState<SettingRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadSettings = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('site_settings')
      .select('id,setting_key,value_en,value_ar,value_json,updated_at')
      .order('setting_key', { ascending: true })

    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر تحميل إعدادات الموقع.' : 'Unable to load site settings.')
      setStatusType('error')
      setSettings([])
      setLoading(false)
      return
    }

    setSettings((data as SettingRow[]) ?? [])
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
      await loadSettings()
    }

    void checkAccessAndLoad()
  }, [])

  const updateField = (field: keyof SettingFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setForm(createEmptyFormState())
    setEditingSettingId(null)
    setStatusMessage(null)
    setStatusType(null)
  }

  const validateForm = () => {
    if (!form.setting_key.trim()) {
      return language === 'ar' ? 'يرجى إدخال مفتاح الإعداد.' : 'Please enter the setting key.'
    }

    if (!/^[a-z0-9._-]+$/i.test(form.setting_key.trim())) {
      return language === 'ar'
        ? 'مفتاح الإعداد يجب أن يحتوي على حروف وأرقام و . أو _ أو - فقط.'
        : 'The setting key may only contain letters, numbers, dots, underscores, and hyphens.'
    }

    if (form.value_json.trim()) {
      try {
        JSON.parse(form.value_json)
      } catch {
        return language === 'ar' ? 'قيمة JSON غير صحيحة.' : 'Invalid JSON value.'
      }
    }

    if (!form.value_en.trim() && !form.value_ar.trim() && !form.value_json.trim()) {
      return language === 'ar'
        ? 'أدخلي قيمة واحدة على الأقل: إنجليزية أو عربية أو JSON.'
        : 'Enter at least one value: English, Arabic, or JSON.'
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

    let parsedJson: unknown | null = null
    if (form.value_json.trim()) {
      parsedJson = JSON.parse(form.value_json)
    }

    const payload = {
      setting_key: form.setting_key.trim(),
      value_en: form.value_en.trim() || null,
      value_ar: form.value_ar.trim() || null,
      value_json: parsedJson,
      updated_at: new Date().toISOString(),
    }

    setSubmitting(true)

    if (editingSettingId) {
      const { error } = await supabase
        .from('site_settings')
        .update(payload)
        .eq('id', editingSettingId)

      if (error) {
        setStatusMessage(language === 'ar' ? 'تعذر تحديث الإعداد.' : 'Unable to update the setting.')
        setStatusType('error')
        setSubmitting(false)
        return
      }

      setStatusMessage(language === 'ar' ? 'تم تحديث الإعداد بنجاح.' : 'Setting updated successfully.')
      setStatusType('success')
    } else {
      const { error } = await supabase.from('site_settings').insert([payload])

      if (error) {
        const duplicateKey = String(error.message || '').toLowerCase().includes('duplicate')
        setStatusMessage(
          duplicateKey
            ? language === 'ar'
              ? 'مفتاح الإعداد مستخدم بالفعل.'
              : 'This setting key already exists.'
            : language === 'ar'
              ? 'تعذر إنشاء الإعداد.'
              : 'Unable to create the setting.',
        )
        setStatusType('error')
        setSubmitting(false)
        return
      }

      setStatusMessage(language === 'ar' ? 'تم إنشاء الإعداد بنجاح.' : 'Setting created successfully.')
      setStatusType('success')
    }

    setSubmitting(false)
    setEditingSettingId(null)
    setForm(createEmptyFormState())
    await loadSettings()
  }

  const handleEdit = (setting: SettingRow) => {
    setEditingSettingId(setting.id)
    setForm({
      setting_key: setting.setting_key,
      value_en: setting.value_en ?? '',
      value_ar: setting.value_ar ?? '',
      value_json: setting.value_json == null ? '' : JSON.stringify(setting.value_json, null, 2),
    })
    setStatusMessage(null)
    setStatusType(null)
  }

  const confirmDelete = (setting: SettingRow) => {
    setSettingToDelete(setting)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!settingToDelete) return

    setDeleting(true)

    const { error } = await supabase
      .from('site_settings')
      .delete()
      .eq('id', settingToDelete.id)

    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر حذف الإعداد.' : 'Unable to delete the setting.')
      setStatusType('error')
      setDeleting(false)
      setDeleteDialogOpen(false)
      setSettingToDelete(null)
      return
    }

    setStatusMessage(language === 'ar' ? 'تم حذف الإعداد بنجاح.' : 'Setting deleted successfully.')
    setStatusType('success')
    setDeleting(false)
    setDeleteDialogOpen(false)
    setSettingToDelete(null)
    await loadSettings()
  }

  const formatJsonPreview = (value: unknown | null) => {
    if (value == null) return '—'
    try {
      const text = JSON.stringify(value)
      return text.length > 80 ? `${text.slice(0, 80)}…` : text
    } catch {
      return '—'
    }
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
              {language === 'ar' ? 'الإعدادات' : 'Settings'}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {language === 'ar' ? 'إعدادات الموقع' : 'Site settings'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {language === 'ar'
                ? 'إدارة النصوص والقيم العامة التي سيستخدمها الموقع.'
                : 'Manage general text and configuration values used by the portfolio.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: '/admin/dashboard' })}>
              {language === 'ar' ? 'العودة إلى لوحة الإدارة' : 'Back to dashboard'}
            </Button>
            <Button onClick={resetForm}>
              {language === 'ar' ? 'إعداد جديد' : 'New setting'}
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
                {editingSettingId
                  ? language === 'ar'
                    ? 'تعديل الإعداد'
                    : 'Edit setting'
                  : language === 'ar'
                    ? 'إضافة إعداد'
                    : 'Add setting'}
              </CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'استخدمي القيمة العربية والإنجليزية للنصوص، أو JSON للبيانات المركبة.'
                  : 'Use Arabic/English values for text, or JSON for structured data.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="setting_key">
                    {language === 'ar' ? 'مفتاح الإعداد' : 'Setting key'}
                  </Label>
                  <Input
                    id="setting_key"
                    value={form.setting_key}
                    onChange={(event) => updateField('setting_key', event.target.value)}
                    placeholder="hero.title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value_en">
                    {language === 'ar' ? 'القيمة بالإنجليزية' : 'English value'}
                  </Label>
                  <Textarea
                    id="value_en"
                    rows={3}
                    value={form.value_en}
                    onChange={(event) => updateField('value_en', event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value_ar">
                    {language === 'ar' ? 'القيمة بالعربية' : 'Arabic value'}
                  </Label>
                  <Textarea
                    id="value_ar"
                    rows={3}
                    value={form.value_ar}
                    onChange={(event) => updateField('value_ar', event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value_json">
                    {language === 'ar' ? 'قيمة JSON (اختياري)' : 'JSON value (optional)'}
                  </Label>
                  <Textarea
                    id="value_json"
                    rows={7}
                    className="font-mono text-sm"
                    value={form.value_json}
                    onChange={(event) => updateField('value_json', event.target.value)}
                    placeholder={'{"example": true}'}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting
                      ? language === 'ar'
                        ? 'جارٍ الحفظ…'
                        : 'Saving…'
                      : editingSettingId
                        ? language === 'ar'
                          ? 'حفظ التغييرات'
                          : 'Save changes'
                        : language === 'ar'
                          ? 'إضافة الإعداد'
                          : 'Add setting'}
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
              <CardTitle>{language === 'ar' ? 'الإعدادات الحالية' : 'Current settings'}</CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'يمكنك تعديل أي إعداد أو حذفه من هنا.'
                  : 'Edit or delete any existing setting here.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'جارٍ تحميل الإعدادات…' : 'Loading settings…'}
                </div>
              ) : settings.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'لا توجد إعدادات حتى الآن.' : 'No settings yet.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'ar' ? 'المفتاح' : 'Key'}</TableHead>
                        <TableHead>{language === 'ar' ? 'القيمة' : 'Value'}</TableHead>
                        <TableHead>{language === 'ar' ? 'النوع' : 'Type'}</TableHead>
                        <TableHead className="text-right">
                          {language === 'ar' ? 'الإجراءات' : 'Actions'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {settings.map((setting) => {
                        const hasJson = setting.value_json != null
                        const displayValue =
                          language === 'ar'
                            ? setting.value_ar || setting.value_en || formatJsonPreview(setting.value_json)
                            : setting.value_en || setting.value_ar || formatJsonPreview(setting.value_json)

                        return (
                          <TableRow key={setting.id}>
                            <TableCell className="font-mono text-xs">
                              {setting.setting_key}
                            </TableCell>

                            <TableCell>
                              <div className="max-w-[340px] truncate text-sm">
                                {displayValue || '—'}
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge variant={hasJson ? 'default' : 'secondary'}>
                                {hasJson ? 'JSON' : language === 'ar' ? 'نص' : 'Text'}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(setting)}
                                >
                                  {language === 'ar' ? 'تعديل' : 'Edit'}
                                </Button>

                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => confirmDelete(setting)}
                                >
                                  {language === 'ar' ? 'حذف' : 'Delete'}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
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
              {language === 'ar' ? 'تأكيد حذف الإعداد' : 'Confirm deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? `هل أنت متأكد من حذف الإعداد “${settingToDelete?.setting_key ?? ''}”؟`
                : `Are you sure you want to delete “${settingToDelete?.setting_key ?? ''}”?`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>

            <AlertDialogAction disabled={deleting} onClick={handleDelete}>
              {deleting
                ? language === 'ar'
                  ? 'جارٍ الحذف…'
                  : 'Deleting…'
                : language === 'ar'
                  ? 'حذف الإعداد'
                  : 'Delete setting'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}