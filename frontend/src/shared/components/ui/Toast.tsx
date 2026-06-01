import type { Notification } from '../../../types'

type ToastProps = {
  notification: Notification
}

export function Toast({ notification }: ToastProps) {
  return (
    <div className="rounded-md border border-white/10 bg-surface px-4 py-3 text-sm text-text-primary shadow-lg">
      {notification.message}
    </div>
  )
}
