import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import usePageTitle from '../hooks/usePageTitle.js'

const banners = [
  '/assets/img/banner1.jpg',
  '/assets/img/banner2.jpg',
  '/assets/img/banner3.jpg',
]

const offerings = [
  {
    title: 'Web-based Application',
    image: '/assets/img/Web-Based-Applications.jpg',
    hash: 'web-app',
    text: 'We are experts in developing dynamic and engaging web-based software that transforms the way you interact with customers and manage your online presence.',
  },
  {
    title: 'Mobile and Desktop Application',
    image: '/assets/img/Mobile-Desktop-Application.jpg',
    hash: 'mobile-desktop-app',
    text: 'Our team specializes in building high-quality mobile, desktop, and cross-platform software tailored to meet the unique needs of businesses across industries.',
  },
  {
    title: 'Enterprise Software',
    image: '/assets/img/Enterprise-Software.jpg',
    hash: 'enterprise-app',
    text: 'We specialize in building robust enterprise software solutions that streamline and optimize your business operations. Our solutions are designed to enhance efficiency and reduce overheads.',
  },
  {
    title: 'Cloud-based Software',
    image: '/assets/img/Cloud-based-Application.jpg',
    hash: 'cloud-app',
    text: 'Whether you are looking to build a cloud-based application or migrate existing systems to the cloud, our expertise ensures that your goals are met.',
  },
  {
    title: 'PoC and MVP Development',
    image: '/assets/img/POC-MVP.jpg',
    hash: 'poc-mvp-app',
    text: 'Our team excels at creating PoCs that validate the feasibility of your software concepts by demonstrating key functionalities in a basic form. Additionally, we develop MVPs that deliver essential features to address core user needs.',
  },
  {
    title: 'Data and System Security Application',
    image: '/assets/img/Data-and-System-Security.jpg',
    hash: 'data-system-security-app',
    text: 'In a world where data is our most valuable asset, data security is essential to prevent data breaches and protect sensitive information from malicious actors. Data security is also instrumental in complying with industry and government regulations.',
  },
]

const reasons = [
  {
    title: 'Expertise and Experience',
    image: '/assets/img/Expertise-Experience.jpg',
    imageFirst: true,
    text: 'Professionals with over 20 years of industry experience, Paras Infotech Solutions leads the way in delivering software solutions tailored to meet the unique needs of clients across diverse industries. Our deep expertise in advanced technologies and software development enables us to create highly performant solutions that drive success in our clients’ endeavours.',
  },
  {
    title: 'We Prioritize Security',
    image: '/assets/img/Security1.jpg',
    imageFirst: false,
    text: 'Security is our top priority. Throughout the development process, we adhere to the highest security standards to ensure that your software is secure and reliable. From conducting comprehensive threat assessments to implementing stringent encryption protocols, we employ the best security practices to safeguard your digital assets and protect them from a wide range of security threats.',
  },
  {
    title: 'Customized Solutions',
    image: '/assets/img/Customized_Solutions.jpg',
    imageFirst: true,
    text: 'No matter the size or complexity of your business, we have the expertise to deliver scalable custom software applications that precisely meet your requirements. Whether you are a startup, mid-sized company, or enterprise, our custom solutions are crafted with exceptional quality and performance in mind. From complex enterprise solutions to user-friendly mobile apps, we tailor our solutions to your specific needs.',
  },
  {
    title: 'End-to-end Development',
    image: '/assets/img/End-to-end-Development.jpg',
    imageFirst: false,
    text: 'We specialize in providing end-to-end custom software development services, taking care of every stage of the development process with precision and expertise. From initial concept to final deployment and ongoing support, we ensure seamless execution and delivery of your software solution. With our comprehensive approach, you can trust us to bring your vision to life effectively and efficiently.',
  },
  {
    title: 'Software Development Best Practices',
    image: '/assets/img/Software-Development-Best-Practices.jpg',
    imageFirst: true,
    text: 'We adhere to software development best practices and methodologies to ensure we deliver high-quality software.',
  },
]

export default function Home() {
  usePageTitle('')
  const [slide, setSlide] = useState(0)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % banners.length)
    }, 3000)
    return () => window.clearInterval(timer)
  }, [])

  function openAbout(event) {
    event.preventDefault()
    setExpanded(true)
    const target = document.getElementById('about')
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 225
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <>
      <section id="hero" className="hero">
        <div className="info d-flex align-items-center">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-7 text-center">
                <h2 data-aos="fade-down">
                  <br />
                  <span className="text-warning">Paras Infotech Solutions</span>
                </h2>
                <p data-aos="fade-up">
                  Paras Infotech Solutions is a software Development company to empower your business with our custom Software Development Services.
                </p>
                <a data-aos="fade-up" data-aos-delay="200" href="#about" className="btn-get-started more-button" onClick={openAbout}>
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>

        <div id="hero-carousel" className="carousel slide">
          {banners.map((src, index) => (
            <div
              key={src}
              className={`carousel-item${index === slide ? ' active' : ''}`}
              style={index === slide ? { backgroundImage: `url('${src}')` } : undefined}
            />
          ))}
          <a href="#hero-carousel" className="carousel-control-prev" role="button" onClick={(event) => { event.preventDefault(); setSlide((slide + banners.length - 1) % banners.length) }} aria-label="Previous slide">
            <span className="carousel-control-prev-icon bi bi-chevron-left" aria-hidden="true" />
          </a>
          <a href="#hero-carousel" className="carousel-control-next" role="button" onClick={(event) => { event.preventDefault(); setSlide((slide + 1) % banners.length) }} aria-label="Next slide">
            <span className="carousel-control-next-icon bi bi-chevron-right" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section id="about" className="about">
        <div className="container">
          <div className="row position-relative">
            <div className="col-lg-12">
              <h2>Paras Infotech Solutions</h2>
              <div className="our-story1">
                <p>
                  <b>Paras Infotech Solutions is a software Development company to empower your business with our custom Software Development Services</b>
                </p>
                <p>
                  Tailored to fit your specific needs, budget, and timeframe, our cutting-edge software solutions are engineered for success, elevating operational efficiency and empowering you with a distinct competitive advantage.
                </p>
                <p className={`moretext${expanded ? ' is-open' : ''}`}>
                  <b>Paras Infotech Solutions</b> is a software Development company focusing on custom software application development in diversified areas with leading edge technology for startups & medium sized companies.
                  Is your business being held back by outdated technology? Inefficient systems can hinder growth and limit your potential. We design and develop custom software solutions that streamline operations, increase productivity, and unlock new opportunities, empowering your business to reach its full potential.
                  We are responsible for delivering top-quality, secure, and adaptable digital solutions that satisfy the needs of today and unlock the opportunities of tomorrow.
                  We offer tailor-made software development services for startups, medium-sized companies, and large enterprises.
                  Our team of software developers and engineers leverages their expertise in AI, Web and mobile applications, Data security, desktop applications and other advanced technologies, alongside industry insight, to create innovative software solutions. Whether you are a startup looking to build your first software or an enterprise seeking to modernize your legacy systems, we bring your vision to life. Partner with us for robust software tailored to streamline your processes, enhance productivity and position you for success in today’s rapidly evolving market landscape.
                </p>
                <button type="button" className="btn btn-warning moreless-button" onClick={() => setExpanded((open) => !open)}>
                  {expanded ? 'Read less' : 'Read more'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="services section-bg service-padding">
        <div className="container aos-init aos-animate" data-aos="fade-up">
          <div className="section-header">
            <h2>Types of Software we build</h2>
          </div>
          <div className="row gy-4">
            {offerings.map((item) => (
              <div key={item.hash} className="col-lg-4 col-md-6 aos-init aos-animate mb-3" data-aos="fade-up" data-aos-delay="10">
                <div className="service-item position-relative">
                  <div className="image">
                    <img src={item.image} alt="" loading="lazy" decoding="async" />
                  </div>
                  <div className="service-content">
                    <div style={{ height: 250, overflow: 'hidden' }}>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                    <Link to={`/services#${item.hash}`} className="readmore stretched-link">
                      <span>Read More</span>
                      <i className="bi bi-arrow-right" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="alt-services" className="constructions" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-header">
            <h2>Why choose us</h2>
          </div>
          <div className="row gy-4">
            {reasons.map((item) => (
              <div key={item.title} className="col-lg-12" data-aos="fade-up">
                <div className="card-item">
                  <div className="row">
                    {item.imageFirst ? (
                      <div className="col-xl-5">
                        <div className="card-bg" style={{ backgroundImage: `url('${item.image}')` }} />
                      </div>
                    ) : null}
                    <div className="col-xl-7 d-flex align-items-center">
                      <div className="card-body">
                        <h4 className="card-title">{item.title}</h4>
                        <p>{item.text}</p>
                      </div>
                    </div>
                    {item.imageFirst ? null : (
                      <div className="col-xl-5">
                        <div className="card-bg" style={{ backgroundImage: `url('${item.image}')` }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
