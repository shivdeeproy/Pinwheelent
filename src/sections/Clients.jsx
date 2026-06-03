import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Clients.css';

const withTimeout = (promise, ms = 3000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore timeout')), ms)
    )
  ]);

const Clients = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      // Try local storage first
      const cached = localStorage.getItem('localClients');
      if (cached) {
        setClients(JSON.parse(cached));
      }

      if (navigator.onLine) {
        try {
          const querySnapshot = await withTimeout(getDocs(collection(db, 'clients')));
          if (!querySnapshot.empty) {
            const clientsData = querySnapshot.docs.map(doc => doc.data());
            setClients(clientsData);
            localStorage.setItem('localClients', JSON.stringify(clientsData));
          }
        } catch (_) {
          console.warn('Clients database fetch timed out, displaying local fallback logos');
        }
      }
    };
    fetchClients();
  }, []);

  // Default fallback logos to populate if empty
  const defaultLogos = [
    { name: 'Nexus Automotive', id: 'def-1' },
    { name: 'Horizon Cloud Tech', id: 'def-2' },
    { name: 'BioHealth Pharma', id: 'def-3' },
    { name: 'Urban Decor Co.', id: 'def-4' },
    { name: 'Skyline Aviation', id: 'def-5' },
    { name: 'EcoPower Solutions', id: 'def-6' }
  ];

  const displayList = clients.length > 0 ? clients : defaultLogos;

  // Duplicate items to ensure a seamless infinite animation loop
  const duplicateList = [...displayList, ...displayList, ...displayList];

  return (
    <section id="clients" className="clients-section">
      <div className="container text-center">
        <h2 className="section-title">Trusted By Leading Brands</h2>
        <p className="section-subtitle">Delivering high-impact designs for enterprises and innovators worldwide</p>
      </div>

      <div className="marquee-wrapper">
        <div className="marquee-track">
          {duplicateList.map((client, idx) => (
            <div className="marquee-item glass-panel" key={`${client.id || client.docId}-${idx}`}>
              {client.logo && (
                <img src={client.logo} alt={client.name} className="client-logo-img" />
              )}
              <span className="client-name-text">{client.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;
