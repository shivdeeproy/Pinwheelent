import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    event: '',
    message: ''
  });
  
  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: null });

    try {
      // Using Web3Forms for email routing without a backend.
      // Make sure to replace YOUR_ACCESS_KEY_HERE with an access key from https://web3forms.com
      // sent to hello@pinwheelent.in
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE",
          subject: `New Contact Form Submission from ${formData.name}`,
          from_name: "Pinwheelent Website",
          ...formData
        })
      });

      const result = await response.json();
      if (result.success) {
        setStatus({ submitting: false, success: true, error: null });
        // Clear the form
        setFormData({
          name: '',
          company: '',
          email: '',
          phone: '',
          event: '',
          message: ''
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setStatus(prev => ({ ...prev, success: false }));
        }, 5000);
      } else {
        setStatus({ submitting: false, success: false, error: result.message || "Something went wrong." });
      }
    } catch (error) {
      setStatus({ submitting: false, success: false, error: "Failed to send message. Please try again later." });
    }
  };
  return (
    <section id="contact" className="contact-section">
      <div className="container contact-container">
        
        <motion.div 
          className="contact-info"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title">Let's Build <br/>Something <span className="text-gradient">Extraordinary.</span></h2>
          <p className="contact-desc">
            Ready to make a lasting impression at your next expo? Drop us a line, and our design team will get back to you within 24 hours to discuss your vision.
          </p>
          
          <div className="contact-details">
            <div className="detail-item">
              <span>Email</span>
              <a href="mailto:hello@pinwheelent.in">hello@pinwheelent.in</a>
            </div>
            <div className="detail-item">
              <span>Phone</span>
              <a href="tel:+919876543210">+91 98765 43210</a>
            </div>
            <div className="detail-item">
              <span>Studio</span>
              <p>123 Exhibition Road, Industrial Area Phase 1,<br/>New Delhi, India 110020</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="contact-form-wrapper glass-panel"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group row">
              <div className="input-field">
                <label htmlFor="name">Full Name *</label>
                <input type="text" id="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
              </div>
              <div className="input-field">
                <label htmlFor="company">Company</label>
                <input type="text" id="company" value={formData.company} onChange={handleChange} placeholder="Example Corp" />
              </div>
            </div>
            
            <div className="form-group row">
              <div className="input-field">
                <label htmlFor="email">Email Address *</label>
                <input type="email" id="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
              </div>
              <div className="input-field">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXX XXXXX" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="event">Event/Expo Name (Optional)</label>
              <input type="text" id="event" value={formData.event} onChange={handleChange} placeholder="e.g. Auto Expo 2025" />
            </div>

            <div className="form-group">
              <label htmlFor="message">Project Details *</label>
              <textarea id="message" value={formData.message} onChange={handleChange} rows="4" placeholder="Tell us about your requirements, stall size, and objectives..." required></textarea>
            </div>

            {status.success && (
              <div className="form-success-message" style={{ color: '#10b981', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={18} /> Message sent successfully! We will get back to you soon.
              </div>
            )}
            
            {status.error && (
              <div className="form-error-message" style={{ color: '#ef4444', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} /> {status.error}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={status.submitting}>
              {status.submitting ? 'Sending...' : <>Send Message <Send size={18} /></>}
            </button>
          </form>
        </motion.div>

      </div>
    </section>
  );
};

export default Contact;
