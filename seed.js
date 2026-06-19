import dotenv from 'dotenv';
dotenv.config();

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
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
    image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&amp;q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=627&amp;q=80'
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
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&amp;q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1425&amp;q=80',
      'https://images.unsplash.com/photo-1503376713745-97992cf68b1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&amp;q=80'
    ]
  }
];

const seedReviews = [
  {
    type: 'written',
    authorName: 'Abhishek Sharma',
    company: 'Taskar Group',
    rating: 5,
    text: 'Pinwheel Enterprise did an exceptional job with our Stall construction. The attention to detail and professional execution exceeded our expectations.'
  },
  {
    type: 'link',
    authorName: 'Rohan Mehta',
    company: 'Deccan Chemicals',
    rating: 5,
    text: 'Outstanding design and stellar project management. Highly recommend their exhibition fabrication services!',
    url: 'https://g.page/r/example-google-review-link'
  },
  {
    type: 'written',
    authorName: 'Priya Nair',
    company: 'Pillai Tech',
    rating: 5,
    text: 'Their glassmorphic stall layout was the talk of the entire expo. Foot traffic was up by 40% compared to last year.'
  }
];

const seedClients = [
  { name: 'Nexus Automotive', logo: '' },
  { name: 'Horizon Cloud Tech', logo: '' },
  { name: 'BioHealth Pharma', logo: '' },
  { name: 'Urban Decor Co.', logo: '' },
  { name: 'Skyline Aviation', logo: '' },
  { name: 'EcoPower Solutions', logo: '' }
];

async function seed() {
  console.log("Starting database seeding...");
  
  // 1. Seed Works
  console.log("Seeding works...");
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

  // 2. Seed Reviews
  console.log("Seeding reviews...");
  for (const review of seedReviews) {
    try {
      const docRef = await addDoc(collection(db, "reviews"), {
        ...review,
        createdAt: serverTimestamp()
      });
      console.log(`Added review by: ${review.authorName} with ID: ${docRef.id}`);
    } catch (e) {
      console.error("Error adding review:", review.authorName, e);
    }
  }

  // 3. Seed Clients
  console.log("Seeding clients...");
  for (const client of seedClients) {
    try {
      const docRef = await addDoc(collection(db, "clients"), {
        ...client,
        createdAt: serverTimestamp()
      });
      console.log(`Added client: ${client.name} with ID: ${docRef.id}`);
    } catch (e) {
      console.error("Error adding client:", client.name, e);
    }
  }

  // 4. Seed Settings
  console.log("Seeding settings...");
  try {
    await setDoc(doc(db, "settings", "sectionVisibility"), {
      showWork: true,
      showBrands: true,
      showReviews: true
    });
    console.log("Added settings visibility config");
  } catch (e) {
    console.error("Error adding settings:", e);
  }
  
  console.log("Seeding complete!");
  process.exit(0);
}

seed();
