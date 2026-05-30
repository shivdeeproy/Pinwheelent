import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import './Hero.css';
import heroVisualImg from '../assets/hero.png';

const Hero = () => {
  const { scrollY } = useScroll();
  
  // Parallax effects
  const bgY = useTransform(scrollY, [0, 500], [0, 150]);
  const visualY = useTransform(scrollY, [0, 500], [0, -100]);
  
  return (
    <section id="hero" className="hero-section">
      {/* Background Graphic Element - with parallax */}
      <motion.div 
        className="hero-bg-glow"
        style={{ y: bgY }}
      ></motion.div>
      
      <div className="container hero-container">
        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Premium Stall Fabrication
          </motion.div>
          
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Elevate Your Brand <br />
            <span className="text-gradient">Beyond the Ordinary.</span>
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            We design, fabricate, and deliver breathtaking exhibition stalls that captivate audiences and drive meaningful business connections.
          </motion.p>
          
          <motion.div 
            className="hero-cta-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <a href="#work" className="btn-primary">
              View Our Work <ArrowRight size={18} />
            </a>
            <a href="#contact" className="btn-secondary glass-panel">
              Get in Touch
            </a>
          </motion.div>
        </motion.div>

        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{ y: visualY }}
        >
          <div className="hero-image-container glass-panel">
            <img src={heroVisualImg} alt="Pinwheel Expo Stall" className="hero-img" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
