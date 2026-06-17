import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import './LegalPage.css';

const TermsOfServicePage = () => {
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
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: June 17, 2026</p>
        </motion.div>

        <motion.div 
          className="legal-content glass-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <section>
            <h2>1. Terms of Use</h2>
            <p>
              By accessing and using the Pinwheel Enterprise website (pinwheelent.in), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this site.
            </p>
          </section>

          <section>
            <h2>2. Intellectual Property</h2>
            <p>
              All website designs, text, graphics, layout models, 3D renderings, and structural fabrication concepts displayed on this website are the intellectual property of Pinwheel Enterprise. Unauthorized reproduction, distribution, or adaptation of our proprietary work is strictly prohibited.
            </p>
          </section>

          <section>
            <h2>3. Service Bookings & Execution</h2>
            <p>
              While we display past stall fabrications and capabilities on this platform, formal design agreements, quotes, project fees, timeline commitments, and event execution rules are governed exclusively by standalone offline client service contracts.
            </p>
          </section>

          <section>
            <h2>4. User Responsibilities</h2>
            <p>
              You agree to use this site only for lawful, legitimate research and booking purposes. You must not submit false information in contact forms, upload malicious payloads, or attempt to compromise the network integrity of our CMS panels.
            </p>
          </section>

          <section>
            <h2>5. Disclaimer of Warranties</h2>
            <p>
              This website and its content are provided on an "as is" and "as available" basis without warranties of any kind. We make no representations about the completeness, absolute accuracy, or reliability of visual renders compared to physical on-site environments.
            </p>
          </section>

          <section>
            <h2>6. Governing Law</h2>
            <p>
              These Terms of Service and any relationships governed by them shall be interpreted, construed, and enforced in accordance with the laws of India, under the jurisdiction of courts in Mumbai.
            </p>
          </section>
        </motion.div>

      </div>
    </div>
  );
};

export default TermsOfServicePage;
