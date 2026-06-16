import { motion, useScroll, useTransform } from 'framer-motion';
import { Target, Lightbulb, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';
import taskarImg from '../assets/taskar.png';
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
            <img src={taskarImg} alt="Taskar exhibition" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '20px' }} />
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

        {/* Founder Spotlight Card */}
        <motion.div 
          className="founder-spotlight glass-panel"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="founder-avatar-container">
            <div className="founder-avatar-placeholder">
              <span>SR</span>
            </div>
          </div>
          <div className="founder-spotlight-content">
            <span className="founder-label">The Visionary</span>
            <h3 className="founder-name">Shivdeep Roy</h3>
            <p className="founder-title">Founder & Principal Designer</p>
            <p className="founder-quote">
              "We don't just build structures; we craft three-dimensional narratives that translate brand values into tangible, memorable exhibition experiences."
            </p>
            <Link to="/founder" className="founder-btn">
              Explore Founder Portfolio →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
