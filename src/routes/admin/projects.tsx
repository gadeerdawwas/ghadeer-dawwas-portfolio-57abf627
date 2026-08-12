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
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n'
import { supabase } from '@/lib/supabase'

type ProjectRow = {
  id: string
  title_en: string
  title_ar: string
  slug: string
  short_description_en: string
  short_description_ar: string
  description_en: string
  description_ar: string
  category: string
  technologies: string[]
  featured: boolean
  is_published: boolean
  display_order: number
  project_url: string | null
}

type ProjectFormState = {
  title_en: string
  title_ar: string
  slug: string
  short_description_en: string
  short_description_ar: string
  description_en: string
  description_ar: string
  category: string
  technologies: string
  featured: boolean
  is_published: boolean
  display_order: string
  project_url: string
}

const createEmptyFormState = (): ProjectFormState => ({
  title_en: '',
  title_ar: '',
  slug: '',
  short_description_en: '',
  short_description_ar: '',
  description_en: '',
  description_ar: '',
  category: 'Power BI',
  technologies: '',
  featured: false,
  is_published: true,
  display_order: '1',
  project_url: '',
})

type ProjectImageRow = {
  id: string
  project_id: string
  image_url: string
  alt_en: string | null
  alt_ar: string | null
  image_type: string
  display_order: number
}

const STORAGE_BUCKET = 'portfolio'

const safeFileName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')

export const Route = createFileRoute('/admin/projects')({
  component: AdminProjectsPage,
})

function AdminProjectsPage() {
  const navigate = useNavigate()
  const { language, isRTL } = useI18n()

  const [checkingAccess, setCheckingAccess] = useState(true)
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<ProjectFormState>(createEmptyFormState)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<ProjectRow | null>(null)
  const [deletingProject, setDeletingProject] = useState(false)
  const [projectImages, setProjectImages] = useState<ProjectImageRow[]>([])
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const loadProjects = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('projects')
      .select(
        'id,title_en,title_ar,slug,short_description_en,short_description_ar,description_en,description_ar,category,technologies,featured,is_published,display_order,project_url',
      )
      .order('display_order', { ascending: true })
      .order('title_en', { ascending: true })

    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر تحميل المشاريع.' : 'Unable to load projects.')
      setStatusType('error')
      setProjects([])
      setLoading(false)
      return
    }

    setProjects((data as ProjectRow[]) ?? [])
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
      await loadProjects()
    }

    void checkAccessAndLoad()
  }, [])

  const loadProjectImages = async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_images')
      .select('id,project_id,image_url,alt_en,alt_ar,image_type,display_order')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Unable to load project images:', error)
      setProjectImages([])
      return
    }

    setProjectImages((data as ProjectImageRow[]) ?? [])
  }

  const uploadImage = async (
    projectId: string,
    file: File,
    imageType: 'cover' | 'gallery',
    displayOrder: number,
  ) => {
    const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`
    const filePath = `projects/${projectId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    const { error: imageError } = await supabase.from('project_images').insert([
      {
        project_id: projectId,
        image_url: publicUrlData.publicUrl,
        alt_en: form.title_en.trim() || null,
        alt_ar: form.title_ar.trim() || null,
        image_type: imageType,
        display_order: displayOrder,
      },
    ])

    if (imageError) {
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath])
      throw imageError
    }
  }

  const uploadSelectedImages = async (projectId: string) => {
    if (!coverFile && galleryFiles.length === 0) {
      return
    }

    setUploadingImages(true)

    try {
      if (coverFile) {
        const existingCovers = projectImages.filter((image) => image.image_type === 'cover')

        if (existingCovers.length > 0) {
          const { error: deleteCoverError } = await supabase
            .from('project_images')
            .delete()
            .in('id', existingCovers.map((image) => image.id))

          if (deleteCoverError) {
            throw deleteCoverError
          }
        }

        await uploadImage(projectId, coverFile, 'cover', 0)
      }

      const currentGalleryCount = projectImages.filter(
        (image) => image.image_type === 'gallery',
      ).length

      for (let index = 0; index < galleryFiles.length; index += 1) {
        await uploadImage(
          projectId,
          galleryFiles[index],
          'gallery',
          currentGalleryCount + index + 1,
        )
      }

      setCoverFile(null)
      setGalleryFiles([])
      await loadProjectImages(projectId)
    } finally {
      setUploadingImages(false)
    }
  }

  const deleteProjectImage = async (image: ProjectImageRow) => {
    const { error } = await supabase
      .from('project_images')
      .delete()
      .eq('id', image.id)

    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر حذف الصورة.' : 'Unable to delete the image.')
      setStatusType('error')
      return
    }

    if (editingProjectId) {
      await loadProjectImages(editingProjectId)
    }
  }

  const updateField = (field: keyof ProjectFormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setForm(createEmptyFormState())
    setEditingProjectId(null)
    setStatusMessage(null)
    setStatusType(null)
    setProjectImages([])
    setCoverFile(null)
    setGalleryFiles([])
  }

  const validateForm = () => {
    if (!form.title_en.trim()) {
      return language === 'ar' ? 'يرجى إدخال العنوان بالإنجليزية.' : 'Please enter the English title.'
    }

    if (!form.title_ar.trim()) {
      return language === 'ar' ? 'يرجى إدخال العنوان بالعربية.' : 'Please enter the Arabic title.'
    }

    if (!form.slug.trim()) {
      return language === 'ar' ? 'يرجى إدخال slug.' : 'Please enter a slug.'
    }

    if (!form.short_description_en.trim()) {
      return language === 'ar' ? 'يرجى إدخال الوصف المختصر بالإنجليزية.' : 'Please enter the English short description.'
    }

    if (!form.short_description_ar.trim()) {
      return language === 'ar' ? 'يرجى إدخال الوصف المختصر بالعربية.' : 'Please enter the Arabic short description.'
    }

    if (!form.description_en.trim()) {
      return language === 'ar' ? 'يرجى إدخال الوصف الكامل بالإنجليزية.' : 'Please enter the English description.'
    }

    if (!form.description_ar.trim()) {
      return language === 'ar' ? 'يرجى إدخال الوصف الكامل بالعربية.' : 'Please enter the Arabic description.'
    }

    if (!form.category.trim()) {
      return language === 'ar' ? 'يرجى اختيار الفئة.' : 'Please select a category.'
    }

    if (!form.technologies.trim()) {
      return language === 'ar' ? 'يرجى إدخال التقنيات.' : 'Please enter technologies.'
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

    const technologies = form.technologies
      .split(',')
      .map((technology) => technology.trim())
      .filter(Boolean)

    const payload = {
      title_en: form.title_en.trim(),
      title_ar: form.title_ar.trim(),
      slug: form.slug.trim(),
      short_description_en: form.short_description_en.trim(),
      short_description_ar: form.short_description_ar.trim(),
      description_en: form.description_en.trim(),
      description_ar: form.description_ar.trim(),
      category: form.category,
      technologies,
      featured: form.featured,
      is_published: form.is_published,
      display_order: Number(form.display_order),
      project_url: form.project_url.trim() || null,
    }

    setSubmitting(true)

    try {
      let savedProjectId = editingProjectId

      if (editingProjectId) {
        const { error } = await supabase
          .from('projects')
          .update(payload)
          .eq('id', editingProjectId)

        if (error) {
          throw error
        }
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert([payload])
          .select('id')
          .single()

        if (error) {
          throw error
        }

        savedProjectId = data.id
      }

      if (!savedProjectId) {
        throw new Error('Project id was not returned.')
      }

      await uploadSelectedImages(savedProjectId)

      setStatusMessage(
        language === 'ar'
          ? editingProjectId
            ? 'تم تحديث المشروع والصور بنجاح.'
            : 'تم إنشاء المشروع ورفع الصور بنجاح.'
          : editingProjectId
            ? 'Project and images updated successfully.'
            : 'Project created and images uploaded successfully.',
      )
      setStatusType('success')
      setEditingProjectId(null)
      setForm(createEmptyFormState())
      setProjectImages([])
      setCoverFile(null)
      setGalleryFiles([])
      await loadProjects()
    } catch (error) {
      console.error('Project save failed:', error)
      setStatusMessage(
        language === 'ar'
          ? 'تعذر حفظ المشروع أو رفع الصور. تحقق من صلاحيات Storage والجداول.'
          : 'Unable to save the project or upload images. Check Storage and table policies.',
      )
      setStatusType('error')
    } finally {
      setSubmitting(false)
      setUploadingImages(false)
    }
  }

  const handleEdit = (project: ProjectRow) => {
    setEditingProjectId(project.id)
    setForm({
      title_en: project.title_en,
      title_ar: project.title_ar,
      slug: project.slug,
      short_description_en: project.short_description_en,
      short_description_ar: project.short_description_ar,
      description_en: project.description_en,
      description_ar: project.description_ar,
      category: project.category,
      technologies: project.technologies.join(', '),
      featured: project.featured,
      is_published: project.is_published,
      display_order: String(project.display_order),
      project_url: project.project_url ?? '',
    })
    setStatusMessage(null)
    setStatusType(null)
    setCoverFile(null)
    setGalleryFiles([])
    void loadProjectImages(project.id)
  }

  const confirmDelete = (project: ProjectRow) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!projectToDelete) {
      return
    }

    setDeletingProject(true)
    const { error } = await supabase.from('projects').delete().eq('id', projectToDelete.id)

    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر حذف المشروع.' : 'Unable to delete the project.')
      setStatusType('error')
      setDeletingProject(false)
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      return
    }

    setStatusMessage(language === 'ar' ? 'تم حذف المشروع بنجاح.' : 'Project deleted successfully.')
    setStatusType('success')
    setDeletingProject(false)
    setDeleteDialogOpen(false)
    setProjectToDelete(null)
    await loadProjects()
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
              {language === 'ar' ? 'المشاريع' : 'Projects'}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {language === 'ar' ? 'إدارة المشاريع' : 'Projects management'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {language === 'ar'
                ? 'أنشئ أو عدّل أو احذف المشاريع باستخدام بيانات Supabase الحالية.'
                : 'Create, edit, and delete projects using the current Supabase data.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: '/admin/dashboard' })}>
              {language === 'ar' ? 'العودة إلى لوحة الإدارة' : 'Back to dashboard'}
            </Button>
            <Button onClick={resetForm}>
              {language === 'ar' ? 'مشروع جديد' : 'New project'}
            </Button>
          </div>
        </div>

        {statusMessage ? (
          <div className={`rounded-lg border px-4 py-3 text-sm ${statusType === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
            {statusMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>{editingProjectId ? (language === 'ar' ? 'تعديل المشروع' : 'Edit project') : (language === 'ar' ? 'إنشاء مشروع جديد' : 'Create a new project')}</CardTitle>
              <CardDescription>
                {language === 'ar' ? 'استخدم الحقول الثنائية للغة العربية والإنجليزية.' : 'Use the bilingual fields for Arabic and English content.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title_en">{language === 'ar' ? 'العنوان بالإنجليزية' : 'English title'}</Label>
                    <Input id="title_en" value={form.title_en} onChange={(event) => updateField('title_en', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title_ar">{language === 'ar' ? 'العنوان بالعربية' : 'Arabic title'}</Label>
                    <Input id="title_ar" value={form.title_ar} onChange={(event) => updateField('title_ar', event.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" value={form.slug} onChange={(event) => updateField('slug', event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display_order">{language === 'ar' ? 'ترتيب العرض' : 'Display order'}</Label>
                    <Input id="display_order" type="number" min="0" value={form.display_order} onChange={(event) => updateField('display_order', event.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_url">
                    {language === 'ar' ? 'رابط المشروع' : 'Project URL'}
                  </Label>
                  <Input
                    id="project_url"
                    type="url"
                    placeholder="https://example.com"
                    value={form.project_url}
                    onChange={(event) => updateField('project_url', event.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">{language === 'ar' ? 'الفئة' : 'Category'}</Label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(event) => updateField('category', event.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="Power BI">Power BI</option>
                      <option value="Tableau">Tableau</option>
                      <option value="Excel">Excel</option>
                      <option value="SQL">SQL</option>
                      <option value="Web">Web</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technologies">{language === 'ar' ? 'التقنيات (مفصولة بفواصل)' : 'Technologies (comma separated)'}</Label>
                    <Input id="technologies" value={form.technologies} onChange={(event) => updateField('technologies', event.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description_en">{language === 'ar' ? 'الوصف المختصر بالإنجليزية' : 'Short description (English)'}</Label>
                  <Textarea id="short_description_en" value={form.short_description_en} onChange={(event) => updateField('short_description_en', event.target.value)} rows={3} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description_ar">{language === 'ar' ? 'الوصف المختصر بالعربية' : 'Short description (Arabic)'}</Label>
                  <Textarea id="short_description_ar" value={form.short_description_ar} onChange={(event) => updateField('short_description_ar', event.target.value)} rows={3} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_en">{language === 'ar' ? 'الوصف الكامل بالإنجليزية' : 'Description (English)'}</Label>
                  <Textarea id="description_en" value={form.description_en} onChange={(event) => updateField('description_en', event.target.value)} rows={5} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_ar">{language === 'ar' ? 'الوصف الكامل بالعربية' : 'Description (Arabic)'}</Label>
                  <Textarea id="description_ar" value={form.description_ar} onChange={(event) => updateField('description_ar', event.target.value)} rows={5} />
                </div>

                <div className="space-y-4 rounded-lg border border-border/60 p-4">
                  <div>
                    <h3 className="font-medium">
                      {language === 'ar' ? 'صور المشروع' : 'Project images'}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {language === 'ar'
                        ? 'اختر صورة رئيسية واحدة، ويمكنك اختيار عدة صور للمعرض.'
                        : 'Choose one cover image and multiple gallery images.'}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cover_image">
                        {language === 'ar' ? 'الصورة الرئيسية' : 'Cover image'}
                      </Label>
                      <Input
                        id="cover_image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
                      />
                      {coverFile ? (
                        <p className="text-xs text-muted-foreground">{coverFile.name}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gallery_images">
                        {language === 'ar' ? 'صور المعرض' : 'Gallery images'}
                      </Label>
                      <Input
                        id="gallery_images"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        onChange={(event) =>
                          setGalleryFiles(Array.from(event.target.files ?? []))
                        }
                      />
                      {galleryFiles.length > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          {language === 'ar'
                            ? `تم اختيار ${galleryFiles.length} صور`
                            : `${galleryFiles.length} images selected`}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {editingProjectId && projectImages.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {projectImages.map((image) => (
                        <div key={image.id} className="overflow-hidden rounded-lg border border-border">
                          <img
                            src={image.image_url}
                            alt={
                              language === 'ar'
                                ? image.alt_ar ?? form.title_ar
                                : image.alt_en ?? form.title_en
                            }
                            className="aspect-video w-full object-cover"
                          />
                          <div className="flex items-center justify-between gap-2 p-2">
                            <Badge variant={image.image_type === 'cover' ? 'default' : 'secondary'}>
                              {image.image_type === 'cover'
                                ? language === 'ar'
                                  ? 'رئيسية'
                                  : 'Cover'
                                : language === 'ar'
                                  ? 'معرض'
                                  : 'Gallery'}
                            </Badge>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => void deleteProjectImage(image)}
                            >
                              {language === 'ar' ? 'حذف الصورة' : 'Delete'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-6 rounded-lg border border-border/60 bg-muted/40 p-4">
                  <label className="flex items-center gap-3 text-sm">
                    <Switch checked={form.featured} onCheckedChange={(value) => updateField('featured', value)} />
                    <span>{language === 'ar' ? 'مميز' : 'Featured'}</span>
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <Switch checked={form.is_published} onCheckedChange={(value) => updateField('is_published', value)} />
                    <span>{language === 'ar' ? 'منشور' : 'Published'}</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={submitting || uploadingImages}>
                    {submitting || uploadingImages ? (language === 'ar' ? 'جارٍ الحفظ ورفع الصور…' : 'Saving and uploading…') : editingProjectId ? (language === 'ar' ? 'حفظ التغييرات' : 'Save changes') : (language === 'ar' ? 'إنشاء المشروع' : 'Create project')}
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
              <CardTitle>{language === 'ar' ? 'المشاريع الحالية' : 'Existing projects'}</CardTitle>
              <CardDescription>
                {language === 'ar' ? 'عرض المشاريع بترتيب العرض.' : 'Projects are shown in display order.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'جارٍ تحميل المشاريع…' : 'Loading projects…'}
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'لا توجد مشاريع حتى الآن.' : 'No projects yet.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'ar' ? 'العنوان' : 'Title'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الفئة' : 'Category'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الترتيب' : 'Order'}</TableHead>
                        <TableHead className="text-right">{language === 'ar' ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{project.title_en}</p>
                              <p className="text-sm text-muted-foreground">{project.title_ar}</p>
                            </div>
                          </TableCell>
                          <TableCell>{project.category}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {project.featured ? <Badge>{language === 'ar' ? 'مميز' : 'Featured'}</Badge> : null}
                              {project.is_published ? <Badge variant="secondary">{language === 'ar' ? 'منشور' : 'Published'}</Badge> : <Badge variant="outline">{language === 'ar' ? 'مسودة' : 'Draft'}</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>{project.display_order}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
                                {language === 'ar' ? 'تعديل' : 'Edit'}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => confirmDelete(project)}>
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
            <AlertDialogTitle>{language === 'ar' ? 'تأكيد الحذف' : 'Confirm deletion'}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? `سيتم حذف المشروع “${projectToDelete?.title_en ?? ''}” بشكل دائم.`
                : `This will permanently delete the project “${projectToDelete?.title_en ?? ''}”.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'ar' ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deletingProject}>
              {deletingProject ? (language === 'ar' ? 'جارٍ الحذف…' : 'Deleting…') : (language === 'ar' ? 'حذف' : 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}