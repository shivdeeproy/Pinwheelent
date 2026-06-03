import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import './WorkListPage.css';

const withTimeout = (promise, ms = 3000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), ms)
    )
  ]);

const WorkListPage = () => {
  const [portfolioData, setPortfolioData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPortfolio = async () => {
      // Try localStorage first for instant load
      const cached = localStorage.getItem('localWorks');
      if (cached) {
        setPortfolioData(JSON.parse(cached));
        setLoading(false);
      }

      // If online, try to refresh from Firestore
      if (navigator.onLine) {
        try {
          const querySnapshot = await withTimeout(getDocs(collection(db, 'works')));
          if (!querySnapshot.empty) {
            const works = querySnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
            setPortfolioData(works);
            localStorage.setItem('localWorks', JSON.stringify(works));
          }
        } catch (error) {
          // Firestore unavailable — already showing cached data
          console.warn('Firestore fetch failed, using cached data');
        }
      }

      setLoading(false);
    };
    fetchPortfolio();
  }, []);

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
    <div className="work-list-page">
      <div className="container work-list-container">
        
        <div className="work-list-top-group">
          {/* Navigation header */}
          <div className="work-back-nav">
            <Link to="/" className="back-link glass-panel">
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>

          <motion.div 
            className="work-list-header"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="page-title">All Works</h1>
            <p className="page-subtitle">A comprehensive showcase of our stall and exhibition masterclasses.</p>
          </motion.div>
        </div>

        <div className="work-grid">
          {portfolioData.map((project, index) => (
            <motion.div 
              key={project.id}
              className="work-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (index % 3 || 0) * 0.15 }}
            >
              <Link to={`/work/${project.id}`}>
                <div className="work-image-wrapper">
                  <div className="work-image-placeholder" style={{ background: 'transparent' }}>
                    {project.image && (
                      <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

export default WorkListPage;
