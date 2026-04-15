import { Loader2, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

interface ConfirmDialogProps {
    open: boolean
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    confirmVariant?: 'default' | 'destructive'
    isLoading?: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Xác nhận',
    cancelLabel = 'Hủy',
    confirmVariant = 'default',
    isLoading = false,
    onOpenChange,
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-[1.5rem] border-green-100 bg-white/95 sm:max-w-md">
                <DialogHeader>
                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                        <TriangleAlert className="size-5" />
                    </div>
                    <DialogTitle className="font-display text-2xl text-slate-950">{title}</DialogTitle>
                    <DialogDescription className="leading-6 text-slate-600">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        className="border-slate-200"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={confirmVariant}
                        className={confirmVariant === 'default' ? 'bg-green-700 text-white hover:bg-green-800' : undefined}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}