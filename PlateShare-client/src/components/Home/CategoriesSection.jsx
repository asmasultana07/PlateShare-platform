import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const descriptions = {
  Produce: 'Fruit, veg & herbs',
  Bakery: 'Bread & baked goods',
  'Prepared meals': 'Ready to enjoy',
  Pantry: 'Unopened essentials',
};

export default function CategoriesSection({ categories }) {
  return (
    <section className="section categories-section">
      <div className="container category-layout">
        <div>
          <p className="eyebrow">A little bit of everything</p>
          <h2>
            What’s being
            <br />
            shared <em>today?</em>
          </h2>
          <p className="section-intro">
            From a loaf for later to a whole garden harvest, there’s always
            something worth passing on.
          </p>
          <Link to="/explore" className="text-link">
            Browse the table <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="category-list">
          {categories.map((category, index) => (
            <Link
              key={category._id}
              to={`/explore?category=${encodeURIComponent(category.name)}`}
            >
              <span className="category-index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{category.name}</span>
              <span className="category-count">
                {descriptions[category.name] || 'Community food shares'}
              </span>
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
