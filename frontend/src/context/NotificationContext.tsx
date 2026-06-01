import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { Toast } from '../shared/components/ui/Toast'
import type { Notification } from '../types'

type NotificationContextValue = {
  notify: (notification: Omit<Notification, 'id'>) => void
}

export const NotificationContext = createContext<NotificationContextValue>({
  notify: () => undefined,
})

type NotificationProviderProps = {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const notify = useCallback((notification: Omit<Notification, 'id'>) => {
    setNotifications((current) => [...current, { ...notification, id: crypto.randomUUID() }])
  }, [])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2">
        {notifications.map((notification) => (
          <Toast key={notification.id} notification={notification} />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
