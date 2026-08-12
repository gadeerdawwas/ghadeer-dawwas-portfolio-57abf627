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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n'
import { supabase } from '@/lib/supabase'

type ProcessRow = {
  id: string
  step_number: number
  title_en: string
  title_ar: string
  description_en: string
  description_ar: string
  icon: string | null
  is_active: boolean
}

type ProcessFormState = {
  step_number: string
  title_en: string
  title_ar: string
  description_en: string
  description_ar: string
  icon: string
  is_active: boolean
}

const createEmptyFormState = (): ProcessFormState => ({
  step_number: '1',
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  icon: '',
  is_active: true,
})

export const Route = createFileRoute('/admin/process')({
  component: AdminProcessPage,
})

function AdminProcessPage() {
  const navigate = useNavigate()
  const { language, isRTL } = useI18n()

  const [checkingAccess, setCheckingAccess] = useState(true)
  const [steps, setSteps] = useState<ProcessRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<ProcessFormState>(createEmptyFormState)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [stepToDelete, setStepToDelete] = useState<ProcessRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadSteps = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('process_steps')
      .select('id,step_number,title_en,title_ar,description_en,description_ar,icon,is_active')
      .order('step_number', { ascending: true })

    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر تحميل خطوات العمل.' : 'Unable to load process steps.')
      setStatusType('error')
      setSteps([])
      setLoading(false)
      return
    }

    setSteps((data as ProcessRow[]) ?? [])
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
        await navigate({
          to: '/admin/login',
          search: { error: 'access_denied' },
        })
        return
      }

      setCheckingAccess(false)
      await loadSteps()
    }

    void checkAccessAndLoad()
  }, [])

  const updateField = (field: keyof ProcessFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setForm(createEmptyFormState())
    setEditingId(null)
    setStatusMessage(null)
    setStatusType(null)
  }

  const validateForm = () => {
    const stepNumber = Number(form.step_number)

    if (!Number.isInteger(stepNumber) || stepNumber < 1) {
      return language === 'ar' ? 'يرجى إدخال رقم خطوة صحيح.' : 'Please enter a valid step number.'
    }

    if (!form.title_en.trim()) {
      return language === 'ar' ? 'يرجى إدخال العنوان بالإنجليزية.' : 'Please enter the English title.'
    }

    if (!form.title_ar.trim()) {
      return language === 'ar' ? 'يرجى إدخال العنوان بالعربية.' : 'Please enter the Arabic title.'
    }

    if (!form.description_en.trim()) {
      return language === 'ar' ? 'يرجى إدخال الوصف بالإنجليزية.' : 'Please enter the English description.'
    }

    if (!form.description_ar.trim()) {
      return language === 'ar' ? 'يرجى إدخال الوصف بالعربية.' : 'Please enter the Arabic description.'
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
      step_number: Number(form.step_number),
      title_en: form.title_en.trim(),
      title_ar: form.title_ar.trim(),
      description_en: form.description_en.trim(),
      description_ar: form.description_ar.trim(),
      icon: form.icon.trim() || null,
      is_active: form.is_active,
    }

    setSubmitting(true)

    const { error } = editingId
      ? await supabase.from('process_steps').update(payload).eq('id', editingId)
      : await supabase.from('process_steps').insert([payload])

    if (error) {
      setStatusMessage(
        language === 'ar'
          ? editingId
            ? 'تعذر تحديث الخطوة.'
            : 'تعذر إنشاء الخطوة.'
          : editingId
            ? 'Unable to update the step.'
            : 'Unable to create the step.',
      )
      setStatusType('error')
      setSubmitting(false)
      return
    }

    setStatusMessage(
      language === 'ar'
        ? editingId
          ? 'تم تحديث الخطوة بنجاح.'
          : 'تم إنشاء الخطوة بنجاح.'
        : editingId
          ? 'Step updated successfully.'
          : 'Step created successfully.',
    )
    setStatusType('success')
    setSubmitting(false)
    setEditingId(null)
    setForm(createEmptyFormState())
    await loadSteps()
  }

  const handleEdit = (step: ProcessRow) => {
    setEditingId(step.id)
    setForm({
      step_number: String(step.step_number),
      title_en: step.title_en,
      title_ar: step.title_ar,
      description_en: step.description_en,
      description_ar: step.description_ar,
      icon: step.icon ?? '',
      is_active: step.is_active,
    })
    setStatusMessage(null)
    setStatusType(null)
  }

  const handleDelete = async () => {
    if (!stepToDelete) return

    setDeleting(true)
    const { error } = await supabase
      .from('process_steps')
      .delete()
      .eq('id', stepToDelete.id)

    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر حذف الخطوة.' : 'Unable to delete the step.')
      setStatusType('error')
    } else {
      setStatusMessage(language === 'ar' ? 'تم حذف الخطوة بنجاح.' : 'Step deleted successfully.')
      setStatusType('success')
      await loadSteps()
    }

    setDeleting(false)
    setDeleteDialogOpen(false)
    setStepToDelete(null)
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
    <div
      className="min-h-screen bg-background px-4 py-10 text-foreground"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {language === 'ar' ? 'خطوات العمل' : 'Process'}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {language === 'ar' ? 'إدارة خطوات العمل' : 'Process management'}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: '/admin/dashboard' })}>
              {language === 'ar' ? 'العودة إلى لوحة الإدارة' : 'Back to dashboard'}
            </Button>
            <Button onClick={resetForm}>
              {language === 'ar' ? 'خطوة جديدة' : 'New step'}
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

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId
                  ? language === 'ar'
                    ? 'تعديل الخطوة'
                    : 'Edit step'
                  : language === 'ar'
                    ? 'إضافة خطوة جديدة'
                    : 'Add new step'}
              </CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'أدخل بيانات الخطوة بالعربية والإنجليزية.'
                  : 'Enter the step details in Arabic and English.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="step_number">
                      {language === 'ar' ? 'رقم الخطوة' : 'Step number'}
                    </Label>
                    <Input
                      id="step_number"
                      type="number"
                      min="1"
                      value={form.step_number}
                      onChange={(event) => updateField('step_number', event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="icon">{language === 'ar' ? 'الأيقونة' : 'Icon'}</Label>
                    <Input
                      id="icon"
                      value={form.icon}
                      onChange={(event) => updateField('icon', event.target.value)}
                      placeholder="Search"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title_en">
                      {language === 'ar' ? 'العنوان بالإنجليزية' : 'English title'}
                    </Label>
                    <Input
                      id="title_en"
                      value={form.title_en}
                      onChange={(event) => updateField('title_en', event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title_ar">
                      {language === 'ar' ? 'العنوان بالعربية' : 'Arabic title'}
                    </Label>
                    <Input
                      id="title_ar"
                      value={form.title_ar}
                      onChange={(event) => updateField('title_ar', event.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_en">
                    {language === 'ar' ? 'الوصف بالإنجليزية' : 'English description'}
                  </Label>
                  <Textarea
                    id="description_en"
                    rows={4}
                    value={form.description_en}
                    onChange={(event) => updateField('description_en', event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_ar">
                    {language === 'ar' ? 'الوصف بالعربية' : 'Arabic description'}
                  </Label>
                  <Textarea
                    id="description_ar"
                    rows={4}
                    value={form.description_ar}
                    onChange={(event) => updateField('description_ar', event.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{language === 'ar' ? 'نشط' : 'Active'}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar'
                        ? 'إظهار الخطوة في الواجهة العامة.'
                        : 'Show this step on the public portfolio.'}
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
                          ? 'إضافة الخطوة'
                          : 'Add step'}
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
              <CardTitle>{language === 'ar' ? 'الخطوات الحالية' : 'Current steps'}</CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'الخطوات مرتبة حسب رقم الخطوة.'
                  : 'Steps are ordered by step number.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'جارٍ تحميل الخطوات…' : 'Loading steps…'}
                </div>
              ) : steps.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'لا توجد خطوات حتى الآن.' : 'No steps yet.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>{language === 'ar' ? 'العنوان' : 'Title'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead className="text-right">
                          {language === 'ar' ? 'الإجراءات' : 'Actions'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {steps.map((step) => (
                        <TableRow key={step.id}>
                          <TableCell>{step.step_number}</TableCell>
                          <TableCell>
                            {language === 'ar' ? step.title_ar : step.title_en}
                          </TableCell>
                          <TableCell>
                            <Badge variant={step.is_active ? 'default' : 'secondary'}>
                              {step.is_active
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(step)}
                              >
                                {language === 'ar' ? 'تعديل' : 'Edit'}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setStepToDelete(step)
                                  setDeleteDialogOpen(true)
                                }}
                              >
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
              {language === 'ar' ? 'تأكيد الحذف' : 'Confirm deletion'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? 'هل أنت متأكد من حذف هذه الخطوة؟'
                : 'Are you sure you want to delete this step?'}
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
                  ? 'حذف الخطوة'
                  : 'Delete step'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
