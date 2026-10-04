import { useEffect, useRef, useState } from 'react'
import usePageTitle from '../hooks/usePageTitle.js'

const emptyContact = { name: '', email: '', phone: '', enquiryType: '', message: '' }
const emptyCareer = {
  name: '',
  email: '',
  phone: '',
  education: '',
  experience: '',
  skills: '',
  profession: '',
  engagement: '',
  about: '',
  message: '',
}

function Alert({ notice, onClose }) {
  if (!notice) return null
  return (
    <div className={`form-alert ${notice.type}`} role="status">
      <strong>{notice.type === 'success' ? 'Success' : 'Error'}. </strong>
      {notice.message}
      <button type="button" className="btn btn-sm btn-link" onClick={onClose}>Dismiss</button>
    </div>
  )
}

export default function Contact() {
  usePageTitle('ContactUs')
  const [contact, setContact] = useState(emptyContact)
  const [career, setCareer] = useState(emptyCareer)
  const [cv, setCv] = useState(null)
  const [contactErrors, setContactErrors] = useState({})
  const [careerErrors, setCareerErrors] = useState({})
  const [contactNotice, setContactNotice] = useState(null)
  const [careerNotice, setCareerNotice] = useState(null)
  const [sendingContact, setSendingContact] = useState(false)
  const [sendingCareer, setSendingCareer] = useState(false)
  const [contactUnlocked, setContactUnlocked] = useState(false)
  const [careerUnlocked, setCareerUnlocked] = useState(false)
  const contactMessage = useRef('')
  const careerMessage = useRef('')

  useEffect(() => {
    window.enableContactBtn = () => setContactUnlocked(true)
    window.enableCareerBtn = () => setCareerUnlocked(true)

    function mountEditors() {
      if (!window.Quill || document.querySelector('#MessageContact .ql-editor')) return
      const contactEditor = new window.Quill('#MessageContact', { theme: 'snow', placeholder: 'Message' })
      const careerEditor = new window.Quill('#MessageCareers', { theme: 'snow', placeholder: 'Message' })
      contactMessage.editor = contactEditor
      careerMessage.editor = careerEditor
      contactEditor.on('text-change', () => {
        contactMessage.current = contactEditor.getText().trim() ? contactEditor.root.innerHTML : ''
      })
      careerEditor.on('text-change', () => {
        careerMessage.current = careerEditor.getText().trim() ? careerEditor.root.innerHTML : ''
      })
    }

    let quillScript = document.querySelector('script[data-quill]')
    if (!quillScript) {
      quillScript = document.createElement('script')
      quillScript.src = 'https://cdn.quilljs.com/1.3.7/quill.min.js'
      quillScript.dataset.quill = 'true'
      document.body.appendChild(quillScript)
    }
    quillScript.addEventListener('load', mountEditors)
    if (window.Quill) mountEditors()

    if (!document.querySelector('script[data-recaptcha]')) {
      const recaptcha = document.createElement('script')
      recaptcha.src = 'https://www.google.com/recaptcha/api.js'
      recaptcha.async = true
      recaptcha.defer = true
      recaptcha.dataset.recaptcha = 'true'
      document.body.appendChild(recaptcha)
    }

    return () => {
      delete window.enableContactBtn
      delete window.enableCareerBtn
    }
  }, [])

  function validateContact() {
    const errors = {}
    if (!contact.name.trim()) errors.name = 'Name is required.'
    if (!contact.email.trim()) errors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errors.email = 'Enter a valid email.'
    if (!contact.enquiryType) errors.enquiryType = 'Enquiry type is required.'
    if (!contact.message.trim() && !contactMessage.current.trim()) errors.message = 'Message is required.'
    return errors
  }

  function validateCareer() {
    const errors = {}
    if (!career.name.trim()) errors.name = 'Name is required.'
    if (!career.email.trim()) errors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(career.email)) errors.email = 'Enter a valid email.'
    if (!career.education.trim()) errors.education = 'Educational details are required.'
    if (!career.skills.trim()) errors.skills = 'Skills are required.'
    if (!career.profession) errors.profession = 'Profession is required.'
    if (!career.about.trim()) errors.about = 'Tell us about yourself.'
    if (!career.message.trim() && !careerMessage.current.trim()) errors.message = 'Message is required.'
    if (!cv) errors.cv = 'Please upload your CV.'
    else if (!/\.(doc|docx|pdf)$/i.test(cv.name)) errors.cv = 'Only .doc, .docx, and .pdf files are allowed.'
    return errors
  }

  async function submitContact(event) {
    event.preventDefault()
    const errors = validateContact()
    setContactErrors(errors)
    setContactNotice(null)
    if (Object.keys(errors).length) return

    setSendingContact(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contact, message: contactMessage.current || contact.message }),
      })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || 'Internal server error!')
      setContact(emptyContact)
      contactMessage.current = ''
      contactMessage.editor?.setText('')
      setContactNotice({ type: 'success', message: data.message })
    } catch (error) {
      setContactNotice({ type: 'error', message: error.message || 'Internal server error!' })
    } finally {
      setSendingContact(false)
    }
  }

  async function submitCareer(event) {
    event.preventDefault()
    const errors = validateCareer()
    setCareerErrors(errors)
    setCareerNotice(null)
    if (Object.keys(errors).length) return

    const form = new FormData()
    Object.entries({ ...career, message: careerMessage.current || career.message }).forEach(([key, value]) => form.append(key, value))
    form.append('cv', cv)

    setSendingCareer(true)
    try {
      const response = await fetch('/api/careers', { method: 'POST', body: form })
      const data = await response.json()
      if (!response.ok || !data.ok) throw new Error(data.message || 'Internal server error!')
      setCareer(emptyCareer)
      careerMessage.current = ''
      careerMessage.editor?.setText('')
      setCv(null)
      event.target.reset()
      setCareerNotice({ type: 'success', message: data.message })
    } catch (error) {
      setCareerNotice({ type: 'error', message: error.message || 'Internal server error!' })
    } finally {
      setSendingCareer(false)
    }
  }

  return (
    <section id="contact" className="contact">
      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="section-header">
          <h2>Contact us</h2>
        </div>

        <div className="row gy-4 mt-1">
          <div className="col-lg-12">
            <form className="php-email-form" onSubmit={submitContact} noValidate>
              <h3>Get in touch</h3>
              <p>Please feel free to fill out the form below to reach out to us. A representative from Paras Infotech Solution will contact you shortly.</p>
              <Alert notice={contactNotice} onClose={() => setContactNotice(null)} />
              <div className="row">
                <div className="col-lg-4 form-group">
                  <input className="form-control" placeholder="Your Name" value={contact.name} onChange={(event) => setContact({ ...contact, name: event.target.value })} required />
                  {contactErrors.name ? <span className="field-error">{contactErrors.name}</span> : null}
                </div>
                <div className="col-lg-4 form-group">
                  <input type="email" className="form-control" placeholder="Your Email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} required />
                  {contactErrors.email ? <span className="field-error">{contactErrors.email}</span> : null}
                </div>
                <div className="col-lg-4 form-group">
                  <input className="form-control" placeholder="PhoneNo" value={contact.phone} onChange={(event) => setContact({ ...contact, phone: event.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <select className="form-control" value={contact.enquiryType} onChange={(event) => setContact({ ...contact, enquiryType: event.target.value })} required>
                  <option value="">--Enquiry Type--</option>
                  <option value="New Project">New Project</option>
                  <option value="Support">Support</option>
                  <option value="Careers">Careers</option>
                  <option value="Consultancy">Consultancy</option>
                  <option value="Others">Others</option>
                </select>
                {contactErrors.enquiryType ? <span className="field-error">{contactErrors.enquiryType}</span> : null}
              </div>
              <div className="form-group">
                <div id="MessageContact" style={{ height: 150 }} />
                {contactErrors.message ? <span className="field-error">{contactErrors.message}</span> : null}
              </div>
              <br />
              <div className="form-group">
                <div className="g-recaptcha" data-sitekey="6Lc-5agqAAAAAJzgLhslc7-mDgV6jX18E8tkyTii" data-callback="enableContactBtn" />
              </div>
              <div className="text-left">
                <button type="submit" id="contactSubmitBtn" disabled={!contactUnlocked || sendingContact}>{sendingContact ? 'Sending...' : 'Send Message'}</button>
              </div>
            </form>
          </div>
        </div>

        <div className="row gy-4 mt-1">
          <div className="col-lg-12">
            <form className="php-email-form" onSubmit={submitCareer} noValidate>
              <h3>Careers</h3>
              <p>If you are interested to be a part of a leading development team, please write to us about you along with your CV. We are open to working with interns, passionate developers, UX designers, QA for a full-time engagement or a freelancer.</p>
              <Alert notice={careerNotice} onClose={() => setCareerNotice(null)} />
              <div className="row">
                <div className="col-lg-4 form-group">
                  <input className="form-control" placeholder="Your Name" value={career.name} onChange={(event) => setCareer({ ...career, name: event.target.value })} required />
                  {careerErrors.name ? <span className="field-error">{careerErrors.name}</span> : null}
                </div>
                <div className="col-lg-4 form-group">
                  <input type="email" className="form-control" placeholder="Your Email" value={career.email} onChange={(event) => setCareer({ ...career, email: event.target.value })} required />
                  {careerErrors.email ? <span className="field-error">{careerErrors.email}</span> : null}
                </div>
                <div className="col-lg-4 form-group">
                  <input className="form-control" placeholder="PhoneNo" value={career.phone} onChange={(event) => setCareer({ ...career, phone: event.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <input className="form-control" placeholder="Educational Details" value={career.education} onChange={(event) => setCareer({ ...career, education: event.target.value })} required />
                {careerErrors.education ? <span className="field-error">{careerErrors.education}</span> : null}
              </div>
              <div className="form-group">
                <input className="form-control" placeholder="Experience" value={career.experience} onChange={(event) => setCareer({ ...career, experience: event.target.value })} />
              </div>
              <div className="form-group">
                <input className="form-control" placeholder="Skills (Technology) " value={career.skills} onChange={(event) => setCareer({ ...career, skills: event.target.value })} required />
                {careerErrors.skills ? <span className="field-error">{careerErrors.skills}</span> : null}
              </div>
              <div className="form-group">
                <select className="form-control" value={career.profession} onChange={(event) => setCareer({ ...career, profession: event.target.value })} required>
                  <option value="">--Profession--</option>
                  <option value="Student">Student</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Professional">Professional</option>
                </select>
                {careerErrors.profession ? <span className="field-error">{careerErrors.profession}</span> : null}
              </div>
              <div className="form-group">
                <select className="form-control" value={career.engagement} onChange={(event) => setCareer({ ...career, engagement: event.target.value })}>
                  <option value="">--Preferred Type Engagement--</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Short Term">Short Term</option>
                  <option value="Long Term">Long Term</option>
                </select>
              </div>
              <div className="form-group">
                <input className="form-control" placeholder="About yourself" value={career.about} onChange={(event) => setCareer({ ...career, about: event.target.value })} required />
                {careerErrors.about ? <span className="field-error">{careerErrors.about}</span> : null}
              </div>
              <div className="form-group">
                <div id="MessageCareers" style={{ height: 150 }} />
                {careerErrors.message ? <span className="field-error">{careerErrors.message}</span> : null}
              </div>
              <div className="form-group form-control">
                <input type="file" accept=".doc,.docx,.pdf" className="form-control-file" onChange={(event) => setCv(event.target.files?.[0] || null)} required />
                {careerErrors.cv ? <span className="field-error">{careerErrors.cv}</span> : null}
              </div>
              <br />
              <div className="form-group">
                <div className="g-recaptcha" data-sitekey="6Ld966gqAAAAAJSQ_y7lVE6V0yvytqvH3m_B770C" data-callback="enableCareerBtn" />
              </div>
              <div className="text-left">
                <button type="submit" id="careerSubmitBtn" disabled={!careerUnlocked || sendingCareer}>{sendingCareer ? 'Sending...' : 'Send Message'}</button>
              </div>
            </form>
          </div>
        </div>

        <div className="row gy-4 mt-1">
          <div className="col-lg-6">
            <iframe
              title="Paras Infotech Solutions location"
              src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3687.598242833957!2d88.39057807529672!3d22.4441424795834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sP-52%2C%20Nilachal%20Complex%2C4th%20Row%2C%20Narendrapur%2C%0D%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20Kolkata%2C%20700103!5e0!3m2!1sen!2sin!4v1731128619475!5m2!1sen!2sin"
              style={{ border: 0, width: '100%', height: 384 }}
              allowFullScreen
            />
          </div>
          <div className="col-lg-6">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="info-item d-flex flex-column justify-content-center align-items-center">
                  <i className="bi bi-envelope" />
                  <h3>Email Us</h3>
                  <p>parasinfotechsolutions@gmail.com</p>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="info-item d-flex flex-column justify-content-center align-items-center">
                  <i className="bi bi-map" />
                  <h3>Our Address</h3>
                  <p>P-52, Nilachal Complex,4th Row, Narendrapur, Kolkata, 700103</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
