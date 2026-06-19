import { motion, useScroll, useTransform } from 'framer-motion';
import { Layers, Cuboid, MonitorPlay, Store, Contact, BookOpen, Image, Gift } from 'lucide-react';
import './Services.css';

const services = [
  {
    icon: <Cuboid size={32} />,
    title: 'Custom Fabrications',
    desc: 'Bespoke stall designs crafted from the ground up to reflect your unique brand identity and objectives.'
  },
  {
    icon: <Layers size={32} />,
    title: 'Modular Systems',
    desc: 'Flexible, scalable, and reusable exhibition structures designed for multi-show efficiency.'
  },
  {
    icon: <MonitorPlay size={32} />,
    title: 'Interactive Experiences',
    desc: 'Integration of screens, AR/VR, and touchpoints to keep your audience engaged and immersed.'
  },
  {
    icon: <Store size={32} />,
    title: 'Mall Activities, Stages & Kiosks',
    desc: 'Professional stage and event setups, engaging mall activations, and bespoke design-to-installation of indoor brand kiosks.'
  },
  {
    icon: <Contact size={32} />,
    title: 'Corporate Identity & Stationery',
    desc: 'Professional visiting cards, letterheads, envelopes, and official I-cards (ID cards) to standardize your corporate representation.'
  },
  {
    icon: <BookOpen size={32} />,
    title: 'Marketing Collaterals',
    desc: 'High-quality brochure printing, detailed product catalogues, flyers, and pamphlets to present your offerings.'
  },
  {
    icon: <Image size={32} />,
    title: 'Large Format & Flex Printing',
    desc: 'Vibrant flex banners, vinyl backdrops, rollup standees, and custom signages designed for maximum visibility.'
  },
  {
    icon: <Gift size={32} />,
    title: 'Custom Branding & Merchandise',
    desc: 'Personalized corporate gifting, promotional items, custom apparel, and other tailored branding accessories.'
  }
];

const Services = () => {
  const { scrollYProgress } = useScroll();
  
  // Staggering parallax offsets for columns
  const yOffsetEven = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yOffsetOdd = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section id="services" className="services-section">
      <div className="container">
        
        <div className="section-header">
          <motion.h2 
            className="section-title text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our Expertise
          </motion.h2>
          <motion.p 
            className="section-subtitle text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Comprehensive solutions for high-impact brand presence.
          </motion.p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <motion.div 
              key={index} 
              className="service-card glass-panel"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{ y: index % 2 === 0 ? yOffsetEven : yOffsetOdd }}
            >
              <div className="service-icon-wrapper">
                {service.icon}
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-desc">{service.desc}</p>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default Services;
