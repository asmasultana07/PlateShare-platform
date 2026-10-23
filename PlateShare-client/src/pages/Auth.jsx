import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Leaf,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import { usePlateShare } from '../context/usePlateShare';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Auth({ mode }) {
  const isRegister = mode === 'register';
  const { login, register, googleLogin } = usePlateShare();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const update = (event) =>
    setFields((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) ||
      fields.password.length < 8
    ) {
      setError(
        'Enter a valid email and a password with at least 8 characters.',
      );
      setLoading(false);
      return;
    }
    if (isRegister && fields.name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters).');
      setLoading(false);
      return;
    }

    try {
      if (isRegister)
        await register({
          name: fields.name.trim(),
          email: fields.email.trim(),
          password: fields.password,
        });
      else
        await login({ email: fields.email.trim(), password: fields.password });
      setSuccess(
        isRegister
          ? 'Your account is ready. Opening your dashboard…'
          : 'You are signed in. Opening your dashboard…',
      );
      window.setTimeout(() => navigate('/dashboard'), 900);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const submitGoogleLogin = async (response) => {
    if (!response.credential) {
      setError('Google did not return a sign-in credential.');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await googleLogin(response.credential);
      setSuccess('Google sign-in successful. Opening your dashboard…');
      window.setTimeout(() => navigate('/dashboard'), 900);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () =>
    setFields({
      name: 'Demo Neighbour',
      email: 'demo@plateshare.local',
      password: 'plateshare-demo',
    });

  return (
    <main className="auth-page">
      <div className="auth-image">
        <div className="auth-image-caption">
          <span>
            <Leaf size={17} /> A table with room for everyone
          </span>
          <p>
            When good food travels,
            <br />
            good things happen.
          </p>
        </div>
      </div>
      <section className="auth-panel">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back home
        </Link>
        <div className="auth-form-wrap">
          <p className="eyebrow">
            {isRegister ? 'Come on in' : 'Welcome back'}
          </p>
          <h1>{isRegister ? 'Pull up a chair.' : 'Good to see you.'}</h1>
          <p className="auth-intro">
            {isRegister
              ? 'Join your neighbours in sharing more and wasting less.'
              : 'Sign in to share food, make a request, or check your dashboard.'}
          </p>
          <form className="standard-form" onSubmit={submit} noValidate>
            {isRegister && (
              <Input
                name="name"
                label="Full name"
                leading={<UserRound size={17} />}
                autoComplete="name"
                value={fields.name}
                onChange={update}
                placeholder="Your name"
                required
                minLength={2}
              />
            )}
            <Input
              name="email"
              label="Email address"
              leading={<Mail size={17} />}
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={update}
              placeholder="you@example.com"
              required
            />
            <Input
              name="password"
              label="Password"
              leading={<LockKeyhole size={17} />}
              type={showPassword ? 'text' : 'password'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={fields.password}
              onChange={update}
              placeholder="At least 8 characters"
              required
              minLength={8}
              trailing={
                <Button
                  className="password-toggle"
                  variant="text"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              }
            />
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="form-success" role="status">
                {success}
              </p>
            )}
            <Button className="form-submit" type="submit" loading={loading}>
              {loading
                ? 'Please wait…'
                : isRegister
                  ? 'Create my account'
                  : 'Log in'}{' '}
              <ArrowRight size={17} />
            </Button>
          </form>
          {googleClientId && (
            <div className="google-login">
              <span>or continue with</span>
              <GoogleLogin
                onSuccess={submitGoogleLogin}
                onError={() => setError('Google sign-in could not be started.')}
                useOneTap={false}
              />
            </div>
          )}
          {!isRegister && (
            <div className="demo-login">
              <span>Need a quick start? Fill the demo credentials.</span>
              <Button variant="text" type="button" onClick={fillDemo}>
                Fill demo details
              </Button>
            </div>
          )}
          <p className="auth-switch">
            {isRegister ? 'Already part of the table?' : 'New to PlateShare?'}{' '}
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Log in' : 'Create an account'}
            </Link>
          </p>
          <p className="demo-notice">
            Create the demo account once using Register, then use these details
            to sign in. The server checks every login.
          </p>
        </div>
      </section>
    </main>
  );
}
