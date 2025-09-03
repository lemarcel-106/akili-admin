// Mappings de remplacement pour les classes daisyUI vers Tailwind/shadcn-ui
export const daisyToTailwind = {
  // Buttons
  'btn': 'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  'btn-primary': 'bg-primary text-primary-foreground hover:bg-primary hover:brightness-110',
  'btn-secondary': 'bg-secondary text-secondary-foreground hover:bg-secondary hover:brightness-110',
  'btn-ghost': 'border-transparent hover:bg-accent hover:text-accent-foreground',
  'btn-outline': 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  'btn-success': 'bg-green-500 text-white hover:bg-green-600',
  'btn-warning': 'bg-violet-500 text-white hover:bg-violet-600',
  'btn-error': 'bg-red-500 text-white hover:bg-red-600',
  'btn-info': 'bg-violet-500 text-white hover:bg-violet-600',
  'btn-sm': 'h-8 px-3 text-xs',
  'btn-lg': 'h-12 px-8',
  'btn-circle': 'rounded-full w-10 h-10 p-0',

  // Cards
  'card': 'rounded-lg border bg-card text-card-foreground shadow-sm',
  'card-body': 'p-6 pt-0',
  'card-title': 'text-lg font-semibold leading-none tracking-tight',
  'card-actions': 'flex items-center gap-2 pt-6',

  // Stats
  'stats': 'grid grid-cols-1 divide-x divide-border rounded-lg border bg-card text-card-foreground shadow',
  'stat': 'p-6',
  'stat-title': 'text-sm font-medium text-muted-foreground',
  'stat-value': 'text-2xl font-bold text-foreground',
  'stat-figure': 'text-2xl text-muted-foreground',

  // Alerts & Notifications  
  'alert': 'relative w-full rounded-lg border p-4',
  'alert-success': 'border-green-200 bg-green-50 text-green-800',
  'alert-error': 'border-red-200 bg-red-50 text-red-800',
  'alert-warning': 'border-violet-200 bg-violet-50 text-violet-800',
  'alert-info': 'border-violet-200 bg-violet-50 text-violet-800',

  // Badges
  'badge': 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
  'badge-primary': 'border-transparent bg-primary text-primary-foreground',
  'badge-secondary': 'border-transparent bg-secondary text-secondary-foreground',
  'badge-success': 'border-transparent bg-green-500 text-white',
  'badge-error': 'border-transparent bg-red-500 text-white',
  'badge-warning': 'border-transparent bg-violet-500 text-white',
  'badge-info': 'border-transparent bg-violet-500 text-white',
  'badge-ghost': 'border border-gray-300 text-gray-700',
  'badge-outline': 'text-foreground',
  'badge-sm': 'px-2 py-0.5 text-xs',
  'badge-lg': 'px-3 py-1 text-sm',

  // Modals
  'modal': 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
  'modal-open': 'flex items-center justify-center p-4',
  'modal-box': 'relative w-full max-w-lg bg-background border rounded-lg shadow-lg p-6',
  'modal-action': 'flex justify-end gap-2 mt-6',
  'modal-backdrop': 'absolute inset-0 -z-10',

  // Loading
  'loading': 'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
  'loading-spinner': 'border-2',
  'loading-sm': 'w-4 h-4 border-2',
  'loading-lg': 'w-8 h-8 border-4',

  // Join (for grouped elements)
  'join': 'inline-flex',
  'join-item': 'border-r-0 first:rounded-l-md last:rounded-r-md last:border-r',

  // Divider
  'divider': 'border-t border-border my-4',

  // Colors adaptées au thème Akili
  'text-primary': 'text-primary',
  'text-secondary': 'text-secondary', 
  'text-success': 'text-green-500',
  'text-error': 'text-red-500',
  'text-warning': 'text-violet-500',
  'text-info': 'text-violet-500',
  'bg-primary': 'bg-primary',
  'bg-secondary': 'bg-secondary',
  'bg-success': 'bg-green-500',
  'bg-error': 'bg-red-500',
  'bg-warning': 'bg-violet-500',
  'bg-info': 'bg-violet-500',
  'bg-base-100': 'bg-background',
  'bg-base-200': 'bg-muted',
  'bg-base-300': 'bg-muted/60',
  'text-base-content': 'text-foreground',
  'border-base-300': 'border-border'
} as const

export type DaisyClass = keyof typeof daisyToTailwind