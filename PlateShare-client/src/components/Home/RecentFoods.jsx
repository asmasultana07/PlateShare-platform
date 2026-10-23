import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodCard from '../FoodCard';
import { EmptyState, FoodCardSkeleton, StatusState } from '../UI/Loading';

export default function RecentFoods({ foods, loading, error }) {
  return (
    <section className="section recent-section">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Just added to the table</p>
            <h2>
              Recent <em>food shares.</em>
            </h2>
          </div>
          <Link to="/explore" className="text-link">
            See every share <ArrowUpRight size={17} />
          </Link>
        </div>
        {error && <StatusState message={error} />}
        {loading ? (
          <div className="food-grid">
            {Array.from({ length: 3 }, (_, index) => (
              <FoodCardSkeleton key={index} />
            ))}
          </div>
        ) : foods.length ? (
          <div className="food-grid recent-food-grid">
            {foods.slice(0, 3).map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        ) : (
          <EmptyState
            compact
            title="No recent shares yet"
            message="New community listings will appear here."
          />
        )}
      </div>
    </section>
  );
}
