import { useEffect } from 'react'

// Sets document.title to "title - Mochi"
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} - Mochi`
  }, [title])
}
