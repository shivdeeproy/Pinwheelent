import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Trash2, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

/* ─── Offline-safe Firestore helper ─────────────────────────── */
const FIRESTORE_TIMEOUT_MS = 3000;
const withTimeout = (promise, ms = FIRESTORE_TIMEOUT_MS) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase timeout — using local storage')), ms)
    )
  ]);
const isFirebaseAvailable = () => navigator.onLine;

/* ─── Custom Confirm Modal ───────────────────────────────────── */
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div
    id="confirm-modal-overlay"
    style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, backdropFilter: 'blur(4px)'
    }}
  >
    <div
      id="confirm-modal-box"
      style={{
        background: 'var(--glass-bg, #1a1a2e)', border: '1px solid var(--border-color, #333)',
        borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '90%',
        textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}
    >
      <AlertTriangle size={36} style={{ color: '#f59e0b', marginBottom: '16px' }} />
      <p style={{ fontSize: '1rem', color: '#e2e8f0', marginBottom: '24px', lineHeight: 1.6 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          id="confirm-modal-cancel"
          onClick={onCancel}
          style={{
            padding: '10px 24px', borderRadius: '8px', border: '1px solid #555',
            background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: '0.9rem'
          }}
        >
          Cancel
        </button>
        <button
          id="confirm-modal-ok"
          onClick={onConfirm}
          style={{
            padding: '10px 24px', borderRadius: '8px', border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
            cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
          }}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

/* ─── Helpers ────────────────────────────────────────────────── */
const SAMPLE_WORKS = [
  {
    id: 'cyber-security-expo-2025',
    title: 'Cyber Security Expo 2025',
    category: 'Technology',
    challenge: 'The client needed a booth that looked futuristic and highly secure to reflect their cybersecurity brand.',
    solution: 'We built a 40x40 custom stall featuring LED neon accents, a glass-enclosed meeting room, and interactive touch screens.',
    stats: 'Attracted 5,000+ visitors. Won "Most Creative Stall".',
    features: ['Custom LED lighting', 'Glass meeting room', 'Interactive displays'],
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1170&q=80',
    additionalImages: ['https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1112&q=80']
  },
  {
    id: 'eco-living-summit-2024',
    title: 'Eco Living Summit 2024',
    category: 'Sustainability',
    challenge: 'Create a completely sustainable and recyclable exhibition stand for an eco-friendly brand.',
    solution: 'Utilized reclaimed wood, recycled cardboard tubes, and living moss walls to create an organic, earthy feel.',
    stats: 'Generated 200+ qualified leads. 100% recyclable materials.',
    features: ['Living moss wall', 'Reclaimed wood structure', 'Recyclable materials'],
    image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=687&q=80',
    additionalImages: []
  },
  {
    id: 'auto-expo-premium-booth',
    title: 'Auto Expo Premium Booth',
    category: 'Automotive',
    challenge: 'Showcase a new luxury electric vehicle with a high-end, minimalist aesthetic.',
    solution: 'Designed a sleek, dark-themed pavilion with overhead circular lighting trusses to highlight the vehicle curves.',
    stats: 'Featured in 5+ automotive magazines.',
    features: ['Overhead circular lighting', 'Minimalist design', 'Premium flooring'],
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1471&q=80',
    additionalImages: ['https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1425&q=80']
  }
];

/* ─── Main Component ─────────────────────────────────────────── */
const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [works, setWorks] = useState([]);
  const [isAddingProject, setIsAddingProject] = useState(false);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm }

  const [newProject, setNewProject] = useState({
    title: '', category: '', challenge: '', solution: '', stats: '', features: ['']
  });
  const [imageFile, setImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);

  const navigate = useNavigate();

  /* ── Auth ── */
  useEffect(() => {
    const localAdmin = localStorage.getItem('adminUser');
    if (localAdmin) {
      setUser(JSON.parse(localAdmin));
      setAuthLoading(false);
      fetchWorks();
      return;
    }

    const timeoutId = setTimeout(() => setAuthLoading(false), 5000);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      clearTimeout(timeoutId);
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) fetchWorks();
    });
    return () => { clearTimeout(timeoutId); unsubscribe(); };
  }, []);

  /* ── Fetch works (Firestore + localStorage fallback) ── */
  const fetchWorks = async () => {
    if (isFirebaseAvailable()) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'works')));
        if (!querySnapshot.empty) {
          const worksData = querySnapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
          setWorks(worksData);
          // Also sync to localStorage for offline use
          localStorage.setItem('localWorks', JSON.stringify(worksData));
          return;
        }
      } catch (_) { /* Firebase unavailable, fall through */ }
    }

    // Fallback: load from localStorage
    const cached = localStorage.getItem('localWorks');
    if (cached) setWorks(JSON.parse(cached));
  };

  /* ── Login ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    const envUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const envPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    
    if (username === envUser && password === envPass) {
      const adminUser = { uid: 'admin', username: envUser };
      setUser(adminUser);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      toast.success('Logged in successfully');
      fetchWorks();
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, username, password);
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error('Login failed: ' + error.message);
    }
  };

  /* ── Logout ── */
  const handleLogout = async () => {
    localStorage.removeItem('adminUser');
    await signOut(auth).catch(() => {});
    setUser(null);
    navigate('/');
  };

  /* ── Feature fields ── */
  const handleFeatureChange = (index, value) => {
    const updated = [...newProject.features];
    updated[index] = value;
    setNewProject({ ...newProject, features: updated });
  };
  const addFeatureField = () => setNewProject({ ...newProject, features: [...newProject.features, ''] });

  /* ── Seed dummy data ── */
  const runSeed = async () => {
    setConfirmModal(null);
    setActionLoading(true);
    try {
      let usedFirebase = false;

      if (isFirebaseAvailable()) {
        try {
          for (const proj of SAMPLE_WORKS) {
            await withTimeout(
              addDoc(collection(db, 'works'), { ...proj, createdAt: new Date().toISOString() })
            );
          }
          usedFirebase = true;
        } catch (_) {
          // Firebase timed out — fall through to localStorage
        }
      }

      if (!usedFirebase) {
        // Save to localStorage
        const existing = JSON.parse(localStorage.getItem('localWorks') || '[]');
        // Avoid duplicates by id
        const existingIds = new Set(existing.map(w => w.id));
        const toAdd = SAMPLE_WORKS
          .filter(p => !existingIds.has(p.id))
          .map(p => ({ ...p, docId: `local-${p.id}`, createdAt: new Date().toISOString() }));
        if (toAdd.length === 0) {
          toast.info('Dummy data already exists!');
          setActionLoading(false);
          return;
        }
        localStorage.setItem('localWorks', JSON.stringify([...existing, ...toAdd]));
        toast.success(`Seeded ${toAdd.length} projects locally!`);
      } else {
        toast.success('Seed data inserted to Firebase!');
      }

      fetchWorks();
    } catch (e) {
      console.error('Seed error:', e);
      toast.error('Seed failed: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Add project ── */
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.category) {
      toast.warning('Title and category are required!');
      return;
    }

    setActionLoading(true);
    try {
      const projectId = newProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const cleanFeatures = newProject.features.filter(f => f.trim() !== '');

      let imageUrl = '';
      const additionalImageUrls = [];

      if (imageFile) {
        try {
          const imageRef = ref(storage, `works/${Date.now()}_hero_${imageFile.name}`);
          await uploadBytes(imageRef, imageFile);
          imageUrl = await getDownloadURL(imageRef);
          for (let i = 0; i < additionalImageFiles.length; i++) {
            const file = additionalImageFiles[i];
            const fileRef = ref(storage, `works/additional/${Date.now()}_${i}_${file.name}`);
            await uploadBytes(fileRef, file);
            additionalImageUrls.push(await getDownloadURL(fileRef));
          }
        } catch (_) {
          imageUrl = URL.createObjectURL(imageFile);
        }
      }

      const projectData = {
        id: projectId,
        title: newProject.title,
        category: newProject.category,
        challenge: newProject.challenge,
        solution: newProject.solution,
        stats: newProject.stats,
        features: cleanFeatures,
        image: imageUrl,
        additionalImages: additionalImageUrls,
        createdAt: new Date().toISOString()
      };

      let savedToFirebase = false;
      if (isFirebaseAvailable()) {
        try {
          await withTimeout(addDoc(collection(db, 'works'), projectData));
          savedToFirebase = true;
        } catch (_) {
          // Firebase timed out — fall through
        }
      }

      if (!savedToFirebase) {
        const existing = JSON.parse(localStorage.getItem('localWorks') || '[]');
        existing.push({ ...projectData, docId: `local-${projectId}` });
        localStorage.setItem('localWorks', JSON.stringify(existing));
      }

      toast.success('Project added successfully!');
      setIsAddingProject(false);
      setNewProject({ title: '', category: '', challenge: '', solution: '', stats: '', features: [''] });
      setImageFile(null);
      setAdditionalImageFiles([]);
      fetchWorks();
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error('Failed to add project');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = (docId) => {
    setConfirmModal({
      message: 'Are you sure you want to delete this project?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          if (docId.startsWith('local-')) {
            const existing = JSON.parse(localStorage.getItem('localWorks') || '[]');
            localStorage.setItem('localWorks', JSON.stringify(existing.filter(w => w.docId !== docId)));
            toast.success('Project deleted');
            fetchWorks();
          } else {
            await deleteDoc(doc(db, 'works', docId));
            toast.success('Project deleted');
            fetchWorks();
          }
        } catch (error) {
          toast.error('Error deleting project');
        }
      }
    });
  };

  /* ── Render guards ── */
  if (authLoading) return <div className="admin-loading">Loading...</div>;

  if (!user) {
    return (
      <div className="admin-login-container">
        <form onSubmit={handleLogin} className="admin-login-form glass-panel">
          <h2>Admin Access</h2>
          <div className="form-group">
            <label>Username or Email</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary">Login</button>
        </form>
      </div>
    );
  }

  /* ── Dashboard ── */
  return (
    <div className="admin-dashboard">
      {/* Custom Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      <header className="admin-header glass-panel">
        <div className="container">
          <h2>Pinwheelent CMS</h2>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="container admin-main">
        <div className="admin-actions">
          <h3>Manage Portfolio</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn-primary"
              onClick={() => setIsAddingProject(!isAddingProject)}
            >
              {isAddingProject ? 'Cancel' : <><Plus size={18} /> Add New Project</>}
            </button>
            <button
              id="seed-dummy-data-btn"
              className="btn-secondary"
              disabled={actionLoading}
              onClick={() => setConfirmModal({
                message: 'Add 3 example demo projects to the portfolio?',
                onConfirm: runSeed
              })}
            >
              {actionLoading ? 'Seeding...' : 'Seed Dummy Data'}
            </button>
          </div>
        </div>

        {isAddingProject && (
          <form className="admin-add-form glass-panel" onSubmit={handleAddProject}>
            <h4>Create New Project</h4>
            <div className="form-row">
              <div className="form-group half">
                <label>Project Title *</label>
                <input type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="e.g. Neo Tech Expo 2024" required />
              </div>
              <div className="form-group half">
                <label>Category *</label>
                <input type="text" value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})} placeholder="e.g. Technology & SaaS" required />
              </div>
            </div>

            <div className="form-group">
              <label>Hero Image</label>
              <div className="file-upload-wrapper">
                <ImageIcon size={20} />
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
              </div>
            </div>

            <div className="form-group">
              <label>Additional Gallery Images (Optional)</label>
              <div className="file-upload-wrapper">
                <ImageIcon size={20} />
                <input type="file" accept="image/*" multiple onChange={e => setAdditionalImageFiles(Array.from(e.target.files))} />
              </div>
              {additionalImageFiles.length > 0 && <small>{additionalImageFiles.length} file(s) selected</small>}
            </div>

            <div className="form-group">
              <label>The Challenge</label>
              <textarea value={newProject.challenge} onChange={e => setNewProject({...newProject, challenge: e.target.value})} rows="3"></textarea>
            </div>

            <div className="form-group">
              <label>The Solution</label>
              <textarea value={newProject.solution} onChange={e => setNewProject({...newProject, solution: e.target.value})} rows="4"></textarea>
            </div>

            <div className="form-group">
              <label>Key Features (Bullet Points)</label>
              {newProject.features.map((feature, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={feature}
                  onChange={e => handleFeatureChange(idx, e.target.value)}
                  placeholder={`Feature ${idx + 1}`}
                  className="feature-input"
                />
              ))}
              <button type="button" className="btn-text" onClick={addFeatureField}>+ Add another feature</button>
            </div>

            <div className="form-group">
              <label>Impact & Stats</label>
              <input type="text" value={newProject.stats} onChange={e => setNewProject({...newProject, stats: e.target.value})} placeholder="e.g. Won 'Best Large Stand Design' award" />
            </div>

            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Uploading...' : 'Publish Project'}
            </button>
          </form>
        )}

        <div className="admin-project-list">
          {works.length === 0 ? (
            <p>No projects uploaded yet.</p>
          ) : (
            works.map(work => (
              <div key={work.docId} className="admin-project-card glass-panel">
                <div className="admin-project-info">
                  {work.image && <img src={work.image} alt={work.title} className="admin-thumb" />}
                  <div>
                    <h4>{work.title}</h4>
                    <span className="admin-category">{work.category}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(work.docId)} className="btn-delete" title="Delete Project">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
