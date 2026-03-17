import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './WorkPreview.css';

const withTimeout = (promise, ms = 3000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), ms)
    )
  ]);

const WorkPreview = () => {
  const [featuredWork, setFeaturedWork] = useState([]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      // Load from localStorage immediately (last 3, most recently added first)
      const cached = localStorage.getItem('localWorks');
      if (cached) {
        const works = JSON.parse(cached);
        setFeaturedWork(works.slice(-3).reverse());
      }

      // If online, try refreshing from Firestore in the background
      if (navigator.onLine) {
        try {
          const querySnapshot = await withTimeout(getDocs(collection(db, 'works')));
          if (!querySnapshot.empty) {
            const works = querySnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
            localStorage.setItem('localWorks', JSON.stringify(works));
            setFeaturedWork(works.slice(-3).reverse());
          }
        } catch (error) {
          console.warn('Firestore unavailable, using cached works for preview');
        }
      }
    };
    fetchPortfolio();
  }, []);

  return (
    <section id="work" className="work-section">
      <div className="container">
        
        <div className="work-header">
          <div>
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              Selected Works
            </motion.h2>
            <motion.p 
              className="section-subtitle"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              A glimpse into our recent fabrication masterclasses.
            </motion.p>
          </div>
          <Link to="/works" className="view-all-link">
            View All Projects <ArrowRight size={18} />
          </Link>
        </div>

        <div className="work-grid">
          {featuredWork.map((project, index) => (
            <motion.div 
              key={project.id}
              className="work-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Link to={`/work/${project.id}`}>
                <div className="work-image-wrapper">
                  <div className="work-image-placeholder">
                    {project.image ? (
                      <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e1e1e, #111)' }}></div>
                    )}
                  </div>
                  <div className="work-overlay glass-panel">
                    <span>View Project</span>
                  </div>
                </div>
                <div className="work-info">
                  <span className="work-category">{project.category}</span>
                  <h3 className="work-title">{project.title}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WorkPreview;
