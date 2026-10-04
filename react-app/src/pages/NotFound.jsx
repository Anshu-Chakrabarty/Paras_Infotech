import { Link } from 'react-router-dom'
import usePageTitle from '../hooks/usePageTitle.js'

export default function NotFound() {
  usePageTitle('Page not found')

  return (
    <section className="page-missing">
      <div>
        <h2>Page not found</h2>
        <p>The page you requested is not available.</p>
        <Link to="/" className="btn btn-warning">Back to Home</Link>
      </div>
    </section>
  )
}
