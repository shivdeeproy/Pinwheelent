import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Linkedin, Twitter } from 'lucide-react';
import logo from '../assets/logo.png';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer border-t border-glass-border">
      <div className="container">
        <div className="footer-grid">
          
          <div className="footer-brand">
            <img src={logo} alt="Pinwheel Enterprise" style={{ height: '40px', width: 'auto', marginBottom: '1.5rem' }} />
            <p className="footer-desc">
              Premium stall fabrication and expo design. We transform your brand vision into striking physical realities that command attention on the showroom floor.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon"><Instagram size={20} /></a>
              <a href="#" className="social-icon"><Linkedin size={20} /></a>
              <a href="#" className="social-icon"><Twitter size={20} /></a>
            </div>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/#about">About Us</Link></li>
              <li><Link to="/#services">Services</Link></li>
              <li><Link to="/#work">Our Work</Link></li>
              <li><Link to="/#contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>Contact Us</h3>
            <ul>
              <li>
                <Mail size={18} />
                <span>hello@pinwheelent.in</span>
              </li>
              <li>
                <Phone size={18} />
                <span>+91 98765 43210</span>
              </li>
              <li>
                <MapPin size={18} />
                <span>123 Exhibition Road, New Delhi, India</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Pinwheelent. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
