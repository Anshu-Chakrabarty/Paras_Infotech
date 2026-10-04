import usePageTitle from '../hooks/usePageTitle.js'

export default function Privacy() {
  usePageTitle('Privacy Policy')

  return (
    <section id="alt-services" className="alt-services why-choose-us">
      <div className="container" data-aos="fade-up">
        <div className="row justify-content-around">
          <div className="col-lg-12 why-choose-us-content d-flex flex-column justify-content-center">
            <h3>Privacy Policy</h3>
            <p>Paras Infotech Solutions is a portal for a Software application Development company located in Kolkata, West Bengal, India. The portal is used only to share information about our company, our Vision and Mission statement, the type of services we offer, the way we develop applications and the service we provide to our customers. We only intend to provide you with requested information and services, to conduct our business.</p>
            <p>We do not collect or share any personal information of our customers, including their name, address, contact information, signature, cast, Religion, Nationality, marital status, financial data or any other sensitive data</p>
            <p>We do not track user location, servers, or any other IT related data for patrons visiting our portal. As you use the Portal, you may link to third-party sites not controlled by us and which do not operate under our privacy practices</p>
          </div>
        </div>
      </div>
    </section>
  )
}
