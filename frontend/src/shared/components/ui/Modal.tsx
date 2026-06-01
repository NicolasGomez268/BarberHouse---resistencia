import type { ReactNode } from 'react'
import { Button } from './Button'

type ModalProps = {
  children: ReactNode
  isOpen: boolean
  title: string
  onClose: () => void
}

export function Modal({ children, isOpen, title, onClose }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <section className="w-full max-w-lg rounded-lg bg-surface p-6 text-text-primary">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
        <div className="mt-4">{children}</div>
      </section>
    </div>
  )
}
