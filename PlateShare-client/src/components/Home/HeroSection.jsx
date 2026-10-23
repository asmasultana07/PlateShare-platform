import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Leaf,
  Sprout,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../UI/Button';
import heroImage from '../../assets/hero.png';

export default function HeroSection({ user }) {
  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="eyebrow">
            <span className="eyebrow-dot" /> Good food, closer to home
          </p>
          <h1>
            There’s enough
            <br />
            to go <em>around.</em>
          </h1>
          <p className="hero-description">
            PlateShare brings neighbours together to pass on good food, make
            room in the fridge, and put more meals on the table.
          </p>
          <div className="hero-actions">
            <Button to="/explore" className="button-dark">
              Find food nearby <ArrowRight size={17} />
            </Button>
            <Button to={user ? '/add-food' : '/register'} variant="light">
              Share your surplus <ArrowUpRight size={17} />
            </Button>
          </div>
          <div className="hero-proof">
            <div className="avatar-stack">
              <span>MG</span>
              <span>TY</span>
              <span>AY</span>
              <span>+2k</span>
            </div>
            <p>
              <strong>Neighbours sharing</strong>
              <br />
              one meal at a time
            </p>
          </div>
        </motion.div>
        <div
          className="hero-art"
          style={{ backgroundImage: `url(${heroImage})` }}
          role="img"
          aria-label="Fresh seasonal food gathered for sharing"
        >
          <div className="hero-note">
            <span className="note-icon">
              <Leaf size={18} />
            </span>
            <div>
              <strong>Shared this morning</strong>
              <span>Fresh from the garden</span>
            </div>
            <span className="note-arrow">
              <ArrowUpRight size={17} />
            </span>
          </div>
          <div className="hero-stamp">
            <span>GOOD FOOD</span>
            <Sprout size={22} />
            <span>GOES AROUND</span>
          </div>
        </div>
      </div>
      <a href="#featured" className="scroll-cue">
        <ArrowDown size={15} /> Scroll to explore
      </a>
    </section>
  );
}
