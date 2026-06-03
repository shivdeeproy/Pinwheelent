import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import WorkListPage from './pages/WorkListPage';
import WorkDetailPage from './pages/WorkDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import FounderDetailPage from './pages/FounderDetailPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <Router>
      <div className="app-wrapper">
        <motion.div className="scroll-progress-bar" style={{ scaleX }} />
        <ToastContainer theme="dark" position="bottom-right" />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/works" element={<WorkListPage />} />
            <Route path="/work/:id" element={<WorkDetailPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/founder" element={<FounderDetailPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
