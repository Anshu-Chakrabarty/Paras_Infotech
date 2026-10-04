import { Link } from 'react-router-dom'
import usePageTitle from '../hooks/usePageTitle.js'

const sidebar = [
  { hash: 'web-app', label: 'Custom Software Application', active: true },
  { hash: 'web-app', label: 'Web Development Services' },
  { hash: 'mobile-desktop-app', label: 'Mobile Applications' },
  { hash: 'cloud-app', label: 'Cloud & DevOps' },
  { hash: 'poc-mvp-app', label: 'PoC and MVP Development' },
  { hash: 'enterprise-app', label: 'Enterprise Software' },
  { hash: 'web-app', label: 'AI Based Optimization' },
  { hash: 'data-system-security-app', label: 'Data & System Security Applications' },
]

const softwareTypes = [
  {
    id: 'enterprise-app',
    title: 'Enterprise Software',
    image: '/assets/img/Enterprise-Software.jpg',
    imageFirst: true,
    paragraphs: [
      'We specialize in building robust enterprise software solutions that streamline and optimize your business operations. Our solutions are designed to enhance efficiency and reduce overheads by streamlining tasks such as inventory management, customer relationship management, and enterprise resource planning. With our software, you can achieve heightened productivity and operational excellence.',
    ],
  },
  {
    id: 'web-app',
    title: 'Web-based Application',
    image: '/assets/img/Web-Based-Applications.jpg',
    imageFirst: false,
    paragraphs: [
      'We are experts in developing dynamic and engaging web-based software that transforms the way you interact with customers and manage your online presence. Whether you need a robust e-commerce portal to drive sales or a social networking platform to foster community engagement, we have the expertise and experience to bring your vision to life.',
    ],
  },
  {
    id: 'mobile-desktop-app',
    title: 'Mobile and Desktop Application',
    image: '/assets/img/Mobile-Desktop-Application.jpg',
    imageFirst: true,
    paragraphs: [
      'Our team specializes in building high-quality mobile, desktop, and cross-platform software tailored to meet the unique needs of businesses across industries. Using cutting-edge technologies and best practices, we deliver robust, reliable, and user-friendly software across various platforms, including iOS, Android, Windows, and macOS.',
    ],
  },
  {
    id: 'cloud-app',
    title: 'Cloud-based Application',
    image: '/assets/img/Cloud-based-Application.jpg',
    imageFirst: false,
    paragraphs: [
      'Whether you are looking to build a cloud-based application or migrate existing systems to the cloud, our expertise ensures that your goals are met. Leveraging cloud infrastructure, our software solutions provide unmatched flexibility and scalability while ensuring seamless accessibility, empowering you to evolve and expand effortlessly.',
    ],
  },
  {
    id: 'poc-mvp-app',
    title: 'PoC and MVP Development',
    image: '/assets/img/POC-MVP.jpg',
    imageFirst: true,
    paragraphs: [
      'Our team excels at creating PoCs that validate the feasibility of your software concepts by demonstrating key functionalities in a basic form. Additionally, we develop MVPs that deliver essential features to address core user needs, allowing you to launch your software product quickly and gather valuable user feedback for further iteration. This approach helps you minimize risk and accelerate the time to market for your software solutions.',
    ],
  },
  {
    id: 'data-system-security-app',
    title: 'Data and System Security Application',
    image: '/assets/img/Data-and-System-Security.jpg',
    imageFirst: false,
    paragraphs: [
      'In a world where data is our most valuable asset, data security is essential to prevent data breaches and protect sensitive information from malicious actors. Data security is also instrumental in complying with industry and government regulations.',
      'Our goals are to protect sensitive data from external attacks and insider threats, gain visibility into data security threats, secure digital transformation initiatives, reduce the likelihood of a data breach & build, implement, and maintain security and compliance in the most cost-effective way.',
      'With increasingly complex data environments, security techniques have evolved to protect data across multiple clouds, numerous files, dozens of business-critical applications, and more. We do it by continually assessing risks and vulnerabilities with real-time automated notifications, automated discovery and classification, unified dashboards and vulnerability management along with robust and consistent security policy application across multi-cloud, hybrid cloud, and on-premises data store topologies. Our data protection methodologies include Data encryption, Authentication, Data masking and Tokenization.',
    ],
  },
]

const processSteps = [
  {
    title: 'Discovery, Analysis and Planning',
    image: '/assets/img/Discovery-Analysis-Planning.jpg',
    imageClass: 'srvimg1',
    paragraphs: [
      'We gather and analyze project requirements, define goals, and chart a roadmap for development. Collaborating closely with stakeholders, we identify project scope, objectives, and constraints. Then we create a comprehensive project plan, complete with timelines, milestones, resource allocation, and risk management strategies, setting the stage for successful project execution aligned to business objectives and market needs.',
    ],
  },
  {
    title: 'UI/UX and Architecture Design',
    image: '/assets/img/UX-Architecture.jpg',
    imageClass: 'srvimg2',
    paragraphs: [
      'During this phase, we focus on crafting intuitive and visually appealing user interfaces while designing the underlying architecture to support optimal performance and scalability. Our team collaborates closely with stakeholders to understand user needs and preferences, ensuring that the interface is user-friendly and enhances the overall user experience. With attention to detail and a focus on usability best practices, we ensure that our designs reflect your brand identity and enhance user satisfaction. Whether you are developing a web application or desktop software, our UX/UI design services are tailored to elevate your software and drive user engagement.',
      'Simultaneously, we design the software architecture, considering factors such as scalability, security, and system integrations to lay a solid foundation for the development process.',
    ],
  },
  {
    title: 'Agile Development',
    image: '/assets/img/Agile-Development.jpg',
    imageClass: 'srvimg3',
    paragraphs: [
      'Our expert developers write clean, efficient code and build the software using suitable programming languages and frameworks. Maintaining high-quality code standards, we regularly update Version Control Systems like Github for seamless collaboration and progress tracking, ensuring a streamlined development cycle and robust version control.',
    ],
  },
  {
    title: 'Testing and Quality Assurance',
    image: '/assets/img/Quality-Control.jpg',
    imageClass: 'srvimg4',
    paragraphs: [
      'Whether it’s a web application, AI application, or any other software, we conduct comprehensive testing before deploying it into production. Specialized provisioning tools create temporary environments for realistic testing scenarios. Our testers rigorously test functionality, logging all issues for prioritization and inclusion in future development cycles. We also execute beta testing in client environment.',
    ],
  },
  {
    title: 'Deployment',
    image: '/assets/img/Development-Process.jpg',
    imageClass: 'srvimg5',
    paragraphs: [
      'During the Deployment phase, we transition from development to implementation, bringing the software solution to life and making it available to users. This phase involves careful planning and execution to ensure a smooth rollout of the software into the production environment. Our team coordinates closely with stakeholders to schedule deployment activities, including software installation, configuration, and testing. We carefully monitor the deployment process to identify and address any issues or unexpected challenges that may arise.',
    ],
  },
  {
    title: 'Maintenance and Support',
    image: '/assets/img/Maintenance-Support.jpg',
    imageClass: 'srvimg6',
    paragraphs: [
      'At Paras Infotech Solutions, our support continues even after your software goes live. We constantly monitor it, promptly fix any issues, and update it to meet your business’s changing needs. Our approach ensures your software stays up-to-date and in step with your strategic goals, validated by user feedback and outcomes. Our team of developers offers ongoing support and maintenance services to ensure your software remains optimized and secure. We enhance your software’s longevity and efficiency by proactively addressing issues, implementing security updates, and improving performance. Our maintenance services guarantee that your software continuously evolves to meet your business needs.',
    ],
  },
  {
    title: 'PoC and MVP Development',
    image: '/assets/img/POC-MVP.jpg',
    imageClass: 'srvimg7',
    paragraphs: [
      'Our team excels at creating PoCs that validate the feasibility of your software concepts by demonstrating key functionalities in a basic form. Additionally, we develop MVPs that deliver essential features to address core user needs, allowing you to launch your software product quickly and gather valuable user feedback for further iteration. This approach helps you minimize risk and accelerate the time to market for your software solutions.',
    ],
  },
]

function SoftwareCard({ item }) {
  const image = (
    <div className="col-xl-5">
      <div className="card-bg" style={{ backgroundImage: `url('${item.image}')` }} />
    </div>
  )
  const copy = (
    <div className="col-xl-7 d-flex align-items-center">
      <div className="card-body">
        <h4 className="card-title">{item.title}</h4>
        {item.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </div>
  )

  return (
    <div id={item.id} className="col-lg-12" data-aos="fade-up">
      <div className="card-item cardRspOrder">
        <div className="row">
          {item.imageFirst ? image : copy}
          {item.imageFirst ? copy : image}
        </div>
      </div>
    </div>
  )
}

export default function Services() {
  usePageTitle('Services')

  return (
    <>
      <section id="blog" className="blog">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-5">
            <div className="col-lg-7">
              <div className="blog-details">
                <div className="post-img">
                  <img src="/assets/img/Mobile-Desktop-Application.jpg" alt="" className="img-fluid" loading="lazy" decoding="async" />
                </div>
                <h2 className="title">Services</h2>
                <div className="content">
                  <p>
                    <b>Paras Infotech Solutions is a software Development company to empower your business with our custom Software Development Services</b>
                  </p>
                  <p>
                    Tailored to fit your specific needs, budget, and timeframe, our cutting-edge software solutions are engineered for success, elevating operational efficiency and empowering you with a distinct competitive advantage.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="sidebar">
                <h5>Software Development Services We Offer</h5>
                <div className="col-lg-12 service-details">
                  <div className="services-list">
                    {sidebar.map((item) => (
                      <Link key={item.label} to={`/services#${item.hash}`} className={item.active ? 'active' : undefined}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="constructions" className="constructions">
        <div className="container" data-aos="fade-up">
          <div className="section-header">
            <h2>Types of Software we build</h2>
          </div>
          <div className="row gy-4">
            {softwareTypes.map((item) => (
              <SoftwareCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section id="alt-services" className="alt-services why-choose-us developmentProcess">
        <div className="container" data-aos="fade-up">
          <div className="row justify-content-around">
            <div className="col-lg-12 why-choose-us-content d-flex flex-column justify-content-center">
              <h3>Our Software Development Process</h3>
              <p>
                At <strong>Paras Infotech Solutions</strong> , we utilize the agile software development process. Our teams are familiar with Agile and waterfall methodologies. We’re responsive to our client’s unique needs, and we pride ourselves on delivering solutions that exceed expectations.
              </p>
              {processSteps.map((step) => (
                <div key={step.title} className="icon-box d-flex position-relative align-items-center" data-aos="fade-up">
                  <img className={step.imageClass} src={step.image} alt="" />
                  <div>
                    <h4><span className="stretched-link">{step.title}</span></h4>
                    {step.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
