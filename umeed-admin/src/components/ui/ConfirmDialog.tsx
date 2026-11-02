import { Modal } from './Modal'

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', tone = 'primary', loading }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; tone?: 'primary' | 'danger'; loading?: boolean }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={<>
      <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
      <button className={tone === 'danger' ? 'btn-danger' : 'btn-primary'} onClick={onConfirm} disabled={loading}>{loading ? 'Working…' : confirmLabel}</button>
    </>}>
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  )
}