import { ArrowUpRight, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MissionSection() {
  return (
    <section className="mission-section">
      <div className="container mission-grid">
        <div className="mission-graphic">
          <div className="mission-circle">
            <Sprout size={52} strokeWidth={1.2} />
          </div>
          <span className="mission-label mission-label-one">
            grown with care
          </span>
          <span className="mission-label mission-label-two">
            shared with neighbours
          </span>
          <span className="mission-label mission-label-three">
            kept out of waste
          </span>
        </div>
        <div className="mission-copy">
          <p className="eyebrow">Why we’re here</p>
          <h2>
            Waste less.
            <br />
            <em>Make more room.</em>
          </h2>
          <p>
            Good food gets left behind for all kinds of reasons. We make it
            easier for local people to find it, share it, and turn a surplus
            into someone’s next meal.
          </p>
          <div className="mission-facts">
            <span>
              <strong>01</strong> Local first
            </span>
            <span>
              <strong>02</strong> People over perfect
            </span>
            <span>
              <strong>03</strong> Every portion counts
            </span>
          </div>
          <Link to="/about" className="text-link">
            Read our story <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
