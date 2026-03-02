import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', gap: '1rem' }}>
    <div style={{ fontSize: '5rem' }}>🔍</div>
    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Page Not Found</h1>
    <p style={{ color: 'var(--gray-500)', maxWidth: '400px' }}>The page you're looking for doesn't exist or has been moved.</p>
    <Link to="/" style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 700, marginTop: '0.5rem' }}>Go Home</Link>
  </div>
);

export default NotFoundPage;
