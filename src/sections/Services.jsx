import { motion, useScroll, useTransform } from 'framer-motion';
import { Layers, Cuboid, MonitorPlay, Zap } from 'lucide-react';
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
    icon: <Zap size={32} />,
    title: 'Turnkey Execution',
    desc: 'End-to-end project management from initial 3D rendering to on-site installation and dismantling.'
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
