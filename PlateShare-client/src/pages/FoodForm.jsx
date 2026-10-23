import { useEffect, useState } from 'react';
import { ArrowLeft, ImagePlus, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import Loading from '../components/UI/Loading';
import { usePlateShare } from '../context/usePlateShare';

const emptyFood = {
  title: '',
  category: 'Produce',
  description: '',
  quantity: '',
  location: '',
  pickupWindow: '',
  image: '',
  images: [],
};

export default function FoodForm({ edit = false }) {
  const { foodId } = useParams();
  const { foods, categories, user, addFood, updateFood, refreshMyFoods } =
    usePlateShare();
  const navigate = useNavigate();
  const existing = foods.find((food) => food._id === foodId);
  const [formFields, setFormFields] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(edit && !existing);
  const fields = formFields || (edit && existing ? existing : emptyFood);
  const imageList = fields.images?.length
    ? fields.images
    : fields.image
      ? [fields.image]
      : [];
  const imageUrls = formFields?.imageUrls ?? imageList.join('\n');

  useEffect(() => {
    if (edit && !existing) {
      refreshMyFoods()
        .catch((requestError) => setError(requestError.message))
        .finally(() => setLoadingExisting(false));
    }
  }, [edit, existing, refreshMyFoods]);

  const update = (event) => {
    setFormFields((current) => ({
      ...(current || (edit && existing ? existing : emptyFood)),
      [event.target.name]: event.target.value,
    }));
  };

  const updateImages = (event) => {
    const imageUrls = event.target.value;
    const images = imageUrls
      .split('\n')
      .map((image) => image.trim())
      .filter(Boolean);
    setFormFields((current) => ({
      ...(current || (edit && existing ? existing : emptyFood)),
      imageUrls,
      image: images[0] || '',
      images,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const quantity = Number(fields.quantity);
    if (
      fields.title.trim().length < 3 ||
      fields.description.trim().length < 12
    ) {
      setError(
        'Add a clear title and a description of at least 12 characters.',
      );
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('Servings must be a whole number greater than zero.');
      return;
    }
    const images = imageUrls
      .split('\n')
      .map((image) => image.trim())
      .filter(Boolean);
    if (
      !images.length ||
      images.length > 5 ||
      images.some((image) => !/^https?:\/\//i.test(image))
    ) {
      setError('Add between one and five valid image URLs, one per line.');
      return;
    }

    const payload = {
      title: fields.title.trim(),
      category: fields.category,
      description: fields.description.trim(),
      quantity,
      location: fields.location.trim(),
      pickupWindow: fields.pickupWindow.trim(),
      image: images[0],
      images,
    };
    setSaving(true);
    setError('');
    try {
      if (edit) await updateFood(foodId, payload);
      else await addFood(payload);
      setSuccess(true);
      window.setTimeout(() => navigate('/dashboard'), 450);
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  };

  if (loadingExisting) return <Loading label="Loading listing…" />;
  if (
    edit &&
    (!existing || (existing.ownerId !== user._id && user.role !== 'admin'))
  ) {
    return (
      <main className="container page-message">
        <h1>You cannot edit this listing.</h1>
        <p>{error}</p>
        <Link to="/dashboard" className="text-link">
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="form-page">
      <div className="container narrow-container">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <div className="form-page-heading">
          <p className="eyebrow">
            {edit ? 'Update your listing' : 'Pass it along'}
          </p>
          <h1>{edit ? 'A little change.' : 'Share good food.'}</h1>
          <p>
            Tell your neighbours what is available and when they can collect it.
          </p>
        </div>
        <Card
          as="form"
          className="standard-form card-form"
          onSubmit={submit}
          noValidate
        >
          <Input
            name="title"
            label="Food title"
            value={fields.title}
            onChange={update}
            placeholder="e.g. Fresh garden tomatoes"
            minLength={3}
            required
          />
          <div className="form-row">
            <Input
              as="select"
              name="category"
              label="Category"
              value={fields.category}
              onChange={update}
            >
              {categories.map((item) => (
                <option key={item._id}>{item.name}</option>
              ))}
            </Input>
            <Input
              name="quantity"
              label="Serves"
              type="number"
              value={fields.quantity}
              onChange={update}
              min="1"
              step="1"
              placeholder="4"
              required
            />
          </div>
          <Input
            as="textarea"
            name="description"
            label="Description"
            value={fields.description}
            onChange={update}
            rows="4"
            minLength={12}
            placeholder="What is it? Mention ingredients or storage details."
            required
          />
          <div className="form-row">
            <Input
              name="location"
              label="Pickup location"
              value={fields.location}
              onChange={update}
              placeholder="Neighbourhood, city"
              required
            />
            <Input
              name="pickupWindow"
              label="Pickup window"
              value={fields.pickupWindow}
              onChange={update}
              placeholder="Today, 4:00-6:00 PM"
              required
            />
          </div>
          <Input
            as="textarea"
            name="images"
            label="Image URLs (one per line, up to five)"
            leading={<ImagePlus size={17} />}
            value={imageUrls}
            onChange={updateImages}
            rows={4}
            placeholder={
              'https://example.com/food.jpg\nhttps://example.com/food-2.jpg'
            }
            required
          />
          {imageList.length > 0 && (
            <div className="food-image-previews">
              {imageList.map((image, index) => (
                <img
                  className="form-image-preview"
                  key={`${image}-${index}`}
                  src={image}
                  alt={`Food listing preview ${index + 1}`}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="form-success">
              {edit ? 'Listing updated.' : 'Your food share has been posted.'}
            </p>
          )}
          <Button className="form-submit" type="submit" loading={saving}>
            <Save size={17} />{' '}
            {saving ? 'Saving…' : edit ? 'Save changes' : 'Publish food share'}
          </Button>
        </Card>
      </div>
    </main>
  );
}
