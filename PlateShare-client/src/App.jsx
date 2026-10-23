import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer';
import Loading from './components/UI/Loading';
import { PlateShareProvider } from './context/PlateShareContext';
import { usePlateShare } from './context/usePlateShare';
import './App.css';

const Home = lazy(() => import('./pages/Home/Home'));
const ExploreFoods = lazy(() => import('./pages/Explore/ExploreFoods'));
const FoodDetails = lazy(() => import('./pages/FoodDetails/FoodDetails'));
const Auth = lazy(() => import('./pages/Auth'));
const FoodForm = lazy(() => import('./pages/FoodForm'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const About = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.About })),
);
const Contact = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.Contact })),
);
const Help = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.Help })),
);
const NotFound = lazy(() =>
  import('./pages/StaticPages').then((module) => ({
    default: module.NotFound,
  })),
);
const Profile = lazy(() =>
  import('./pages/StaticPages').then((module) => ({ default: module.Profile })),
);

function ProtectedRoute({ children }) {
  const { user, authLoading } = usePlateShare();
  if (authLoading) return <Loading label="Checking your session…" />;
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <PlateShareProvider>
      <div className="app-shell">
        <Navbar />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExploreFoods />} />
            <Route path="/foods/:foodId" element={<FoodDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<Help />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-food"
              element={
                <ProtectedRoute>
                  <FoodForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-food/:foodId"
              element={
                <ProtectedRoute>
                  <FoodForm edit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </PlateShareProvider>
  );
}

export default App;
