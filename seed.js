import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForTesting",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "pinwheelent-admin.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "pinwheelent-admin",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "pinwheelent-admin.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedProjects = [
  {
    id: 'cyber-security-expo-2025',
    title: 'Cyber Security Expo 2025',
    category: 'Technology',
    challenge: 'The client needed a booth that looked futuristic and highly secure to reflect their cybersecurity brand.',
    solution: 'We built a 40x40 custom stall featuring LED neon accents, a glass-enclosed meeting room, and interactive touch screens for product demos.',
    stats: 'Attracted 5,000+ visitors. Won "Most Creative Stall".',
    features: ['Custom LED lighting', 'Glass meeting room', 'Interactive displays'],
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1112&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1169&q=80'
    ]
  },
  {
    id: 'eco-living-summit-2024',
    title: 'Eco Living Summit 2024',
    category: 'Sustainability',
    challenge: 'Create a completely sustainable and recyclable exhibition stand for an eco-friendly brand.',
    solution: 'Utilized reclaimed wood, recycled cardboard tubes, and living moss walls to create an organic, earthy feel.',
    stats: 'Generated 200+ qualified leads. 100% recyclable materials.',
    features: ['Living moss wall', 'Reclaimed wood structure', 'Recyclable materials'],
    image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=627&q=80'
    ]
  },
  {
    id: 'auto-expo-premium-booth',
    title: 'Auto Expo Premium Booth',
    category: 'Automotive',
    challenge: 'Showcase a new luxury electric vehicle with a high-end, minimalist aesthetic.',
    solution: 'Designed a sleek, dark-themed pavilion with overhead circular lighting trusses to highlight the vehicle\'s curves.',
    stats: 'Featured in 5+ automotive magazines.',
    features: ['Overhead circular lighting', 'Minimalist design', 'Premium flooring'],
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1425&q=80',
      'https://images.unsplash.com/photo-1503376713745-97992cf68b1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
    ]
  }
];

async function seed() {
  console.log("Starting database seeding...");
  
  for (const project of seedProjects) {
    try {
      const docRef = await addDoc(collection(db, "works"), {
        ...project,
        createdAt: serverTimestamp()
      });
      console.log(`Added project: ${project.title} with ID: ${docRef.id}`);
    } catch (e) {
      console.error("Error adding project:", project.title, e);
    }
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed();
