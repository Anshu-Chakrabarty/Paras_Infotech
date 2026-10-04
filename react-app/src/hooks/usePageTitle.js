import { useEffect } from 'react'

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} Paras Infotech Solutions` : 'Paras Infotech Solutions'
  }, [title])
}
