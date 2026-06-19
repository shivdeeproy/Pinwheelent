import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Trash2, Edit2, Image as ImageIcon, AlertTriangle } from 'lucide-react';
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

/* ─── Local Server File Upload Helper ───────────────────────── */
const uploadFile = async (file) => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return URL.createObjectURL(file);
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/upload.php', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Upload failed on server');
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Server upload failed');
  }
  return result.url;
};

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

/* ─── Main Component ─────────────────────────────────────────── */
const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [works, setWorks] = useState([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectDocId, setEditingProjectDocId] = useState(null);

  const [clients, setClients] = useState([]);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClientDocId, setEditingClientDocId] = useState(null);
  const [newClient, setNewClient] = useState({ name: '' });
  const [clientLogoFile, setClientLogoFile] = useState(null);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [editingReviewDocId, setEditingReviewDocId] = useState(null);
  const [newReview, setNewReview] = useState({
    type: 'written', authorName: '', company: '', rating: 5, text: '', url: ''
  });

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm }

  const [newProject, setNewProject] = useState({
    title: '', category: '', challenge: '', solution: '', stats: '', features: [''],
    stallDesign: '', dateLocation: '', description: '', showOnHomepage: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);

  // Visibility settings states
  const [visibilitySettings, setVisibilitySettings] = useState({
    showWork: true,
    showBrands: true,
    showReviews: true
  });

  const navigate = useNavigate();

  const startEdit = (project) => {
    setEditingProjectDocId(project.docId);
    setNewProject({
      id: project.id || '',
      title: project.title || '',
      category: project.category || '',
      challenge: project.challenge || '',
      solution: project.solution || '',
      stats: project.stats || '',
      features: project.features && project.features.length > 0 ? project.features : [''],
      image: project.image || '',
      additionalImages: project.additionalImages || [],
      stallDesign: project.stallDesign || '',
      dateLocation: project.dateLocation || '',
      description: project.description || '',
      showOnHomepage: project.showOnHomepage !== false
    });
    setImageFile(null);
    setAdditionalImageFiles([]);
    setIsAddingProject(true);
  };

  const toggleAddForm = () => {
    if (isAddingProject) {
      setIsAddingProject(false);
      setEditingProjectDocId(null);
      setNewProject({ title: '', category: '', challenge: '', solution: '', stats: '', features: [''], stallDesign: '', dateLocation: '', description: '', showOnHomepage: true });
      setImageFile(null);
      setAdditionalImageFiles([]);
    } else {
      setIsAddingProject(true);
    }
  };

  const startEditClient = (client) => {
    setEditingClientDocId(client.docId);
    setNewClient({ name: client.name || '' });
    setClientLogoFile(null);
    setIsAddingClient(true);
  };

  const toggleAddClientForm = () => {
    if (isAddingClient) {
      setIsAddingClient(false);
      setEditingClientDocId(null);
      setNewClient({ name: '' });
      setClientLogoFile(null);
    } else {
      setIsAddingClient(true);
    }
  };

  /* ── Auth ── */
  useEffect(() => {
    const timeoutId = setTimeout(() => setAuthLoading(false), 5000);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      clearTimeout(timeoutId);
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        fetchWorks();
        fetchClients();
        fetchReviews();
        fetchVisibilitySettings();
      }
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
          localStorage.setItem('localWorks', JSON.stringify(worksData));
          return;
        }
      } catch (_) { /* Firebase unavailable */ }
    }

    const cached = localStorage.getItem('localWorks');
    if (cached) setWorks(JSON.parse(cached));
  };

  /* ── Fetch clients (Firestore + localStorage fallback) ── */
  const fetchClients = async () => {
    if (isFirebaseAvailable()) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'clients')));
        if (!querySnapshot.empty) {
          const clientsData = querySnapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
          setClients(clientsData);
          localStorage.setItem('localClients', JSON.stringify(clientsData));
          return;
        }
      } catch (_) { /* Firebase unavailable */ }
    }

    const cached = localStorage.getItem('localClients');
    if (cached) setClients(JSON.parse(cached));
  };

  /* ── Add or Update client logo ── */
  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!newClient.name || (!clientLogoFile && !editingClientDocId)) {
      toast.warning('Client name and logo are required!');
      return;
    }

    setActionLoading(true);
    try {
      const clientId = newClient.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      let logoUrl = '';

      if (editingClientDocId) {
        const match = clients.find(c => c.docId === editingClientDocId);
        logoUrl = match ? match.logo : '';
      }

      if (clientLogoFile) {
        try {
          logoUrl = await uploadFile(clientLogoFile);
        } catch (err) {
          console.error('Client logo upload error:', err);
          logoUrl = URL.createObjectURL(clientLogoFile);
        }
      }

      const clientData = {
        id: clientId,
        name: newClient.name,
        logo: logoUrl,
        updatedAt: new Date().toISOString()
      };

      if (editingClientDocId) {
        // UPDATE
        let savedToFirebase = false;
        if (isFirebaseAvailable() && !editingClientDocId.startsWith('local-')) {
          try {
            await withTimeout(updateDoc(doc(db, 'clients', editingClientDocId), clientData));
            savedToFirebase = true;
          } catch (_) { }
        }

        if (!savedToFirebase) {
          const existing = JSON.parse(localStorage.getItem('localClients') || '[]');
          const updated = existing.map(c => c.docId === editingClientDocId ? { ...c, ...clientData } : c);
          localStorage.setItem('localClients', JSON.stringify(updated));
        }
        toast.success('Client logo updated successfully!');
      } else {
        // CREATE
        const newClientData = { ...clientData, createdAt: new Date().toISOString() };
        let savedToFirebase = false;
        if (isFirebaseAvailable()) {
          try {
            await withTimeout(addDoc(collection(db, 'clients'), newClientData));
            savedToFirebase = true;
          } catch (_) { }
        }

        if (!savedToFirebase) {
          const existing = JSON.parse(localStorage.getItem('localClients') || '[]');
          existing.push({ ...newClientData, docId: `local-${clientId}` });
          localStorage.setItem('localClients', JSON.stringify(existing));
        }
        toast.success('Client logo added successfully!');
      }

      setIsAddingClient(false);
      setEditingClientDocId(null);
      setNewClient({ name: '' });
      setClientLogoFile(null);
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Failed to save client logo');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Delete client logo ── */
  const handleDeleteClient = (docId) => {
    setConfirmModal({
      message: 'Are you sure you want to delete this client logo?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          if (docId.startsWith('local-')) {
            const existing = JSON.parse(localStorage.getItem('localClients') || '[]');
            localStorage.setItem('localClients', JSON.stringify(existing.filter(c => c.docId !== docId)));
          } else {
            await deleteDoc(doc(db, 'clients', docId));
          }
          toast.success('Client logo deleted');
          fetchClients();
        } catch (error) {
          toast.error('Error deleting client logo');
        }
      }
    });
  };

  /* ── Fetch reviews (Firestore + localStorage fallback) ── */
  const fetchReviews = async () => {
    if (isFirebaseAvailable()) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'reviews')));
        const reviewsData = querySnapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
        setReviews(reviewsData);
        localStorage.setItem('localReviews', JSON.stringify(reviewsData));
        return;
      } catch (_) { /* Firebase unavailable */ }
    }

    const cached = localStorage.getItem('localReviews');
    if (cached) setReviews(JSON.parse(cached));
  };

  const startEditReview = (review) => {
    setEditingReviewDocId(review.docId);
    setNewReview({
      type: review.type || 'written',
      authorName: review.authorName || '',
      company: review.company || '',
      rating: review.rating || 5,
      text: review.text || '',
      url: review.url || ''
    });
    setIsAddingReview(true);
  };

  const toggleAddReviewForm = () => {
    if (isAddingReview) {
      setIsAddingReview(false);
      setEditingReviewDocId(null);
      setNewReview({ type: 'written', authorName: '', company: '', rating: 5, text: '', url: '' });
    } else {
      setIsAddingReview(true);
    }
  };

  /* ── Add or Update review ── */
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.authorName || !newReview.text) {
      toast.warning('Author name and review text are required!');
      return;
    }
    if (newReview.type === 'link' && !newReview.url) {
      toast.warning('Review URL is required for link reviews!');
      return;
    }

    setActionLoading(true);
    try {
      const reviewId = editingReviewDocId || `review-${Date.now()}`;
      const reviewData = {
        type: newReview.type,
        authorName: newReview.authorName,
        company: newReview.company,
        rating: Number(newReview.rating) || 5,
        text: newReview.text,
        url: newReview.type === 'link' ? newReview.url : '',
        updatedAt: new Date().toISOString()
      };

      if (editingReviewDocId) {
        // UPDATE
        let savedToFirebase = false;
        if (isFirebaseAvailable() && !editingReviewDocId.startsWith('local-')) {
          try {
            await withTimeout(updateDoc(doc(db, 'reviews', editingReviewDocId), reviewData));
            savedToFirebase = true;
          } catch (_) { }
        }

        if (!savedToFirebase) {
          const existing = JSON.parse(localStorage.getItem('localReviews') || '[]');
          const updated = existing.map(r => r.docId === editingReviewDocId ? { ...r, ...reviewData } : r);
          localStorage.setItem('localReviews', JSON.stringify(updated));
        }
        toast.success('Review updated successfully!');
      } else {
        // CREATE
        const newReviewData = { ...reviewData, createdAt: new Date().toISOString() };
        let savedToFirebase = false;
        if (isFirebaseAvailable()) {
          try {
            await withTimeout(addDoc(collection(db, 'reviews'), newReviewData));
            savedToFirebase = true;
          } catch (_) { }
        }

        if (!savedToFirebase) {
          const existing = JSON.parse(localStorage.getItem('localReviews') || '[]');
          existing.push({ ...newReviewData, docId: `local-${reviewId}` });
          localStorage.setItem('localReviews', JSON.stringify(existing));
        }
        toast.success('Review added successfully!');
      }

      setIsAddingReview(false);
      setEditingReviewDocId(null);
      setNewReview({ type: 'written', authorName: '', company: '', rating: 5, text: '', url: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error saving review:', error);
      toast.error('Failed to save review');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Delete review ── */
  const handleDeleteReview = (docId) => {
    setConfirmModal({
      message: 'Are you sure you want to delete this review?',
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          if (docId.startsWith('local-')) {
            const existing = JSON.parse(localStorage.getItem('localReviews') || '[]');
            localStorage.setItem('localReviews', JSON.stringify(existing.filter(r => r.docId !== docId)));
          } else {
            await deleteDoc(doc(db, 'reviews', docId));
          }
          toast.success('Review deleted');
          fetchReviews();
        } catch (error) {
          toast.error('Error deleting review');
        }
      }
    });
  };

  /* ── Fetch visibility settings (Firestore + localStorage fallback) ── */
  const fetchVisibilitySettings = async () => {
    if (isFirebaseAvailable()) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'settings')));
        if (!querySnapshot.empty) {
          const docMatch = querySnapshot.docs.find(d => d.id === 'sectionVisibility');
          if (docMatch) {
            const data = docMatch.data();
            const loadedSettings = {
              showWork: data.showWork !== false,
              showBrands: data.showBrands !== false,
              showReviews: data.showReviews !== false
            };
            setVisibilitySettings(loadedSettings);
            localStorage.setItem('localSettings', JSON.stringify(loadedSettings));
            return;
          }
        }
      } catch (_) { /* Firebase unavailable */ }
    }

    const cached = localStorage.getItem('localSettings');
    if (cached) setVisibilitySettings(JSON.parse(cached));
  };

  /* ── Save visibility settings ── */
  const handleSaveVisibilitySettings = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let savedToFirebase = false;
      if (isFirebaseAvailable()) {
        try {
          await withTimeout(setDoc(doc(db, 'settings', 'sectionVisibility'), visibilitySettings));
          savedToFirebase = true;
        } catch (err) {
          console.error('Firebase save settings error:', err);
        }
      }

      localStorage.setItem('localSettings', JSON.stringify(visibilitySettings));
      
      // Notify other components instantly of configuration change
      window.dispatchEvent(new Event('visibilitySettingsChanged'));
      
      toast.success('Section visibility settings updated successfully!');
    } catch (error) {
      console.error('Error saving visibility settings:', error);
      toast.error('Failed to save visibility settings');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Login ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, username, password);
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error('Login failed: ' + error.message);
    }
  };

  /* ── Logout ── */
  const handleLogout = async () => {
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

  /* ── Add or Update project ── */
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.category) {
      toast.warning('Title and category are required!');
      return;
    }

    setActionLoading(true);
    try {
      const projectId = newProject.id || newProject.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const cleanFeatures = newProject.features.filter(f => f.trim() !== '');

      let imageUrl = newProject.image || '';
      const additionalImageUrls = [...(newProject.additionalImages || [])];

      if (imageFile) {
        try {
          imageUrl = await uploadFile(imageFile);
        } catch (err) {
          console.error('Hero image upload error:', err);
          imageUrl = URL.createObjectURL(imageFile);
        }
      }

      if (additionalImageFiles.length > 0) {
        for (let i = 0; i < additionalImageFiles.length; i++) {
          try {
            const url = await uploadFile(additionalImageFiles[i]);
            additionalImageUrls.push(url);
          } catch (err) {
            console.error('Additional image upload error:', err);
            additionalImageUrls.push(URL.createObjectURL(additionalImageFiles[i]));
          }
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
        stallDesign: newProject.stallDesign || '',
        dateLocation: newProject.dateLocation || '',
        description: newProject.description || '',
        showOnHomepage: newProject.showOnHomepage !== false,
        updatedAt: new Date().toISOString()
      };

      if (editingProjectDocId) {
        let savedToFirebase = false;
        if (isFirebaseAvailable() && !editingProjectDocId.startsWith('local-')) {
          try {
            await withTimeout(updateDoc(doc(db, 'works', editingProjectDocId), projectData));
            savedToFirebase = true;
          } catch (_) { }
        }

        if (!savedToFirebase) {
          const existing = JSON.parse(localStorage.getItem('localWorks') || '[]');
          const updated = existing.map(w => w.docId === editingProjectDocId ? { ...w, ...projectData } : w);
          localStorage.setItem('localWorks', JSON.stringify(updated));
        }
        toast.success('Project updated successfully!');
      } else {
        const newProjectData = { ...projectData, createdAt: new Date().toISOString() };
        let savedToFirebase = false;
        if (isFirebaseAvailable()) {
          try {
            await withTimeout(addDoc(collection(db, 'works'), newProjectData));
            savedToFirebase = true;
          } catch (_) { }
        }

        if (!savedToFirebase) {
          const existing = JSON.parse(localStorage.getItem('localWorks') || '[]');
          existing.push({ ...newProjectData, docId: `local-${projectId}` });
          localStorage.setItem('localWorks', JSON.stringify(existing));
        }
        toast.success('Project added successfully!');
      }

      setIsAddingProject(false);
      setEditingProjectDocId(null);
      setNewProject({ title: '', category: '', challenge: '', solution: '', stats: '', features: [''], stallDesign: '', dateLocation: '', description: '', showOnHomepage: true });
      setImageFile(null);
      setAdditionalImageFiles([]);
      fetchWorks();
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Failed to save project');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Toggle Homepage Visibility ── */
  const handleToggleFeatured = async (docId, isChecked) => {
    setActionLoading(true);
    try {
      let savedToFirebase = false;
      if (isFirebaseAvailable() && !docId.startsWith('local-')) {
        try {
          await withTimeout(updateDoc(doc(db, 'works', docId), { showOnHomepage: isChecked }));
          savedToFirebase = true;
        } catch (_) {}
      }

      const existing = JSON.parse(localStorage.getItem('localWorks') || '[]');
      const updated = existing.map(w => w.docId === docId ? { ...w, showOnHomepage: isChecked } : w);
      localStorage.setItem('localWorks', JSON.stringify(updated));

      setWorks(prev => prev.map(w => w.docId === docId ? { ...w, showOnHomepage: isChecked } : w));
      toast.success(isChecked ? 'Project added to homepage!' : 'Project removed from homepage!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update homepage setting');
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
          } else {
            await deleteDoc(doc(db, 'works', docId));
          }
          toast.success('Project deleted');
          fetchWorks();
        } catch (error) {
          toast.error('Error deleting project');
        }
      }
    });
  };

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

  return (
    <div className="admin-dashboard">
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      <header className="admin-header glass-panel">
        <div className="container">
          <h2>Pinwheel Enterprise CMS</h2>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="container admin-main">
        <div className="admin-actions">
          <h3>Manage Portfolio</h3>
          <button className="btn-primary" onClick={toggleAddForm}>
            {isAddingProject ? 'Cancel' : <><Plus size={18} /> Add New Project</>}
          </button>
        </div>

        {isAddingProject && (
          <form className="admin-add-form glass-panel" onSubmit={handleAddProject}>
            <h4>{editingProjectDocId ? 'Edit Project' : 'Create New Project'}</h4>
            <div className="form-row">
              <div className="form-group half">
                <label>Company Name *</label>
                <input type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="e.g. Taskar Group" required />
              </div>
              <div className="form-group half">
                <label>Expo Name *</label>
                <input type="text" value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})} placeholder="e.g. Neo Tech Expo 2024" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Stall Design & Fabrication</label>
                <input type="text" value={newProject.stallDesign} onChange={e => setNewProject({...newProject, stallDesign: e.target.value})} placeholder="e.g. 12m x 6m Island Double Deck Stall" />
              </div>
              <div className="form-group half">
                <label>Date & Location</label>
                <input type="text" value={newProject.dateLocation} onChange={e => setNewProject({...newProject, dateLocation: e.target.value})} placeholder="e.g. Jan 2024, Munich Germany" />
              </div>
            </div>

            <div className="form-group">
              <label>Hero Image {editingProjectDocId && '(Leave empty to keep existing)'}</label>
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
              {newProject.additionalImages && newProject.additionalImages.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {newProject.additionalImages.map((imgUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                      <img src={imgUrl} alt="gallery preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                      <button 
                        type="button" 
                        onClick={() => {
                          const updated = newProject.additionalImages.filter((_, i) => i !== idx);
                          setNewProject({ ...newProject, additionalImages: updated });
                        }}
                        style={{ 
                          position: 'absolute', top: '-5px', right: '-5px', 
                          background: 'var(--accent-alt, #E33845)', color: '#fff', 
                          border: 'none', borderRadius: '50%', width: '20px', height: '20px', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} rows="4" placeholder="Enter general description about the project..."></textarea>
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

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
              <input 
                type="checkbox" 
                id="showOnHomepage" 
                checked={newProject.showOnHomepage !== false} 
                onChange={e => setNewProject({...newProject, showOnHomepage: e.target.checked})} 
                style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
              />
              <label htmlFor="showOnHomepage" style={{ margin: 0, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>Show on Homepage</label>
            </div>

            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : (editingProjectDocId ? 'Update Project' : 'Publish Project')}
            </button>
          </form>
        )}

        <div className="admin-project-list">
          {works.map(work => (
            <div key={work.docId} className="admin-project-card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div className="admin-project-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {work.image && <img src={work.image} alt={work.title} className="admin-thumb" />}
                <div>
                  <h4>{work.title}</h4>
                  <span className="admin-category">{work.category}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id={`toggle-featured-${work.docId}`}
                    checked={work.showOnHomepage !== false}
                    onChange={(e) => handleToggleFeatured(work.docId, e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor={`toggle-featured-${work.docId}`} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none', margin: 0 }}>
                    Show on Homepage
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startEdit(work)} className="btn-edit-inline" style={{ color: 'var(--text-secondary)', padding: '8px', cursor: 'pointer', background: 'transparent', border: 'none' }} title="Edit Project">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(work.docId)} className="btn-delete" title="Delete Project">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Client Logos Section ── */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '4rem 0' }} />

        <div className="admin-actions" style={{ marginTop: '2rem' }}>
          <h3>Manage Client Logos</h3>
          <button className="btn-primary" onClick={toggleAddClientForm}>
            {isAddingClient ? 'Cancel' : <><Plus size={18} /> Add New Logo</>}
          </button>
        </div>

        {isAddingClient && (
          <form className="admin-add-form glass-panel" onSubmit={handleAddClient} style={{ marginTop: '2rem' }}>
            <h4>{editingClientDocId ? 'Edit Client Logo' : 'Add Client Logo'}</h4>
            <div className="form-group">
              <label>Client / Brand Name *</label>
              <input type="text" value={newClient.name} onChange={e => setNewClient({ name: e.target.value })} placeholder="e.g. Google, Tesla" required />
            </div>

            <div className="form-group">
              <label>Logo Image File {editingClientDocId ? '(Leave empty to keep existing)' : '*'}</label>
              <div className="file-upload-wrapper">
                <ImageIcon size={20} />
                <input type="file" accept="image/*" onChange={e => setClientLogoFile(e.target.files[0])} required={!editingClientDocId} />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : (editingClientDocId ? 'Update Logo' : 'Publish Logo')}
            </button>
          </form>
        )}

        <div className="admin-project-list" style={{ marginTop: '2rem' }}>
          {clients.length === 0 ? (
            <p>No client logos uploaded yet.</p>
          ) : (
            clients.map(client => (
              <div key={client.docId} className="admin-project-card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="admin-project-info" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {client.logo && <img src={client.logo} alt={client.name} style={{ width: '80px', height: '40px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '4px' }} />}
                  <h4>{client.name}</h4>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startEditClient(client)} className="btn-edit-inline" style={{ color: 'var(--text-secondary)', padding: '8px', cursor: 'pointer', background: 'transparent', border: 'none' }} title="Edit Logo">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteClient(client.docId)} className="btn-delete" title="Delete Logo">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Client Reviews & Testimonials Section ── */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '4rem 0' }} />

        <div className="admin-actions" style={{ marginTop: '2rem' }}>
          <h3>Manage Client Reviews & Testimonials</h3>
          <button className="btn-primary" onClick={toggleAddReviewForm}>
            {isAddingReview ? 'Cancel' : <><Plus size={18} /> Add New Review</>}
          </button>
        </div>

        {isAddingReview && (
          <form className="admin-add-form glass-panel" onSubmit={handleAddReview} style={{ marginTop: '2rem' }}>
            <h4>{editingReviewDocId ? 'Edit Review / Testimonial' : 'Add Review / Testimonial'}</h4>
            
            <div className="form-group">
              <label>Review Type *</label>
              <select 
                value={newReview.type} 
                onChange={e => setNewReview({ ...newReview, type: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem 1rem', 
                  borderRadius: '8px', 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)' 
                }}
              >
                <option value="written">Written Testimonial (Display Text directly)</option>
                <option value="link">Google Review Link (Button to view external Review)</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Author / Client Name *</label>
                <input 
                  type="text" 
                  value={newReview.authorName} 
                  onChange={e => setNewReview({ ...newReview, authorName: e.target.value })} 
                  placeholder="e.g. Abhishek Sharma" 
                  required 
                />
              </div>
              <div className="form-group half">
                <label>Company / Designation (Optional)</label>
                <input 
                  type="text" 
                  value={newReview.company} 
                  onChange={e => setNewReview({ ...newReview, company: e.target.value })} 
                  placeholder="e.g. Taskar Group" 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Rating (Stars) *</label>
              <select 
                value={newReview.rating} 
                onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                style={{ 
                  width: '100%', 
                  padding: '0.8rem 1rem', 
                  borderRadius: '8px', 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-color)', 
                  color: 'var(--text-primary)' 
                }}
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div className="form-group">
              <label>Review Text / Snippet *</label>
              <textarea 
                value={newReview.text} 
                onChange={e => setNewReview({ ...newReview, text: e.target.value })} 
                placeholder="Enter the client's testimonial or review text here..."
                rows="4" 
                required
              ></textarea>
            </div>

            {newReview.type === 'link' && (
              <div className="form-group">
                <label>Google Review Link URL *</label>
                <input 
                  type="url" 
                  value={newReview.url} 
                  onChange={e => setNewReview({ ...newReview, url: e.target.value })} 
                  placeholder="https://g.page/r/..." 
                  required={newReview.type === 'link'} 
                />
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : (editingReviewDocId ? 'Update Review' : 'Publish Review')}
            </button>
          </form>
        )}

        <div className="admin-project-list" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
          {reviews.length === 0 ? (
            <p>No reviews added yet. Displaying defaults on the live website.</p>
          ) : (
            reviews.map(review => (
              <div key={review.docId} className="admin-project-card glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="admin-project-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <h4 style={{ margin: 0 }}>{review.authorName}</h4>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        background: 'rgba(255,255,255,0.08)', 
                        padding: '2px 8px', 
                        borderRadius: '10px',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {review.type === 'link' ? 'Google Link' : 'Written'}
                    </span>
                  </div>
                  {review.company && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{review.company}</span>}
                  <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0', opacity: 0.8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{review.text}"
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => startEditReview(review)} className="btn-edit-inline" style={{ color: 'var(--text-secondary)', padding: '8px', cursor: 'pointer', background: 'transparent', border: 'none' }} title="Edit Review">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDeleteReview(review.docId)} className="btn-delete" title="Delete Review">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Website Controls & Section Visibility Settings ── */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '4rem 0' }} />

        <div className="admin-actions" style={{ marginTop: '2rem' }}>
          <h3>Website Section Controls</h3>
        </div>

        <form className="admin-add-form glass-panel" onSubmit={handleSaveVisibilitySettings} style={{ marginTop: '2rem', marginBottom: '4rem' }}>
          <h4>Toggle Homepage Sections Visibility</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Choose which sections you want to enable/disable on the live website. Toggling off a section will also hide its navigation link from the main menu automatically.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              <input 
                type="checkbox" 
                checked={visibilitySettings.showWork} 
                onChange={e => setVisibilitySettings({ ...visibilitySettings, showWork: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
              Show Work / Portfolio Preview Section
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              <input 
                type="checkbox" 
                checked={visibilitySettings.showBrands} 
                onChange={e => setVisibilitySettings({ ...visibilitySettings, showBrands: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
              Show Trusted Brands / Clients Logo Marquee
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              <input 
                type="checkbox" 
                checked={visibilitySettings.showReviews} 
                onChange={e => setVisibilitySettings({ ...visibilitySettings, showReviews: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent)' }}
              />
              Show Client Reviews / Testimonials Carousel
            </label>
          </div>

          <button type="submit" className="btn-primary" disabled={actionLoading}>
            {actionLoading ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AdminDashboard;
