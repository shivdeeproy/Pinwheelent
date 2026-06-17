import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Testimonials.css';

const withTimeout = (promise, ms = 3000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), ms)
    )
  ]);

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchReviews = async () => {
      // Try local storage first
      const cached = localStorage.getItem('localReviews');
      if (cached) {
        setReviews(JSON.parse(cached));
        setLoading(false);
      }

      if (navigator.onLine) {
        try {
          const querySnapshot = await withTimeout(getDocs(collection(db, 'reviews')));
          const reviewsData = querySnapshot.docs.map(doc => ({
            docId: doc.id,
            ...doc.data()
          }));
          
          if (reviewsData.length > 0) {
            setReviews(reviewsData);
            localStorage.setItem('localReviews', JSON.stringify(reviewsData));
          }
        } catch (error) {
          console.warn('Reviews database fetch failed/timed out, using cached or default reviews', error);
        }
      }
      setLoading(false);
    };

    fetchReviews();
  }, []);

  // Default reviews if none are found in database
  const defaultReviews = [
    {
      docId: 'def-r1',
      type: 'written',
      authorName: 'Abhishek Sharma',
      company: 'Taskar Group',
      rating: 5,
      text: 'Pinwheelent did an exceptional job with our Stall construction. The attention to detail and professional execution exceeded our expectations.'
    },
    {
      docId: 'def-r2',
      type: 'link',
      authorName: 'Rohan Mehta',
      company: 'Deccan Chemicals',
      rating: 5,
      text: 'Outstanding design and stellar project management. Highly recommend their exhibition fabrication services!',
      url: 'https://g.page/r/example-google-review-link'
    },
    {
      docId: 'def-r3',
      type: 'written',
      authorName: 'Priya Nair',
      company: 'Pillai Tech',
      rating: 5,
      text: 'Their glassmorphic stall layout was the talk of the entire expo. Foot traffic was up by 40% compared to last year.'
    }
  ];

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;
  const isCarousel = displayReviews.length > 3;

  // Auto carousel effect
  useEffect(() => {
    if (!isCarousel || isHovered) return;

    const interval = setInterval(() => {
      scroll('right');
    }, 4000); // Auto scroll every 4 seconds

    return () => clearInterval(interval);
  }, [isCarousel, isHovered]);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      const card = container.querySelector('.testimonial-card');
      if (card) {
        const cardWidth = card.offsetWidth;
        const gap = parseFloat(window.getComputedStyle(container).gap) || 0;
        
        if (direction === 'right') {
          // Wrap to start if at the end
          const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
          if (isAtEnd) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            container.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
          }
        } else {
          // Wrap to end if at start
          const isAtStart = container.scrollLeft <= 10;
          if (isAtStart) {
            container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
          } else {
            container.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
          }
        }
      }
    }
  };

  const renderStars = (rating) => {
    const starsCount = Number(rating) || 5;
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < starsCount ? 'var(--accent)' : 'transparent'}
        color={i < starsCount ? 'var(--accent)' : 'rgba(255,255,255,0.2)'}
        style={{ marginRight: '4px' }}
      />
    ));
  };

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="container">
        <div className="testimonials-header text-center" style={{ position: 'relative' }}>
          <motion.span 
            className="section-tag"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Client Reviews
          </motion.span>
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            What Our Clients Say
          </motion.h2>
          <motion.p 
            className="section-subtitle"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Real feedback from businesses we have partnered with to build remarkable environments
          </motion.p>
        </div>

        <div 
          className="carousel-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isCarousel && (
            <button onClick={() => scroll('left')} className="carousel-btn prev-btn" aria-label="Previous Reviews">
              <ChevronLeft size={22} />
            </button>
          )}

          <div 
            ref={scrollRef} 
            className={`testimonials-grid ${isCarousel ? 'has-carousel' : ''}`}
          >
          {displayReviews.map((review, index) => (
            <motion.div
              key={review.docId || index}
              className={`testimonial-card glass-panel ${review.type === 'link' ? 'link-review' : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
            >
              <div className="card-top">
                <div className="rating-container">
                  {renderStars(review.rating)}
                </div>
                {review.type === 'link' ? (
                  <span className="google-badge">
                    <svg className="google-icon" viewBox="0 0 24 24" width="16" height="16">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Google Review
                  </span>
                ) : (
                  <MessageSquare size={16} className="text-quote-icon" />
                )}
              </div>

              <p className="testimonial-text">"{review.text}"</p>

              <div className="testimonial-author">
                <div className="author-info">
                  <h4 className="author-name">{review.authorName}</h4>
                  {review.company && <span className="author-company">{review.company}</span>}
                </div>
                {review.type === 'link' && review.url && (
                  <a
                    href={review.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="review-link-btn"
                  >
                    View Review <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
          </div>

          {isCarousel && (
            <button onClick={() => scroll('right')} className="carousel-btn next-btn" aria-label="Next Reviews">
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        <motion.div 
          className="google-reviews-cta text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p>Have you collaborated with Pinwheelent on a stall design or exhibition?</p>
          <a
            href="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID_HERE"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-google-btn"
          >
            <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '8px' }}>
              <path
                fill="#ffffff"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#ffffff"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#ffffff"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#ffffff"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Write a Google Review
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
