import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodCard from '../FoodCard';
import { FoodCardSkeleton } from '../UI/Loading';
import Button from '../UI/Button';

export default function FeaturedFoods({ foods, loading, error }) {
  const featured = [...foods]
    .filter((food) => food.status === 'available')
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);
  return (
    <section className="section featured-section" id="featured">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">On the table right now</p>
            <h2>
              Good things, <em>near you.</em>
            </h2>
          </div>
          <Link to="/explore" className="text-link">
            Explore all food <ArrowUpRight size={17} />
          </Link>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="food-grid">
          {loading
            ? Array.from({ length: 6 }, (_, index) => (
                <FoodCardSkeleton key={index} />
              ))
            : featured.map((food) => <FoodCard key={food._id} food={food} />)}
        </div>
        {!loading && !featured.length && (
          <p className="empty-state">
            No food listings yet. Be the first to share something.
          </p>
        )}
        <div className="center-action">
          <Button to="/explore" variant="outline">
            Show all available food <ArrowRight size={17} />
          </Button>
        </div>
      </div>
    </section>
  );
}
