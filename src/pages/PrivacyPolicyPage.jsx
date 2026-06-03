import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import './LegalPage.css';

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page">
      <div className="legal-container">
        
        <div className="legal-back-nav">
          <Link to="/" className="back-link glass-panel">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        <motion.div 
          className="legal-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: May 30, 2026</p>
        </motion.div>

        <motion.div 
          className="legal-content glass-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to Pinwheel Enterprise ("we," "our," or "us"). We respect your privacy and are committed to protecting any personal information you share with us through our website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <p>
              We collect information that you voluntarily provide to us when you express interest in obtaining information about our services, contact us through our inquiry forms, or subscribe to updates. This may include:
            </p>
            <ul>
              <li>Contact details (e.g., name, email address, phone number, company name)</li>
              <li>Details regarding your project requirements, event location, and scheduling</li>
              <li>Any other personal details you choose to share in open communication fields</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>
              We process your personal information to fulfill inquiries, deliver tailored exhibition solutions, and coordinate design logistics. Specifically, we use your information to:
            </p>
            <ul>
              <li>Respond to project inquiries, pricing quotes, and service requests</li>
              <li>Deliver layout renders, structural plans, and fabrication updates</li>
              <li>Improve site usability, features, and overall marketing efforts</li>
              <li>Comply with applicable legal duties and agreements</li>
            </ul>
          </section>

          <section>
            <h2>4. Information Sharing & Disclosure</h2>
            <p>
              We do not sell, trade, or rent your personal identification information to third parties. We may share information with trusted fabrication partners and site contractors solely as required to coordinate and execute your exhibition stall setups.
            </p>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>
              We implement a variety of standard administrative, technical, and physical security measures to safeguard the security of your personal data. However, please note that no internet transmission or storage solution is completely secure.
            </p>
          </section>

          <section>
            <h2>6. Your Rights</h2>
            <p>
              Depending on your location, you may have rights regarding access, deletion, and corrections of your personal records. If you wish to inspect or wipe any information collected by us, please contact us directly at hello@pinwheelent.in.
            </p>
          </section>
        </motion.div>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
