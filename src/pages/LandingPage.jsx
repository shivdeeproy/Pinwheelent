import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Services from '../sections/Services';
import WorkPreview from '../sections/WorkPreview';
import Clients from '../sections/Clients';
import Testimonials from '../sections/Testimonials';
import Contact from '../sections/Contact';

const LandingPage = () => {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle hash scrolling on init/route change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1); // remove '#'
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  // Monitor scroll for back-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="landing-page mesh-container">
      {/* Decorative premium background glows */}
      <div className="mesh-glow mesh-glow-violet" style={{ top: '15%', left: '10%' }} />
      <div className="mesh-glow mesh-glow-gold" style={{ top: '45%', right: '5%' }} />
      <div className="mesh-glow mesh-glow-indigo" style={{ top: '75%', left: '-5%' }} />

      <Hero />
      <About />
      <Services />
      <WorkPreview />
      <Clients />
      <Testimonials />
      <Contact />

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button 
            className="back-to-top glass-panel"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            aria-label="Back to Top"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
