import { useEffect } from 'react'
import { useLayout } from '../context/layout-provider'

// Sets both document.title and the top bar title
// Resets to defaults on unmount
export function usePageTitle(title: string | null | undefined, defaultTitle = 'Feeds') {
  const { setTopBarTitle } = useLayout()

  useEffect(() => {
    if (title) {
      document.title = title
      setTopBarTitle(title)
    } else {
      document.title = defaultTitle
      setTopBarTitle(null)
    }

    return () => {
      document.title = defaultTitle
      setTopBarTitle(null)
    }
  }, [title, defaultTitle, setTopBarTitle])
}
