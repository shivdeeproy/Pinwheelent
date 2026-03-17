import { motion, useScroll, useTransform } from 'framer-motion';
import { Target, Lightbulb, PenTool } from 'lucide-react';
import './About.css';

const About = () => {
  const { scrollYProgress } = useScroll();
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-grid">
          <motion.div 
            className="about-image glass-panel"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            style={{ y: yOffset }}
          >
            {/* Placeholder for about image - Using CSS styling instead of an actual image tag to prevent requests before image generation */}
            <div className="about-img-placeholder"></div>
          </motion.div>
          
          <motion.div 
            className="about-content"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="section-title">Crafting Spatial Experiences</h2>
            <p className="about-desc">
              At Pinwheelent, we believe that a physical space should be more than just square footage—it should be a three-dimensional embodiment of your brand's ethos. We specialize in conceptualizing and fabricating premium exhibition stalls that ensure you stand out in crowded expos.
            </p>
            
            <div className="about-features">
              <div className="feature-item">
                <div className="feature-icon"><Lightbulb size={24} /></div>
                <div className="feature-text">
                  <h4>Innovative Concepts</h4>
                  <p>Breaking the mold with modern architecture</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><PenTool size={24} /></div>
                <div className="feature-text">
                  <h4>Precision Fabrication</h4>
                  <p>Impeccable build quality and finishing</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Target size={24} /></div>
                <div className="feature-text">
                  <h4>Strategic Layouts</h4>
                  <p>Optimized for footfall and engagement</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
