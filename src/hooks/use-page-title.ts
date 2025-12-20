import { useEffect } from 'react'

// Sets document.title, resets to default on unmount
export function usePageTitle(title: string | null | undefined, defaultTitle = 'Mochi') {
  useEffect(() => {
    if (title) {
      document.title = title
    } else {
      document.title = defaultTitle
    }

    return () => {
      document.title = defaultTitle
    }
  }, [title, defaultTitle])
}
