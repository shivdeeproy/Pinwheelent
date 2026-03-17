import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './WorkDetailPage.css';

const withTimeout = (promise, ms = 3000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), ms)
    )
  ]);

const WorkDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchProject = async () => {
      // Load from localStorage first (instant)
      const cached = localStorage.getItem('localWorks');
      const localWorks = cached ? JSON.parse(cached) : [];
      const localFound = localWorks.find(p => p.id === id);
      if (localFound) {
        setProject(localFound);
        setLoading(false);
      }

      // If online, try to get fresh data from Firestore
      if (navigator.onLine) {
        try {
          const querySnapshot = await withTimeout(getDocs(collection(db, 'works')));
          if (!querySnapshot.empty) {
            const works = querySnapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
            const found = works.find(p => p.id === id);
            if (found) setProject(found);
          }
        } catch (error) {
          console.warn('Firestore fetch failed, using cached data');
        }
      }

      setLoading(false);
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '120px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container" style={{ paddingTop: '120px', minHeight: '60vh' }}>
        <h2>Project not found.</h2>
        <Link to="/works" className="back-link">← Back to Works</Link>
      </div>
    );
  }

  return (
    <div className="work-detail-page">
      <div className="container">
        <Link to="/works" className="back-link">
          <ArrowLeft size={18} /> Back to Work
        </Link>
        
        <header className="work-detail-header">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="work-category">{project.category}</span>
            <h1 className="work-title">{project.title}</h1>
          </motion.div>
        </header>

        <motion.div 
          className="work-hero-image glass-panel"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="work-hero-placeholder" style={{ background: 'transparent' }}>
            {project.image && (
              <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        </motion.div>

        <div className="work-content-grid">
          <motion.div 
            className="work-main-content"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {project.challenge && (
              <section className="detail-section">
                <h2>The Challenge</h2>
                <p>{project.challenge}</p>
              </section>
            )}
            
            {project.solution && (
              <section className="detail-section">
                <h2>The Solution</h2>
                <p>{project.solution}</p>
              </section>
            )}

            {project.additionalImages && project.additionalImages.length > 0 && (
              <div className="work-gallery">
                {project.additionalImages.map((imgUrl, idx) => (
                  <div key={idx} className="gallery-placeholder glass-panel" style={{ background: 'transparent', padding: 0, overflow: 'hidden' }}>
                    <img src={imgUrl} alt={`${project.title} gallery ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.aside 
            className="work-sidebar"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {project.features && project.features.length > 0 && (
              <div className="sidebar-box glass-panel">
                <h3>Key Features</h3>
                <ul>
                  {project.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {project.stats && (
              <div className="sidebar-box glass-panel highlight-box">
                <h3>Impact & Stats</h3>
                <p>{project.stats}</p>
              </div>
            )}
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

export default WorkDetailPage;
