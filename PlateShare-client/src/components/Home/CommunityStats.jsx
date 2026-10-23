import { Leaf } from 'lucide-react';

export default function CommunityStats({ stats }) {
  return (
    <section className="stats-band" aria-label="PlateShare community impact">
      <div className="container stats-grid">
        <div>
          <span className="stat-number">
            {stats.servings.toLocaleString()}
            <small>+</small>
          </span>
          <span className="stat-label">portions ready to share</span>
        </div>
        <div>
          <span className="stat-number">{stats.neighborhoods}</span>
          <span className="stat-label">neighbourhoods connected</span>
        </div>
        <div>
          <span className="stat-number">{stats.requests}</span>
          <span className="stat-label">community requests</span>
        </div>
        <div className="stats-aside">
          <Leaf size={20} />
          <span>
            Good food is a resource.
            <br />
            Let’s treat it like one.
          </span>
        </div>
      </div>
    </section>
  );
}
