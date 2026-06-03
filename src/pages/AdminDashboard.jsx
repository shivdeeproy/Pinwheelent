import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm }

  const [newProject, setNewProject] = useState({
    title: '', category: '', challenge: '', solution: '', stats: '', features: ['']
  });
  const [imageFile, setImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);

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
      additionalImages: project.additionalImages || []
    });
    setImageFile(null);
    setAdditionalImageFiles([]);
    setIsAddingProject(true);
  };

  const toggleAddForm = () => {
    if (isAddingProject) {
      setIsAddingProject(false);
      setEditingProjectDocId(null);
      setNewProject({ title: '', category: '', challenge: '', solution: '', stats: '', features: [''] });
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
    const localAdmin = localStorage.getItem('adminUser');
    if (localAdmin) {
      setUser(JSON.parse(localAdmin));
      setAuthLoading(false);
      fetchWorks();
      fetchClients();
      return;
    }

    const timeoutId = setTimeout(() => setAuthLoading(false), 5000);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      clearTimeout(timeoutId);
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        fetchWorks();
        fetchClients();
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
          if (!isFirebaseAvailable()) throw new Error('Offline');
          const logoRef = ref(storage, `clients/${Date.now()}_${clientLogoFile.name}`);
          await withTimeout(uploadBytes(logoRef, clientLogoFile));
          logoUrl = await withTimeout(getDownloadURL(logoRef));
        } catch (_) {
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
      fetchClients();
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
          if (!isFirebaseAvailable()) throw new Error('Offline');
          const imageRef = ref(storage, `works/${Date.now()}_hero_${imageFile.name}`);
          await withTimeout(uploadBytes(imageRef, imageFile));
          imageUrl = await withTimeout(getDownloadURL(imageRef));
        } catch (_) {
          imageUrl = URL.createObjectURL(imageFile);
        }
      }

      if (additionalImageFiles.length > 0) {
        try {
          if (!isFirebaseAvailable()) throw new Error('Offline');
          for (let i = 0; i < additionalImageFiles.length; i++) {
            const file = additionalImageFiles[i];
            const fileRef = ref(storage, `works/additional/${Date.now()}_${i}_${file.name}`);
            await withTimeout(uploadBytes(fileRef, file));
            additionalImageUrls.push(await withTimeout(getDownloadURL(fileRef)));
          }
        } catch (_) {
          for (let i = 0; i < additionalImageFiles.length; i++) {
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
      setNewProject({ title: '', category: '', challenge: '', solution: '', stats: '', features: [''] });
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
          <h2>Pinwheelent CMS</h2>
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
                <label>Project Title *</label>
                <input type="text" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="e.g. Neo Tech Expo 2024" required />
              </div>
              <div className="form-group half">
                <label>Category *</label>
                <input type="text" value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})} placeholder="e.g. Technology & SaaS" required />
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
              {actionLoading ? 'Saving...' : (editingProjectDocId ? 'Update Project' : 'Publish Project')}
            </button>
          </form>
        )}

        <div className="admin-project-list">
          {works.map(work => (
            <div key={work.docId} className="admin-project-card glass-panel">
              <div className="admin-project-info">
                {work.image && <img src={work.image} alt={work.title} className="admin-thumb" />}
                <div>
                  <h4>{work.title}</h4>
                  <span className="admin-category">{work.category}</span>
                </div>
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
      </main>
    </div>
  );
};

export default AdminDashboard;
