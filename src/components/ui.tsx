import { cn } from "@/lib/utils"

export function Button({ 
  children, 
  className, 
  variant = "primary",
  size = "md",
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30 focus:ring-primary-500",
    secondary: "bg-accent-500 hover:bg-accent-600 text-white shadow-lg shadow-accent-500/30 focus:ring-accent-500",
    outline: "border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
    ghost: "text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 focus:ring-red-500"
  }
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-12 py-5 text-xl font-semibold"
  }
  
  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ 
  children, 
  className, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn(
        "bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function Input({ 
  className, 
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
        "transition-all duration-200",
        "placeholder:text-gray-400",
        className
      )}
      {...props}
    />
  )
}

export function TextArea({ 
  className, 
  ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white resize-none",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
        "transition-all duration-200",
        "placeholder:text-gray-400",
        className
      )}
      {...props}
    />
  )
}

export function Badge({ 
  children, 
  variant = "default",
  className 
}: { 
  children: React.ReactNode
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "outline"
  className?: string
}) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-primary-100 text-primary-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    outline: "border border-gray-300 text-gray-700"
  }
  
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

export function ProgressBar({ 
  progress, 
  className 
}: { 
  progress: number
  className?: string
}) {
  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2 overflow-hidden", className)}>
      <div 
        className="bg-gradient-to-r from-primary-500 to-romance-500 h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  )
}

export function HeartIcon({ 
  className,
  filled = false,
  ...props 
}: React.SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={cn("w-6 h-6", className)}
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  )
}
