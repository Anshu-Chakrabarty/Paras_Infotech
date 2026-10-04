import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AOS from 'aos'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  const location = useLocation()
  const [booting, setBooting] = useState(true)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 500)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    AOS.init({ duration: 800, easing: 'slide', once: true, mirror: false })
  }, [])

  useEffect(() => {
    const scrollToTarget = () => {
      const root = document.documentElement
      const previous = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      if (location.hash) {
        const id = decodeURIComponent(location.hash.slice(1))
        const target = document.getElementById(id)
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - 225
          window.scrollTo({ top, behavior: 'auto' })
        }
      } else {
        window.scrollTo(0, 0)
      }
      root.style.scrollBehavior = previous
      AOS.refresh()
    }

    scrollToTarget()
    const timers = location.hash
      ? [50, 300, 800].map((delay) => window.setTimeout(scrollToTarget, delay))
      : []
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [location.pathname, location.hash])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 100)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Header />
      <main id="main" style={{ marginTop: 50 }}>
        <Outlet />
      </main>
      <Footer />
      <a
        href="#top"
        className={`scroll-top d-flex align-items-center justify-content-center${showTop ? ' active' : ''}`}
        onClick={(event) => {
          event.preventDefault()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        aria-label="Scroll to top"
      >
        <i className="bi bi-arrow-up-short" />
      </a>
      {booting ? <div id="preloader" /> : null}
    </>
  )
}
