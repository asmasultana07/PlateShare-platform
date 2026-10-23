import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  MessageCircle,
  Users,
  X,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FoodCard from '../../components/FoodCard';
import Badge from '../../components/UI/Badge';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Loading from '../../components/UI/Loading';
import Modal from '../../components/UI/Modal';
import Table from '../../components/UI/Table';
import { api } from '../../services/api';
import { usePlateShare } from '../../context/usePlateShare';
import foodFallback from '../../assets/hero.png';

export default function FoodDetails() {
  const { foodId } = useParams();
  const navigate = useNavigate();
  const { foods, requests, user, loading, addRequest, updateRequest } =
    usePlateShare();
  const [remoteFood, setRemoteFood] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [requestFinished, setRequestFinished] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [decisionError, setDecisionError] = useState('');
  const food = foods.find((item) => item._id === foodId) || remoteFood;
  const images = food?.images?.length
    ? food.images
    : food?.image
      ? [food.image]
      : [];
  const activeImageIndex = selectedImage % Math.max(1, images.length);
  const activeImage = images[activeImageIndex] || food?.image;

  useEffect(() => {
    const knownFood = foods.find((item) => item._id === foodId);
    if (knownFood) return;
    if (loading) return;

    let active = true;
    api(`/foods/${foodId}`)
      .then((data) => {
        if (active) setRemoteFood(data.item);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setRequestFinished(true);
      });
    return () => {
      active = false;
    };
  }, [foodId, foods, loading]);

  const submitRequest = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await addRequest(food);
      setSuccess(true);
      setModalOpen(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const decideRequest = async (id, status) => {
    setDecisionError('');
    try {
      await updateRequest(id, status);
    } catch (requestError) {
      setDecisionError(requestError.message);
    }
  };

  if (!food && !requestFinished && !error)
    return <Loading label="Loading food share…" />;
  if (!food)
    return (
      <main className="container page-message">
        <p className="eyebrow">Listing unavailable</p>
        <h1>This share has moved on.</h1>
        <p role="alert">{error}</p>
        <Link to="/explore" className="text-link">
          Back to available food
        </Link>
      </main>
    );

  const isOwner = user?._id === food.ownerId || user?.role === 'admin';
  const foodRequests = requests.filter(
    (request) => request.foodId === food._id,
  );
  const related = foods
    .filter((item) => item._id !== food._id && item.category === food.category)
    .slice(0, 3);

  return (
    <main className="details-page">
      <div className="container details-container">
        <Link to="/explore" className="back-link">
          <ArrowLeft size={16} /> Back to explore
        </Link>
        <div className="details-grid">
          <div className="details-gallery">
            <div className="details-image-wrap">
              <img
                src={activeImage}
                alt={`${food.title}, image ${activeImageIndex + 1}`}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = foodFallback;
                }}
              />
              <Badge className="food-category">{food.category}</Badge>
              {images.length > 1 && (
                <>
                  <Button
                    variant="icon"
                    className="gallery-arrow gallery-previous"
                    aria-label="Previous food image"
                    onClick={() =>
                      setSelectedImage(
                        (index) => (index - 1 + images.length) % images.length,
                      )
                    }
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  <Button
                    variant="icon"
                    className="gallery-arrow gallery-next"
                    aria-label="Next food image"
                    onClick={() =>
                      setSelectedImage((index) => (index + 1) % images.length)
                    }
                  >
                    <ChevronRight size={20} />
                  </Button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div
                className="details-thumbnails"
                aria-label="Food image thumbnails"
              >
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={activeImageIndex === index ? 'active' : ''}
                    aria-label={`Show image ${index + 1}`}
                    aria-pressed={activeImageIndex === index}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="details-copy">
            <p className="eyebrow">A local food share</p>
            <h1>{food.title}</h1>
            <p className="details-description">{food.description}</p>
            <div className="details-meta">
              <span>
                <Users size={17} /> Serves {food.quantity}
              </span>
              <span>
                <MapPin size={17} /> {food.location}
              </span>
              <span>
                <Clock3 size={17} /> {food.pickupWindow}
              </span>
              <span>
                <CalendarDays size={17} /> Posted{' '}
                {new Date(food.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="owner-strip">
              <span className="owner-avatar">
                {food.ownerName
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)}
              </span>
              <span>
                <small>Shared by</small>
                <strong>{food.ownerName}</strong>
              </span>
              <span className="verified-mark">
                <Check size={14} /> Neighbour
              </span>
            </div>
            {success && (
              <p className="form-success" role="status">
                Request sent. The food sharer can now review it.
              </p>
            )}
            {error && !modalOpen && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {!isOwner && (
              <Button
                className="request-button"
                onClick={() => (user ? setModalOpen(true) : navigate('/login'))}
              >
                Request this food <MessageCircle size={17} />
              </Button>
            )}
          </div>
        </div>

        {isOwner && (
          <section className="requests-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">For this listing</p>
                <h2>
                  Food requests <em>({foodRequests.length})</em>
                </h2>
              </div>
            </div>
            {decisionError && (
              <p className="form-error" role="alert">
                {decisionError}
              </p>
            )}
            {foodRequests.length ? (
              <Table>
                <table>
                  <thead>
                    <tr>
                      <th>Neighbour</th>
                      <th>Email</th>
                      <th>Requested</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodRequests.map((request) => (
                      <tr key={request._id}>
                        <td>{request.name}</td>
                        <td>{request.userEmail}</td>
                        <td>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <Badge className={`status status-${request.status}`}>
                            {request.status}
                          </Badge>
                        </td>
                        <td className="table-actions">
                          <Button
                            variant="icon"
                            disabled={request.status !== 'pending'}
                            aria-label="Accept request"
                            onClick={() =>
                              decideRequest(request._id, 'accepted')
                            }
                          >
                            <Check size={16} />
                          </Button>
                          <Button
                            variant="icon"
                            disabled={request.status !== 'pending'}
                            aria-label="Reject request"
                            onClick={() =>
                              decideRequest(request._id, 'rejected')
                            }
                          >
                            <X size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Table>
            ) : (
              <p className="empty-state compact">
                There are no requests for this share yet.
              </p>
            )}
          </section>
        )}

        {!!related.length && (
          <section className="related-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Keep looking</p>
                <h2>
                  More from <em>{food.category.toLowerCase()}.</em>
                </h2>
              </div>
              <Link to="/explore" className="text-link">
                See all food <ArrowLeft size={16} />
              </Link>
            </div>
            <div className="food-grid">
              {related.map((item) => (
                <FoodCard food={item} key={item._id} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Request this share"
      >
        <p className="eyebrow">One small step</p>
        <p>
          We’ll let {food.ownerName} know you’re interested in {food.title}.
        </p>
        <form onSubmit={submitRequest}>
          <Input
            id="request-name"
            label="Your name"
            value={user?.name || ''}
            readOnly
          />
          <Input
            id="request-email"
            label="Email address"
            value={user?.email || ''}
            readOnly
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send request'}{' '}
            <MessageCircle size={17} />
          </Button>
        </form>
      </Modal>
    </main>
  );
}
