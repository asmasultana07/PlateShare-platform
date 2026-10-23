import { ArrowUpRight } from 'lucide-react';
import Button from '../UI/Button';

export default function ClosingCTA({ user }) {
  return (
    <section className="closing-cta">
      <div className="container closing-content">
        <div>
          <p className="eyebrow">Your neighbourhood is already sharing</p>
          <h2>Pull up a chair.</h2>
        </div>
        <Button to={user ? '/add-food' : '/register'} variant="cream">
          {user ? 'Share some food' : 'Join PlateShare'}{' '}
          <ArrowUpRight size={18} />
        </Button>
      </div>
    </section>
  );
}
