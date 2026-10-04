import usePageTitle from '../hooks/usePageTitle.js'

const values = [
  {
    title: 'Customer Centricity',
    text: 'To relentlessly drive the quality, costs and delivery of our IT services and solutions with a focused customer centric approach through prompt and proactive communication to provide customer delight.',
  },
  {
    title: 'Business Ethics and Transparency',
    text: 'To be honest, dedicated, fair, transparent, sincere, and open in all our customer transactions.',
  },
  {
    title: 'Respect',
    text: 'To hold our customers, partners, colleagues, and stakeholders in great esteem, dignity and prestige.',
  },
  {
    title: 'Innovation',
    text: 'To continuously strive to be technologically innovative and achieve process excellence in order to enable our customers harvest significant business advantages.',
  },
]

export default function About() {
  usePageTitle('About')

  return (
    <>
      <section id="blog" className="blog">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-5">
            <div className="col-lg-12">
              <div className="blog-details">
                <h2 className="title">About Us</h2>
                <div className="content">
                  <p>
                    <strong>Paras Infotech Solution</strong> is a software Development company formed by professionals with over 20 years of industry experience. The company focuses on custom software development for clients on diversified areas like healthcare, ecommerce, financial planning and projections, travel & tourism, Restaurants & cloud kitchens and many more. The Development team is based out of India but we serve global markets on varying business needs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="post-author d-flex align-items-center">
            <img src="/assets/img/Visionimg1.jpeg" className="rounded-circle flex-shrink-0" alt="" />
            <div>
              <h4>Vision</h4>
              <p>Enabling our customers to leverage technology for business growth and success.</p>
            </div>
          </div>

          <div className="post-author d-flex align-items-center">
            <img src="/assets/img/mission.jpeg" className="rounded-circle flex-shrink-0" alt="" />
            <div>
              <h4>Mission</h4>
              <p>
                Our mission is to deliver innovative and scalable IT solutions which add value to our client's business. We strive to exceed client's expectations by going beyond software to provide best Web solutions that transform data into knowledge, enabling them to solve their problems.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="why-choose-us" className="alt-services why-choose-us">
        <div className="container" data-aos="fade-up">
          <div className="row justify-content-around gy-4">
            <div
              className="col-lg-6 img-bg"
              style={{ backgroundImage: 'url(/assets/img/CoreValues2.jpeg)' }}
              data-aos="zoom-in"
              data-aos-delay="100"
            />
            <div className="col-lg-5 d-flex flex-column justify-content-center">
              <h3>Core Values</h3>
              <p>Our core values that accentuate our standards of work and commitment to customers have been always drawn from the following unwavering guiding principles.</p>
              {values.map((value, index) => (
                <div key={value.title} className="icon-box d-flex position-relative" data-aos="fade-up" data-aos-delay={(index + 1) * 100}>
                  <div>
                    <h4><span className="stretched-link">{value.title}</span></h4>
                    <p>{value.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="alt-services" className="alt-services why-choose-us">
        <div className="container" data-aos="fade-up">
          <div className="row justify-content-between gy-4">
            <div className="col-lg-5 text-center" data-aos="fade-up" data-aos-delay="200">
              <img src="/assets/img/team/Sudipto_Goswami_Founder1.jpeg" alt="Sudipto Goswami" className="rounded-circle img-fluid about-page-img" />
            </div>
            <div className="col-lg-7" data-aos="fade-up">
              <div className="content">
                <h3>About our Founder</h3>
                <p>
                  <strong> Sudipto Goswami</strong> is the Founder of Paras Infotech Solutions. He has a Software Product management experience of <strong>25 years</strong> with 10+ years of executive management level experience in MNC, directing and managing various organizations in a <strong>global role</strong>. He has a proven experience in understanding business and technology to <strong>digitalize</strong> process.
                </p>
                <br />
                <p>
                  He has been instrumental in creating strategy and goals for various organizations as startup which transpired to be a profit centre in quick time. Most of those startups are established business drivers now.
                </p>
                <p>
                  He has success in diversified functional areas like conceptualizing and creating Education platforms, creating APIs for standard engineering applications, which helps the last mile customization required by large MNCs to achieve their design objectives, advance industrial research on digitalization of infrastructure workflow with Building Information Modelling (BIM) & Digital Twins in North America & Asia.
                </p>
                <p>
                  His core work areas are new product development & merger of products with intersecting functionalities. He has led and implemented SCAMPI for Level-5 CMMI for product development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
