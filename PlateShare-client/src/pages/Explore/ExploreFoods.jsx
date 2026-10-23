import { useDeferredValue, useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import FoodCard from '../../components/FoodCard';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import {
  EmptyState,
  FoodCardSkeleton,
  StatusState,
} from '../../components/UI/Loading';
import { api } from '../../services/api';
import { usePlateShare } from '../../context/usePlateShare';

const pageSize = 8;

export default function ExploreFoods() {
  const { foods, categories } = usePlateShare();
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(
    params.get('category') || 'All categories',
  );
  const [location, setLocation] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loadedQuery, setLoadedQuery] = useState('');
  const [requestError, setRequestError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const deferredQuery = useDeferredValue(query.trim());
  const locations = [
    ...new Set(foods.map((food) => food.location.split(',')[0])),
  ].sort();
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(pageSize),
    sort,
  });
  if (deferredQuery) searchParams.set('search', deferredQuery);
  if (category !== 'All categories') searchParams.set('category', category);
  if (location.trim()) searchParams.set('location', location.trim());
  const queryKey = searchParams.toString();
  const loading = loadedQuery !== queryKey;
  const error = requestError?.query === queryKey ? requestError.message : '';

  useEffect(() => {
    let active = true;
    api(`/foods?${queryKey}`)
      .then((data) => {
        if (!active) return;
        setItems(data.items);
        setTotal(data.total);
        setPages(data.pages);
        setRequestError(null);
      })
      .catch((fetchError) => {
        if (active)
          setRequestError({ query: queryKey, message: fetchError.message });
      })
      .finally(() => {
        if (active) setLoadedQuery(queryKey);
      });
    return () => {
      active = false;
    };
  }, [queryKey, retryKey]);

  const setFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('All categories');
    setLocation('');
    setPage(1);
  };

  const retry = () => {
    setRequestError(null);
    setLoadedQuery('');
    setRetryKey((current) => current + 1);
  };

  return (
    <main className="listing-page">
      <section className="listing-intro">
        <div className="container">
          <p className="eyebrow">A neighbour might have just what you need</p>
          <h1>
            Find good food
            <br />
            <em>around the corner.</em>
          </h1>
          <p>Browse food shared by people and community groups near you.</p>
        </div>
      </section>
      <div className="container listing-content">
        <div className="listing-toolbar">
          <label className="search-field">
            <Search size={19} />
            <span className="sr-only">Search foods</span>
            <Input
              id="food-search"
              name="search"
              bare
              value={query}
              onChange={setFilter(setQuery)}
              placeholder="Search food, ingredients, or neighbourhood"
            />
          </label>
          <div className="filter-controls">
            <label>
              <SlidersHorizontal size={16} />
              <span className="sr-only">Filter by category</span>
              <Input
                as="select"
                id="food-category"
                name="category"
                bare
                value={category}
                onChange={setFilter(setCategory)}
              >
                <option>All categories</option>
                {categories.map((item) => (
                  <option key={item._id}>{item.name}</option>
                ))}
              </Input>
            </label>
            <label>
              <span className="sr-only">Filter by location</span>
              <Input
                as="input"
                id="food-location"
                name="location"
                bare
                controlClassName="location-filter"
                list="food-locations"
                value={location}
                onChange={setFilter(setLocation)}
                placeholder="Any location"
              />
              <datalist id="food-locations">
                {locations.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </label>
            <label>
              <span className="sr-only">Sort foods</span>
              <Input
                as="select"
                id="food-sort"
                name="sort"
                bare
                value={sort}
                onChange={setFilter(setSort)}
              >
                <option value="newest">Newest first</option>
                <option value="quantity">Most servings</option>
                <option value="oldest">Oldest first</option>
              </Input>
            </label>
          </div>
        </div>
        <div className="results-line">
          <p>
            <strong>{total}</strong> food shares
          </p>
          <span>Available near your community</span>
        </div>
        {error && (
          <StatusState
            message={error}
            action={
              <Button variant="outline" size="sm" onClick={retry}>
                Try again
              </Button>
            }
          />
        )}
        {loading ? (
          <div className="food-grid">
            {Array.from({ length: pageSize }, (_, index) => (
              <FoodCardSkeleton key={index} />
            ))}
          </div>
        ) : items.length ? (
          <div className="food-grid">
            {items.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search size={26} />}
            title="No food found"
            message="Try a different search or remove a filter."
            action={
              <Button variant="text" className="text-link" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        )}
        {pages > 1 && (
          <nav className="pagination" aria-label="Food listing pages">
            <Button
              variant="pagination"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span>
              Page {page} of {pages}
            </span>
            <Button
              variant="pagination"
              disabled={page === pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </nav>
        )}
      </div>
    </main>
  );
}
