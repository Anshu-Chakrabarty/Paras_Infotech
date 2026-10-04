import usePageTitle from '../hooks/usePageTitle.js'
import termsHtml from '../content/terms.html?raw'

export default function Terms() {
  usePageTitle('Terms')

  return <div dangerouslySetInnerHTML={{ __html: termsHtml }} />
}
