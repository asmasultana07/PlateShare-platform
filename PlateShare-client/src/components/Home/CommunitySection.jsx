import { ArrowRight } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';

export default function CommunitySection() {
  return (
    <section className="section community-section">
      <div className="container community-grid">
        <div>
          <p className="eyebrow">A community thing</p>
          <h2>
            Every share starts
            <br />
            with a <em>hello.</em>
          </h2>
          <p className="section-intro">
            PlateShare is built on trust, kindness, and the simple joy of having
            enough to pass around.
          </p>
          <Button to="/register">
            Join your neighbours <ArrowRight size={17} />
          </Button>
        </div>
        <Card className="community-quote">
          <span className="quote-mark">“</span>
          <blockquote>
            We posted extra tomatoes and came home with soup, herbs, and three
            new neighbours.
          </blockquote>
          <div className="quote-author">
            <span className="quote-avatar">JL</span>
            <span>
              <strong>Jamie L.</strong>
              <small>PlateShare member, Hackney</small>
            </span>
            <span className="quote-rating">★★★★★</span>
          </div>
        </Card>
      </div>
    </section>
  );
}
