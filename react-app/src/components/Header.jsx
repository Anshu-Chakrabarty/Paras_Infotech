import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('mobile-nav-active', open)
    return () => document.body.classList.remove('mobile-nav-active')
  }, [open])

  return (
    <header id="header" className="header d-flex align-items-center">
      <div className="container-fluid container-md d-flex align-items-center justify-content-between">
        <Link to="/" className="logo d-flex align-items-center" onClick={() => setOpen(false)}>
          <img src="/assets/img/logoPIS.png" alt="" />
          <h1>Paras Infotech Solutions</h1>
        </Link>

        <i
          className={`mobile-nav-toggle mobile-nav-show bi bi-list${open ? ' d-none' : ''}`}
          onClick={() => setOpen(true)}
          role="button"
          aria-label="Open menu"
        />
        <i
          className={`mobile-nav-toggle mobile-nav-hide bi bi-x${open ? '' : ' d-none'}`}
          onClick={() => setOpen(false)}
          role="button"
          aria-label="Close menu"
        />

        <nav id="navbar" className="navbar">
          <ul>
            {links.map((link) => (
              <li key={link.to}>
                <NavLink to={link.to} end={link.end} onClick={() => setOpen(false)}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
