import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useTheme } from '../../context/theme-provider'

// Default durations (in ms): success/info 6s, error 10s
const DEFAULT_DURATION = 6000

export function Toaster({ duration = DEFAULT_DURATION, ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      duration={duration}
      className='toaster group [&_div[data-content]]:w-full'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
