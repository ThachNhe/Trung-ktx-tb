import { createFileRoute } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { ClipboardList, Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
    EmptyState,
    ErrorState,
    LoadingState,
    PageHeader,
    SectionCard,
    StatusBadge,
} from '@/features/dormitory/components/dormitory-ui'
import { useCheckoutRequests, useCreateCheckoutRequest, useRegistrations } from '@/hooks/useDormitory'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    CHECKOUT_REQUEST_STATUS_LABELS,
    REGISTRATION_STATUS_LABELS,
    getRoomDisplayName,
} from '@/lib/dormitory'
import {
    createCheckoutRequestSchema,
    type CreateCheckoutRequestFormValues,
} from '@/lib/validations/dormitory.schema'
import { formatDate } from '@/lib/utils'
import type { CheckoutRequest, Registration } from '@/types/common.types'

export const Route = createFileRoute('/student/my-registration')({
    component: StudentMyRegistration,
})

const today = new Date().toISOString().slice(0, 10)

function StudentMyRegistration() {
    const [requestTarget, setRequestTarget] = useState<Registration | null>(null)
    const { data, isPending, error } = useRegistrations({ page: 1, limit: 100 })
    const {
        data: checkoutRequestsData,
        isPending: isLoadingCheckoutRequests,
        error: checkoutRequestsError,
    } = useCheckoutRequests({ page: 1, limit: 100 })
    const { mutate: createCheckoutRequest, isPending: isCreatingRequest } = useCreateCheckoutRequest()
    const toast = useToast()

    const registrations = data?.items ?? []
    const checkoutRequests = checkoutRequestsData?.items ?? []

    const form = useForm<CreateCheckoutRequestFormValues>({
        resolver: zodResolver(createCheckoutRequestSchema),
        defaultValues: {
            registration_id: 0,
            requested_checkout_date: '',
            reason: '',
        },
    })

    if (error) return <ErrorState description={error.message} />

    if (isPending) return <LoadingState />

    const getPendingCheckoutRequest = (registrationId: number) =>
        checkoutRequests.find((request) => request.registration_id === registrationId && request.status === 'pending')

    const handleOpenCheckoutRequest = (registration: Registration) => {
        const pendingRequest = getPendingCheckoutRequest(registration.id)

        if (pendingRequest) {
            toast.warning('Yêu cầu đang chờ xử lý', 'Bạn đã gửi yêu cầu trả phòng cho đơn này.')
            return
        }

        form.reset({
            registration_id: registration.id,
            requested_checkout_date: '',
            reason: '',
        })
        setRequestTarget(registration)
    }

    const handleSubmitCheckoutRequest = (values: CreateCheckoutRequestFormValues) => {
        createCheckoutRequest(
            {
                ...values,
                reason: values.reason.trim(),
            },
            {
                onSuccess: () => {
                    toast.success('Đã gửi yêu cầu', 'Yêu cầu trả phòng của bạn đã được gửi đến ban quản lý.')
                    setRequestTarget(null)
                    form.reset()
                },
                onError: (err) => {
                    toast.error('Gửi thất bại', err instanceof Error ? err.message : 'Vui lòng thử lại.')
                },
            },
        )
    }

    const renderCheckoutRequest = (request: CheckoutRequest) => (
        <div key={request.id} className="rounded-[1.25rem] border border-white/60 bg-white/90 p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{getRoomDisplayName(request.room)}</p>
                        <StatusBadge status={request.status} label={CHECKOUT_REQUEST_STATUS_LABELS[request.status]} />
                    </div>
                    <div className="grid gap-1 text-sm text-slate-600 sm:grid-cols-2 sm:gap-x-8">
                        <span>
                            <span className="font-medium">Ngày muốn trả:</span>{' '}
                            {formatDate(request.requested_checkout_date)}
                        </span>
                        <span>
                            <span className="font-medium">Ngày gửi:</span> {formatDate(request.created_at)}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600">{request.reason}</p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Sinh viên"
                title="Đơn đăng ký của tôi"
                description="Theo dõi trạng thái đăng ký phòng và gửi yêu cầu trả phòng."
                action={
                    <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-800 ring-1 ring-green-200">
                        <ClipboardList className="size-4" />
                        {registrations.length} đơn
                    </div>
                }
            />

            {registrations.length === 0 ? (
                <SectionCard title="Lịch sử đăng ký">
                    <EmptyState
                        title="Chưa có đơn đăng ký"
                        description="Bạn chưa gửi đơn đăng ký phòng nào. Hãy vào trang Phòng còn trống để đăng ký."
                    />
                </SectionCard>
            ) : (
                <div className="space-y-4">
                    {registrations.map((reg) => (
                        <div
                            key={reg.id}
                            className="rounded-[1.5rem] border border-white/60 bg-white/90 p-6 shadow-sm backdrop-blur"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            {getRoomDisplayName(reg.room)}
                                        </h3>
                                        <StatusBadge status={reg.status} label={REGISTRATION_STATUS_LABELS[reg.status]} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-600">
                                        <div>
                                            <span className="font-medium">Ngày bắt đầu:</span>{' '}
                                            {formatDate(reg.start_date)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Ngày kết thúc:</span>{' '}
                                            {formatDate(reg.end_date)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Ngày gửi đơn:</span>{' '}
                                            {formatDate(reg.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {reg.status === 'pending' && (
                                <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
                                    Đơn của bạn đang được xem xét. Vui lòng chờ thông báo từ ban quản lý ký túc xá.
                                </div>
                            )}
                            {reg.status === 'approved' && (
                                <div className="mt-4 flex flex-col gap-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200 sm:flex-row sm:items-center sm:justify-between">
                                    <span>Đơn đã được duyệt. Bạn có thể đến nhận phòng theo lịch đã đăng ký.</span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100"
                                        disabled={!!getPendingCheckoutRequest(reg.id) || isLoadingCheckoutRequests}
                                        onClick={() => handleOpenCheckoutRequest(reg)}
                                    >
                                        <Send className="size-4" />
                                        {getPendingCheckoutRequest(reg.id) ? 'Đang chờ trả phòng' : 'Yêu cầu trả phòng'}
                                    </Button>
                                </div>
                            )}
                            {reg.status === 'rejected' && (
                                <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 ring-1 ring-rose-200">
                                    Đơn đăng ký của bạn đã bị từ chối. Vui lòng liên hệ ban quản lý để biết thêm chi tiết.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <SectionCard title="Yêu cầu trả phòng">
                {checkoutRequestsError ? (
                    <ErrorState description={checkoutRequestsError.message} />
                ) : isLoadingCheckoutRequests ? (
                    <LoadingState />
                ) : checkoutRequests.length === 0 ? (
                    <EmptyState
                        title="Chưa có yêu cầu trả phòng"
                        description="Các yêu cầu trả phòng bạn đã gửi sẽ hiển thị tại đây."
                    />
                ) : (
                    <div className="space-y-3">{checkoutRequests.map(renderCheckoutRequest)}</div>
                )}
            </SectionCard>

            <Dialog open={!!requestTarget} onOpenChange={(open) => !open && setRequestTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gửi yêu cầu trả phòng</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmitCheckoutRequest)} className="space-y-4">
                            {requestTarget && (
                                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800 ring-1 ring-green-200">
                                    Phòng:{' '}
                                    <span className="font-semibold">{getRoomDisplayName(requestTarget.room)}</span>
                                </div>
                            )}
                            <FormField
                                control={form.control}
                                name="requested_checkout_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ngày trả phòng dự kiến</FormLabel>
                                        <FormControl>
                                            <Input type="date" min={today} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lý do trả phòng</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Nhập lý do trả phòng..." rows={4} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setRequestTarget(null)}
                                    disabled={isCreatingRequest}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit" disabled={isCreatingRequest}>
                                    {isCreatingRequest ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
