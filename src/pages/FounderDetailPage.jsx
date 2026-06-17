import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Calendar, MapPin, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import founderImg from '../assets/founder.png';
import './FounderDetailPage.css';

const FounderDetailPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Page entry animations
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  return (
    <motion.div 
      className="founder-page-wrapper"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <div className="container founder-page-container">
        {/* Navigation header */}
        <div className="founder-back-nav">
          <Link to="/" className="back-link glass-panel">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        {/* Profile and Quick Info section */}
        <div className="founder-profile-grid">
          <div className="founder-photo-section">
            <div className="founder-image-wrapper glass-panel">
              <img src={founderImg} alt="Abhishek Kharat" className="founder-img-file" />
            </div>
            <div className="founder-meta-cards">
              <div className="meta-card glass-panel">
                <MapPin size={20} className="meta-icon" />
                <div>
                  <h5>Location</h5>
                  <p>Mumbai, India</p>
                </div>
              </div>
              <div className="meta-card glass-panel">
                <Award size={20} className="meta-icon" />
                <div>
                  <h5>Experience</h5>
                  <p>12+ Years in Space Design</p>
                </div>
              </div>
            </div>
          </div>

          <div className="founder-info-section">
            <span className="founder-section-tag">About the Founder</span>
            <h1 className="founder-display-name">Abhishek Kharat</h1>
            <p className="founder-display-title">Founder & Lead Spatial Architect</p>
            
            <div className="founder-vision-box glass-panel">
              <p className="founder-vision-text">
                "An exhibition stall isn't just wood and paint. It's a three-dimensional touchpoint of a brand's promise. When attendees step inside, they should immediately feel the heartbeat of your business."
              </p>
            </div>

            <div className="founder-detailed-bio">
              <h3>The Journey & Philosophy</h3>
              <p>
                Abhishek Kharat is a seasoned space curator who bridges the gap between artistic installations and strategic marketing. With over a decade of hands-on expertise in architectural design, material science, and expo fabrication, he oversees every design layout created at Pinwheelent.
              </p>
              <p>
                His philosophy is rooted in structural minimalism and interactive experience design. By utilizing smart lighting, high-quality sustainable materials, and precise ergonomics, he aims to elevate every client's spatial layout into an active engagement zone.
              </p>
            </div>

            <div className="founder-cta-box glass-panel">
              <div className="founder-cta-text">
                <h4>Let's curate your next booth</h4>
                <p>Schedule a personal design consultation with Abhishek Kharat.</p>
              </div>
              <div className="founder-cta-actions">
                <a href="mailto:contact@pinwheelent.in" className="cta-email-btn">
                  <Mail size={18} /> Email Abhishek
                </a>
                <a href="/#contact" className="cta-schedule-btn">
                  <Calendar size={18} /> Book a Consult
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FounderDetailPage;
