import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  isLoading?: boolean
}

export function Button({ children, className = '', isLoading = false, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 font-medium text-background transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      disabled={disabled || isLoading}
      type="button"
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  )
}
