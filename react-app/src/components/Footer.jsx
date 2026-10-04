import { Link } from 'react-router-dom'

const services = [
  { hash: 'enterprise-app', label: 'Enterprise Software' },
  { hash: 'web-app', label: 'Web-based Application' },
  { hash: 'mobile-desktop-app', label: 'Mobile and Desktop Application' },
  { hash: 'cloud-app', label: 'Cloud-based Software' },
  { hash: 'poc-mvp-app', label: 'PoC and MVP Development' },
  { hash: 'data-system-security-app', label: 'Data and System Security Application' },
]

const year = new Date().getFullYear()

export default function Footer() {

  return (
    <footer id="footer" className="footer">
      <div className="footer-content position-relative">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-4 col-md-6">
              <div className="footer-info">
                <Link to="/" className="logo d-flex align-items-center">
                  <img src="/assets/img/logoPIS-White.png" alt="" width="70" height="65" />
                  <h3>Paras Infotech Solutions</h3>
                </Link>
                <p>
                  Paras Infotech Solution is a software Development company formed by professionals with over 20 years of industry experience.
                  The company focuses on custom software development for clients on diversified areas like healthcare, ecommerce, financial planning and projections, travel & tourism, Restaurants & cloud kitchens and many more. The Development team is based out of India but we serve global markets on varying business needs.
                </p>
              </div>
            </div>

            <div className="col-lg-2 col-md-3 footer-links">
              <h4>Useful Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About us</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/terms" target="_blank" rel="noreferrer">Terms of service</Link></li>
                <li><Link to="/privacy" target="_blank" rel="noreferrer">Privacy policy</Link></li>
              </ul>
            </div>

            <div className="col-lg-3 col-md-3 footer-links">
              <h4>Our Services</h4>
              <ul>
                {services.map((item) => (
                  <li key={item.hash}>
                    <Link to={`/services#${item.hash}`}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-lg-3 col-md-4 footer-links">
              <h4>Get In Touch</h4>
              <p>
                <strong>Email:</strong> parasinfotechsolutions@gmail.com
              </p>
              <ul>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
              <p>
                <strong>Address:</strong><br />
                P-52, Nilachal Complex,<br /> 4th Row, Narendrapur,<br />
                Kolkata, 700103<br /><br />
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-legal text-center position-relative">
        <div className="container">
          <div className="copyright">
            &copy; Copyright <strong><span>{year} Paras Infotech Solutions</span></strong>. All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  )
}
