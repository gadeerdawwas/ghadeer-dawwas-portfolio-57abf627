import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n'
import { supabase } from '@/lib/supabase'

type ServiceRow = { id: string; title_en: string; title_ar: string; description_en: string; description_ar: string; icon: string | null; display_order: number; is_active: boolean }
type ServiceFormState = { title_en: string; title_ar: string; description_en: string; description_ar: string; icon: string; display_order: string; is_active: boolean }

const createEmptyFormState = (): ServiceFormState => ({ title_en: '', title_ar: '', description_en: '', description_ar: '', icon: '', display_order: '1', is_active: true })

export const Route = createFileRoute('/admin/services')({ component: AdminServicesPage })

function AdminServicesPage() {
  const navigate = useNavigate()
  const { language, isRTL } = useI18n()
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [services, setServices] = useState<ServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<ServiceFormState>(createEmptyFormState)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<ServiceRow | null>(null)
  const [deletingService, setDeletingService] = useState(false)

  const loadServices = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('services').select('id,title_en,title_ar,description_en,description_ar,icon,display_order,is_active').order('display_order', { ascending: true }).order('title_en', { ascending: true })
    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر تحميل الخدمات.' : 'Unable to load services.')
      setStatusType('error'); setServices([]); setLoading(false); return
    }
    setServices((data as ServiceRow[]) ?? []); setLoading(false)
  }

  useEffect(() => {
    const checkAccessAndLoad = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session?.user) {
        await navigate({ to: '/admin/login', search: { error: 'access_denied' } }); return
      }
      const { data: adminProfile, error: profileError } = await supabase.from('admin_profiles').select('role, is_active').eq('user_id', session.user.id).maybeSingle()
      if (profileError || !adminProfile || adminProfile.role !== 'admin' || adminProfile.is_active !== true) {
        console.error('Admin profile check failed:', profileError)
        await navigate({ to: '/admin/login', search: { error: 'access_denied' } }); return
      }
      setCheckingAccess(false); await loadServices()
    }
    void checkAccessAndLoad()
  }, [])

  const updateField = (field: keyof ServiceFormState, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }))
  const resetForm = () => { setForm(createEmptyFormState()); setEditingServiceId(null); setStatusMessage(null); setStatusType(null) }

  const validateForm = () => {
    if (!form.title_en.trim()) return language === 'ar' ? 'يرجى إدخال عنوان الخدمة بالإنجليزية.' : 'Please enter the service title in English.'
    if (!form.title_ar.trim()) return language === 'ar' ? 'يرجى إدخال عنوان الخدمة بالعربية.' : 'Please enter the service title in Arabic.'
    if (!form.description_en.trim()) return language === 'ar' ? 'يرجى إدخال وصف الخدمة بالإنجليزية.' : 'Please enter the English description.'
    if (!form.description_ar.trim()) return language === 'ar' ? 'يرجى إدخال وصف الخدمة بالعربية.' : 'Please enter the Arabic description.'
    const displayOrder = Number(form.display_order)
    if (!Number.isInteger(displayOrder) || displayOrder < 0) return language === 'ar' ? 'يرجى إدخال ترتيب عرض صحيح.' : 'Please enter a valid display order.'
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setStatusMessage(null); setStatusType(null)
    const validationMessage = validateForm(); if (validationMessage) { setStatusMessage(validationMessage); setStatusType('error'); return }
    const payload = { title_en: form.title_en.trim(), title_ar: form.title_ar.trim(), description_en: form.description_en.trim(), description_ar: form.description_ar.trim(), icon: form.icon.trim() ? form.icon.trim() : null, display_order: Number(form.display_order), is_active: form.is_active }
    setSubmitting(true)
    const result = editingServiceId ? await supabase.from('services').update(payload).eq('id', editingServiceId) : await supabase.from('services').insert([payload])
    if (result.error) { setStatusMessage(language === 'ar' ? (editingServiceId ? 'تعذر تحديث الخدمة.' : 'تعذر إنشاء الخدمة.') : (editingServiceId ? 'Unable to update the service.' : 'Unable to create the service.')); setStatusType('error'); setSubmitting(false); return }
    setStatusMessage(language === 'ar' ? (editingServiceId ? 'تم تحديث الخدمة بنجاح.' : 'تم إنشاء الخدمة بنجاح.') : (editingServiceId ? 'Service updated successfully.' : 'Service created successfully.'))
    setStatusType('success'); setSubmitting(false); setEditingServiceId(null); setForm(createEmptyFormState()); await loadServices()
  }

  const handleEdit = (service: ServiceRow) => { setEditingServiceId(service.id); setForm({ title_en: service.title_en, title_ar: service.title_ar, description_en: service.description_en, description_ar: service.description_ar, icon: service.icon ?? '', display_order: String(service.display_order), is_active: service.is_active }); setStatusMessage(null); setStatusType(null) }
  const confirmDelete = (service: ServiceRow) => { setServiceToDelete(service); setDeleteDialogOpen(true) }
  const handleDelete = async () => {
    if (!serviceToDelete) return
    setDeletingService(true)
    const { error } = await supabase.from('services').delete().eq('id', serviceToDelete.id)
    if (error) { setStatusMessage(language === 'ar' ? 'تعذر حذف الخدمة.' : 'Unable to delete the service.'); setStatusType('error'); setDeletingService(false); setDeleteDialogOpen(false); setServiceToDelete(null); return }
    setStatusMessage(language === 'ar' ? 'تم حذف الخدمة بنجاح.' : 'Service deleted successfully.'); setStatusType('success'); setDeletingService(false); setDeleteDialogOpen(false); setServiceToDelete(null); await loadServices()
  }

  if (checkingAccess) return <div className="flex min-h-screen items-center justify-center bg-background text-foreground" dir={isRTL ? 'rtl' : 'ltr'}><p className="text-sm text-muted-foreground">{language === 'ar' ? 'جارٍ التحقق من صلاحية الوصول…' : 'Checking access…'}</p></div>

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">{language === 'ar' ? 'الخدمات' : 'Services'}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{language === 'ar' ? 'إدارة الخدمات' : 'Services management'}</h1><p className="mt-2 text-sm text-muted-foreground">{language === 'ar' ? 'أنشئ أو عدّل أو احذف الخدمات باستخدام بيانات Supabase الحالية.' : 'Create, edit, and delete services using the current Supabase data.'}</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => navigate({ to: '/admin/dashboard' })}>{language === 'ar' ? 'العودة إلى لوحة الإدارة' : 'Back to dashboard'}</Button><Button onClick={resetForm}>{language === 'ar' ? 'خدمة جديدة' : 'New service'}</Button></div>
        </div>
        {statusMessage ? <div className={`rounded-lg border px-4 py-3 text-sm ${statusType === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>{statusMessage}</div> : null}
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card><CardHeader><CardTitle>{editingServiceId ? (language === 'ar' ? 'تعديل الخدمة' : 'Edit service') : (language === 'ar' ? 'إنشاء خدمة جديدة' : 'Create a new service')}</CardTitle><CardDescription>{language === 'ar' ? 'أدخل محتوى الخدمة بالعربية والإنجليزية.' : 'Enter the service content in Arabic and English.'}</CardDescription></CardHeader><CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="title_en">{language === 'ar' ? 'العنوان بالإنجليزية' : 'English title'}</Label><Input id="title_en" value={form.title_en} onChange={(e) => updateField('title_en', e.target.value)} /></div><div className="space-y-2"><Label htmlFor="title_ar">{language === 'ar' ? 'العنوان بالعربية' : 'Arabic title'}</Label><Input id="title_ar" value={form.title_ar} onChange={(e) => updateField('title_ar', e.target.value)} /></div></div>
              <div className="space-y-2"><Label htmlFor="description_en">{language === 'ar' ? 'الوصف بالإنجليزية' : 'English description'}</Label><Textarea id="description_en" rows={4} value={form.description_en} onChange={(e) => updateField('description_en', e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="description_ar">{language === 'ar' ? 'الوصف بالعربية' : 'Arabic description'}</Label><Textarea id="description_ar" rows={4} value={form.description_ar} onChange={(e) => updateField('description_ar', e.target.value)} /></div>
              <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label htmlFor="icon">{language === 'ar' ? 'الأيقونة' : 'Icon'}</Label><Input id="icon" value={form.icon} onChange={(e) => updateField('icon', e.target.value)} placeholder={language === 'ar' ? 'مثل: LayoutDashboard' : 'e.g. LayoutDashboard'} /></div><div className="space-y-2"><Label htmlFor="display_order">{language === 'ar' ? 'ترتيب العرض' : 'Display order'}</Label><Input id="display_order" type="number" min="0" step="1" value={form.display_order} onChange={(e) => updateField('display_order', e.target.value)} /></div></div>
              <div className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3"><div><p className="text-sm font-medium">{language === 'ar' ? 'نشط' : 'Active'}</p><p className="text-sm text-muted-foreground">{language === 'ar' ? 'إظهار الخدمة في الواجهة العامة.' : 'Show the service on the public portfolio.'}</p></div><Switch checked={form.is_active} onCheckedChange={(checked) => updateField('is_active', checked)} /></div>
              <div className="flex flex-wrap gap-2"><Button type="submit" disabled={submitting}>{submitting ? (language === 'ar' ? 'جارٍ الحفظ…' : 'Saving…') : editingServiceId ? (language === 'ar' ? 'حفظ التغييرات' : 'Save changes') : (language === 'ar' ? 'إنشاء الخدمة' : 'Create service')}</Button><Button type="button" variant="outline" onClick={resetForm}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button></div>
            </form>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>{language === 'ar' ? 'قائمة الخدمات' : 'Services list'}</CardTitle><CardDescription>{language === 'ar' ? 'الخدمات مرتبة حسب ترتيب العرض.' : 'Services are ordered by display order.'}</CardDescription></CardHeader><CardContent>
            {loading ? <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">{language === 'ar' ? 'جارٍ تحميل الخدمات…' : 'Loading services…'}</div> : services.length === 0 ? <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">{language === 'ar' ? 'لا توجد خدمات بعد.' : 'No services yet.'}</div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>{language === 'ar' ? 'العنوان' : 'Title'}</TableHead><TableHead>{language === 'ar' ? 'الترتيب' : 'Order'}</TableHead><TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead><TableHead className="text-right">{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead></TableRow></TableHeader><TableBody>{services.map((service) => <TableRow key={service.id}><TableCell><div className="space-y-1"><p className="font-medium">{language === 'ar' ? service.title_ar : service.title_en}</p><p className="text-xs text-muted-foreground">{service.icon ?? '—'}</p></div></TableCell><TableCell>{service.display_order}</TableCell><TableCell><Badge variant={service.is_active ? 'default' : 'secondary'}>{service.is_active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}</Badge></TableCell><TableCell><div className="flex justify-end gap-2"><Button variant="outline" size="sm" onClick={() => handleEdit(service)}>{language === 'ar' ? 'تعديل' : 'Edit'}</Button><Button variant="destructive" size="sm" onClick={() => confirmDelete(service)}>{language === 'ar' ? 'حذف' : 'Delete'}</Button></div></TableCell></TableRow>)}</TableBody></Table></div>}
          </CardContent></Card>
        </div>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{language === 'ar' ? 'تأكيد الحذف' : 'Confirm deletion'}</AlertDialogTitle><AlertDialogDescription>{language === 'ar' ? 'هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this service? This action cannot be undone.'}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel><AlertDialogAction disabled={deletingService} onClick={handleDelete}>{deletingService ? (language === 'ar' ? 'جارٍ الحذف…' : 'Deleting…') : (language === 'ar' ? 'حذف الخدمة' : 'Delete service')}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  )
}