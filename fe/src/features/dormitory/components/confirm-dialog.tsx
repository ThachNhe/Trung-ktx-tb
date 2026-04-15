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
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmLabel: string
    isPending?: boolean
    tone?: 'default' | 'destructive'
    onConfirm: () => void
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    isPending = false,
    tone = 'default',
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-[1.75rem] border-white/70 bg-white/95">
                <DialogHeader>
                    <DialogTitle className="text-xl text-slate-950">{title}</DialogTitle>
                    <DialogDescription className="text-sm leading-6 text-slate-600">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        variant={tone === 'destructive' ? 'destructive' : 'default'}
                        className={tone === 'default' ? 'bg-green-700 text-white hover:bg-green-800' : ''}
                        disabled={isPending}
                        onClick={onConfirm}
                    >
                        {isPending ? 'Đang xử lý...' : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}