import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useI18n } from '@/i18n'
import { supabase } from '@/lib/supabase'

type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
}

export const Route = createFileRoute('/admin/messages')({
  component: AdminMessagesPage,
})

function AdminMessagesPage() {
  const navigate = useNavigate()
  const { language, isRTL } = useI18n()

  const [checkingAccess, setCheckingAccess] = useState(true)
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadMessages = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('contact_messages')
      .select('id,name,email,subject,message,status,created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر تحميل الرسائل.' : 'Unable to load messages.')
      setStatusType('error')
      setMessages([])
      setLoading(false)
      return
    }

    setMessages((data as ContactMessage[]) ?? [])
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
      await loadMessages()
    }

    void checkAccessAndLoad()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id)

    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر تحديث حالة الرسالة.' : 'Unable to update message status.')
      setStatusType('error')
      return
    }

    setStatusMessage(language === 'ar' ? 'تم تحديث حالة الرسالة.' : 'Message status updated.')
    setStatusType('success')

    setMessages((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    )

    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, status })
    }
  }

  const confirmDelete = (message: ContactMessage) => {
    setMessageToDelete(message)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!messageToDelete) return

    setDeleting(true)

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', messageToDelete.id)

    if (error) {
      setStatusMessage(language === 'ar' ? 'تعذر حذف الرسالة.' : 'Unable to delete the message.')
      setStatusType('error')
      setDeleting(false)
      setDeleteDialogOpen(false)
      setMessageToDelete(null)
      return
    }

    setStatusMessage(language === 'ar' ? 'تم حذف الرسالة بنجاح.' : 'Message deleted successfully.')
    setStatusType('success')
    setDeleting(false)
    setDeleteDialogOpen(false)

    if (selectedMessage?.id === messageToDelete.id) {
      setSelectedMessage(null)
    }

    setMessageToDelete(null)
    await loadMessages()
  }

  const statusBadge = (status: string) => {
    if (status === 'read') {
      return <Badge variant="secondary">{language === 'ar' ? 'مقروءة' : 'Read'}</Badge>
    }
    if (status === 'resolved') {
      return <Badge variant="outline">{language === 'ar' ? 'مغلقة' : 'Resolved'}</Badge>
    }
    return <Badge>{language === 'ar' ? 'جديدة' : 'New'}</Badge>
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
              {language === 'ar' ? 'الرسائل' : 'Messages'}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {language === 'ar' ? 'إدارة رسائل التواصل' : 'Contact messages'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {language === 'ar'
                ? 'عرض الرسائل وتغيير حالتها أو حذفها.'
                : 'View messages, update their status, or delete them.'}
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate({ to: '/admin/dashboard' })}>
            {language === 'ar' ? 'العودة إلى لوحة الإدارة' : 'Back to dashboard'}
          </Button>
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

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'الرسائل الواردة' : 'Inbox'}</CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'أحدث الرسائل تظهر أولًا.'
                  : 'Newest messages appear first.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'جارٍ تحميل الرسائل…' : 'Loading messages…'}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'لا توجد رسائل حتى الآن.' : 'No messages yet.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'ar' ? 'المرسل' : 'Sender'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الموضوع' : 'Subject'}</TableHead>
                        <TableHead>{language === 'ar' ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{language === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
                        <TableHead className="text-right">
                          {language === 'ar' ? 'الإجراءات' : 'Actions'}
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {messages.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.subject}</TableCell>
                          <TableCell>{statusBadge(item.status)}</TableCell>
                          <TableCell>
                            {new Date(item.created_at).toLocaleDateString(
                              language === 'ar' ? 'ar' : 'en',
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedMessage(item)
                                  if (item.status === 'new') {
                                    void updateStatus(item.id, 'read')
                                  }
                                }}
                              >
                                {language === 'ar' ? 'عرض' : 'View'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => confirmDelete(item)}
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

          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'تفاصيل الرسالة' : 'Message details'}</CardTitle>
              <CardDescription>
                {language === 'ar'
                  ? 'اختر رسالة من القائمة لعرض محتواها.'
                  : 'Select a message to view its content.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!selectedMessage ? (
                <div className="flex min-h-[260px] items-center justify-center rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                  {language === 'ar' ? 'لم يتم اختيار رسالة.' : 'No message selected.'}
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'الاسم' : 'Name'}
                    </p>
                    <p className="font-medium">{selectedMessage.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </p>
                    <p>{selectedMessage.email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'الموضوع' : 'Subject'}
                    </p>
                    <p className="font-medium">{selectedMessage.subject}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'الرسالة' : 'Message'}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap rounded-lg border border-border/70 bg-muted/30 p-4 text-sm leading-7">
                      {selectedMessage.message}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => void updateStatus(selectedMessage.id, 'new')}
                    >
                      {language === 'ar' ? 'تعليم كجديدة' : 'Mark new'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void updateStatus(selectedMessage.id, 'read')}
                    >
                      {language === 'ar' ? 'تعليم كمقروءة' : 'Mark read'}
                    </Button>
                    <Button
                      onClick={() => void updateStatus(selectedMessage.id, 'resolved')}
                    >
                      {language === 'ar' ? 'إغلاق الرسالة' : 'Resolve'}
                    </Button>
                  </div>
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
                ? 'هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to delete this message? This action cannot be undone.'}
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
                  ? 'حذف الرسالة'
                  : 'Delete message'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}