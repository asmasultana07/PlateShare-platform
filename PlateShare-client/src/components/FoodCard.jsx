import { ArrowUpRight, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import foodFallback from '../assets/hero.png';
import Card from './UI/Card';
import Badge from './UI/Badge';
import Button from './UI/Button';

export default function FoodCard({ food }) {
  return (
    <Card as="article" className="food-card">
      <Link
        className="food-card-image"
        to={`/foods/${food._id}`}
        aria-label={`View ${food.title}`}
      >
        <img
          src={food.image}
          alt={food.title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = foodFallback;
          }}
        />
        <Badge className="food-category">{food.category}</Badge>
      </Link>
      <div className="food-card-content">
        <div className="food-card-title-row">
          <h3>{food.title}</h3>
          <span className="serves">
            <Users size={15} /> {food.quantity}
          </span>
        </div>
        <p className="food-card-description">{food.description}</p>
        <div className="food-card-meta">
          <MapPin size={15} /> {food.location}
        </div>
        <Button
          to={`/foods/${food._id}`}
          variant="card-link"
          className="food-card-link"
        >
          View details <ArrowUpRight size={16} />
        </Button>
      </div>
    </Card>
  );
}
