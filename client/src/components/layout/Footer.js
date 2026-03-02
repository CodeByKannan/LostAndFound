import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-inner">
      <div className="footer-brand">
        <span className="brand-icon">🔍</span>
        <span>Campus Lost &amp; Found</span>
      </div>
      <div className="footer-links">
        <Link to="/items?type=lost">Lost Items</Link>
        <Link to="/items?type=found">Found Items</Link>
        <Link to="/post">Post Item</Link>
        <Link to="/register">Sign Up</Link>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} Campus Lost &amp; Found. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
