import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../sections/Hero';
import About from '../sections/About';
import Services from '../sections/Services';
import WorkPreview from '../sections/WorkPreview';
import Contact from '../sections/Contact';

const LandingPage = () => {
  const location = useLocation();

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

  return (
    <div className="landing-page">
      <Hero />
      <About />
      <Services />
      <WorkPreview />
      <Contact />
    </div>
  );
};

export default LandingPage;
