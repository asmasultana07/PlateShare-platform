import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CircleHelp,
  HeartHandshake,
  Leaf,
  Mail,
  MapPin,
  Recycle,
  Sprout,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import { usePlateShare } from '../context/usePlateShare';
import { api } from '../services/api';

export function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="container">
          <p className="eyebrow">A neighbourly idea with a practical purpose</p>
          <h1>
            Food is better
            <br />
            when it <em>goes around.</em>
          </h1>
          <p>
            We help good food find its next table, through small local
            connections that make a meaningful difference.
          </p>
        </div>
      </section>
      <section className="section about-story">
        <div className="container about-story-grid">
          <div className="about-stamp">
            <Sprout size={54} />
            <span>
              LESS WASTE
              <br />
              MORE TABLE
            </span>
          </div>
          <div>
            <p className="eyebrow">Our mission</p>
            <h2>
              Make sharing
              <br />
              <em>the easy choice.</em>
            </h2>
            <p>
              Every day, perfectly good food is left unused while neighbours are
              looking for a little extra. PlateShare gives people a simple way
              to make that connection: list what you have, find what you need,
              and arrange a friendly handoff.
            </p>
            <p>
              We believe food sharing should feel local, practical, and
              welcoming. No perfect pantry required. Just a community willing to
              pass things along.
            </p>
          </div>
        </div>
      </section>
      <section className="about-values">
        <div className="container">
          <p className="eyebrow">The things we keep close</p>
          <div className="values-grid">
            <article>
              <Leaf size={22} />
              <h3>Local by nature</h3>
              <p>
                Food moves a shorter distance, and people get to know the
                neighbours around them.
              </p>
            </article>
            <article>
              <HeartHandshake size={22} />
              <h3>People first</h3>
              <p>
                Every person should be able to participate without judgement or
                fuss.
              </p>
            </article>
            <article>
              <Recycle size={22} />
              <h3>Waste less</h3>
              <p>
                Sharing surplus helps good food serve its purpose instead of
                going to waste.
              </p>
            </article>
          </div>
        </div>
      </section>
      <section className="closing-cta">
        <div className="container closing-content">
          <div>
            <p className="eyebrow">Make room at your table</p>
            <h2>Be part of the share.</h2>
          </div>
          <Link to="/register" className="button button-cream">
            Join PlateShare <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setError('');
    setSent(false);
    setSending(true);
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      await api('/contact', { method: 'POST', body: values });
      setSent(true);
      form.reset();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSending(false);
    }
  };
  return (
    <main className="form-page contact-page">
      <div className="container contact-layout">
        <div>
          <p className="eyebrow">We’re listening</p>
          <h1>
            Let’s have
            <br />
            <em>a chat.</em>
          </h1>
          <p className="section-intro">
            Questions, ideas, or a story about a share that made your day? Send
            us a note.
          </p>
          <div className="contact-info">
            <a href="mailto:hello@plateshare.org">
              <Mail size={18} /> hello@plateshare.org
            </a>
            <span>
              <MapPin size={18} /> Built for local communities
            </span>
          </div>
        </div>
        <Card as="form" className="standard-form card-form" onSubmit={submit}>
          <Input
            name="name"
            label="Your name"
            required
            minLength={2}
            placeholder="Name"
          />
          <Input
            name="email"
            label="Email address"
            type="email"
            required
            placeholder="you@example.com"
          />
          <Input
            as="textarea"
            name="message"
            label="What’s on your mind?"
            required
            minLength={10}
            rows={5}
            placeholder="Write your message"
          />
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {sent && (
            <p role="status" className="form-success">
              Thanks for reaching out. We’ll be in touch soon.
            </p>
          )}
          <Button className="form-submit" type="submit" loading={sending}>
            {sending ? 'Sending…' : 'Send your message'}{' '}
            <ArrowRight size={17} />
          </Button>
        </Card>
      </div>
    </main>
  );
}

const helpTopics = [
  [
    'How does PlateShare work?',
    'Browse available food, open a listing for the collection details, and send a request when you would like to receive it. If you have surplus food, create a listing from your dashboard so neighbours can find it.',
  ],
  [
    'Is sharing food free?',
    'Yes. PlateShare is a community-sharing service, so food listings and requests are free. Always agree on a safe collection time and place with the other person.',
  ],
  [
    'What should I include in a listing?',
    'Add a clear title, useful description, quantity, location, collection window, category, and a safe image. Mention ingredients, allergens, and storage details whenever they matter.',
  ],
  [
    'Can I edit or remove my listing?',
    'Yes. Open your dashboard to edit or remove listings that you own. Administrators can manage listings when moderation is needed.',
  ],
  [
    'What happens after I request food?',
    'The food owner sees your pending request and can accept or reject it. Use the listing details and messages to coordinate the handoff responsibly.',
  ],
];

export function Help() {
  return (
    <main className="help-page">
      <section className="about-hero help-hero">
        <div className="container">
          <p className="eyebrow">
            <CircleHelp size={16} /> A friendly guide to sharing
          </p>
          <h1>
            Help for a smoother
            <br />
            <em>food handoff.</em>
          </h1>
          <p>
            A few answers to help you list thoughtfully, request confidently,
            and keep every exchange neighbourly.
          </p>
        </div>
      </section>
      <section className="section faq-section">
        <div className="container faq-layout">
          <div>
            <p className="eyebrow">Questions, answered</p>
            <h2>
              Find your way
              <br />
              <em>around the table.</em>
            </h2>
            <p className="section-intro">
              Still unsure about something? Our contact form goes straight to
              the PlateShare team.
            </p>
            <Link to="/contact" className="text-link">
              Ask the team <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="faq-list">
            {helpTopics.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span>+</span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="closing-cta">
        <div className="container closing-content">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2>Find your next share.</h2>
          </div>
          <Button to="/explore" variant="cream">
            Explore food <ArrowUpRight size={18} />
          </Button>
        </div>
      </section>
    </main>
  );
}

export function Profile() {
  const { user, updateProfile, updatePassword } = usePlateShare();
  const [fields, setFields] = useState({
    name: user.name,
    email: user.email,
    photoURL: user.photoURL || '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (event) =>
    setFields((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const updatePasswordFields = (event) =>
    setPasswords((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const upload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 1500000) {
      setError('Choose an image smaller than 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFields((current) => ({ ...current, photoURL: String(reader.result) }));
      setError('');
    };
    reader.readAsDataURL(file);
  };
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (fields.name.trim().length < 2) {
      setError('Your name must contain at least 2 characters.');
      return;
    }
    if (
      passwords.newPassword &&
      (passwords.newPassword.length < 8 || !passwords.currentPassword)
    ) {
      setError(
        'Enter your current password and a new password with at least 8 characters.',
      );
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: fields.name.trim(),
        photoURL: fields.photoURL,
      });
      if (passwords.newPassword) await updatePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setMessage('Your profile has been updated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <main className="form-page">
      <div className="container narrow-container">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        <div className="form-page-heading">
          <p className="eyebrow">Your corner of the community</p>
          <h1>Make it yours.</h1>
          <p>
            Keep your profile up to date so neighbours know who they’re sharing
            with.
          </p>
        </div>
        <Card as="form" className="standard-form card-form" onSubmit={submit}>
          <Input
            name="photo"
            label="Profile photo"
            type="file"
            accept="image/*"
            onChange={upload}
          />
          {fields.photoURL && (
            <img
              className="profile-preview"
              src={fields.photoURL}
              alt="Your profile"
            />
          )}
          <Input
            name="name"
            label="Your name"
            value={fields.name}
            onChange={update}
            minLength={2}
            required
          />
          <Input
            name="email"
            label="Email address"
            value={fields.email}
            readOnly
          />
          <Input
            name="currentPassword"
            label="Current password"
            type="password"
            value={passwords.currentPassword}
            onChange={updatePasswordFields}
            autoComplete="current-password"
            placeholder="Only needed to change your password"
          />
          <Input
            name="newPassword"
            label="New password"
            type="password"
            value={passwords.newPassword}
            onChange={updatePasswordFields}
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="form-success">
              {message}
            </p>
          )}
          <Button className="form-submit" type="submit" loading={saving}>
            {saving ? 'Saving…' : 'Save profile'} <ArrowRight size={17} />
          </Button>
        </Card>
      </div>
    </main>
  );
}

export function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="not-found-page">
      <div
        className="not-found-image"
        role="img"
        aria-label="A table set with a shared meal"
      />
      <div className="not-found-copy">
        <p className="eyebrow">404 · Wrong table</p>
        <h1>
          This page isn’t
          <br />
          <em>on the menu.</em>
        </h1>
        <p>
          We couldn’t find what you were looking for. Let’s get you back to the
          good stuff.
        </p>
        <Button onClick={() => navigate('/')}>
          Back to home <ArrowLeft size={17} />
        </Button>
      </div>
    </main>
  );
}
