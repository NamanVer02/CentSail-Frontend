'use client'

import { FiAlertTriangle, FiX } from 'react-icons/fi'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      confirmButton: 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30',
      icon: 'text-red-400'
    },
    warning: {
      confirmButton: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30',
      icon: 'text-yellow-400'
    },
    info: {
      confirmButton: 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30',
      icon: 'text-blue-400'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
        <div className="flex items-start gap-4 mb-6">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-white/10 border-2 border-white/20 ${styles.icon}`}>
            <FiAlertTriangle className="text-2xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="flex-shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FiX className="text-xl text-white/70" />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors text-white font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-colors border-2 ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

