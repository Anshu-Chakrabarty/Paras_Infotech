import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Services from './pages/Services.jsx'
import Contact from './pages/Contact.jsx'
import Privacy from './pages/Privacy.jsx'
import Terms from './pages/Terms.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="Home/Index" element={<Navigate to="/" replace />} />
        <Route path="About/About" element={<Navigate to="/about" replace />} />
        <Route path="Services/Services" element={<Navigate to="/services" replace />} />
        <Route path="ContactUs/ContactUs" element={<Navigate to="/contact" replace />} />
        <Route path="Home/Privacy" element={<Navigate to="/privacy" replace />} />
        <Route path="Home/Terms" element={<Navigate to="/terms" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
