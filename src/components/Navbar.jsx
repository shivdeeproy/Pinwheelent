import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to section if on landing page, otherwise navigate
  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Logic for navigating from work detail to home section handles in LandingPage
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'nav-scrolled glass-panel' : ''}`}>
      <div className="container nav-container">
        {/* Desktop Nav */}
        <Link to="/" className="nav-logo">
          {/* Using light logo for dark theme by default */}
          <img src={logo} alt="Pinwheel Enterprise" style={{ height: '40px', width: 'auto' }} />
        </Link>
        <div className="nav-links desktop-only">
          <Link to="/" onClick={() => handleNavClick('hero')} className="nav-link">Home</Link>
          <Link to="/#about" onClick={() => handleNavClick('about')} className="nav-link">About Us</Link>
          <Link to="/#services" onClick={() => handleNavClick('services')} className="nav-link">Services</Link>
          <Link to="/#work" onClick={() => handleNavClick('work')} className="nav-link">Work</Link>
          <Link to="/#contact" onClick={() => handleNavClick('contact')} className="nav-btn">Start Project</Link>
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu glass-panel">
          <Link to="/" onClick={() => handleNavClick('hero')} className="mobile-link">Home</Link>
          <Link to="/#about" onClick={() => handleNavClick('about')} className="mobile-link">About Us</Link>
          <Link to="/#services" onClick={() => handleNavClick('services')} className="mobile-link">Services</Link>
          <Link to="/#work" onClick={() => handleNavClick('work')} className="mobile-link">Work</Link>
          <Link to="/#contact" onClick={() => handleNavClick('contact')} className="mobile-btn">Start Project</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
