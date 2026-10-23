import { ArrowUpRight, Globe, Leaf, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-mark">
              <Leaf size={19} />
            </span>{' '}
            PlateShare
          </Link>
          <p>Good food belongs on a table, not in a bin.</p>
          <a href="mailto:hello@plateshare.org" className="footer-email">
            <Mail size={16} /> hello@plateshare.org
          </a>
        </div>
        <div className="footer-links">
          <p className="footer-heading">Explore</p>
          <Link to="/explore">Available food</Link>
          <Link to="/about">Our mission</Link>
          <Link to="/contact">Get in touch</Link>
          <Link to="/help">Help & FAQ</Link>
        </div>
        <div className="footer-links">
          <p className="footer-heading">Your PlateShare</p>
          <Link to="/register">Create an account</Link>
          <Link to="/login">Log in</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
        <div className="footer-note">
          <span>Small acts. Shared meals.</span>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="PlateShare on Instagram"
          >
            <Globe size={19} />
            <ArrowUpRight size={13} />
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} PlateShare Community</span>
        <span>Made for a world with less food waste.</span>
      </div>
    </footer>
  );
}
