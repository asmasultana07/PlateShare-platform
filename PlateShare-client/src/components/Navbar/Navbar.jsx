
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Leaf, Menu, X, ChevronDown,
  PlusCircle, Utensils, ClipboardList, LogOut, UserRound
} from 'lucide-react';
import './Navbar.css';

const publicLinks = [
  { name: 'Home', path: '/' },
  { name: 'Explore Foods', path: '/explore' },
];

const privateLinks = [
  { name: 'Add Food', path: '/add-food', icon: PlusCircle },
  { name: 'Manage My Foods', path: '/manage-foods', icon: Utensils },
  { name: 'My Food Requests', path: '/my-requests', icon: ClipboardList },
];

function Navbar() {
  // Demo state: JWT authentication add korle real user state use korbo.
  const isLoggedIn = false;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const closeMenus = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenus}>
          <span className="navbar-logo-icon"><Leaf size={23} /></span>
          <span>Plate<span className="logo-highlight">Share</span></span>
        </Link>

        <button
          type="button"
          className="navbar-menu-button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>

        <nav className={`navbar-links ${menuOpen ? 'is-open' : ''}`}>
          {publicLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMenus}
            >
              {link.name}
            </NavLink>
          ))}

          {!isLoggedIn ? (
            <Link
              to="/login"
              className="navbar-cta"
              onClick={closeMenus}
            >
              Login
            </Link>
          ) : (
            <div className="profile-wrapper">
              <button
                type="button"
                className="profile-trigger"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <img
                  className="profile-avatar"
                  src="https://ui-avatars.com/api/?name=Plate+Share&background=eaf4ec&color=287a4b"
                  alt=""
                />
                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <p className="dropdown-heading">My Account</p>

                  {privateLinks.map(({ name, path, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className="dropdown-link"
                      onClick={closeMenus}
                    >
                      <Icon size={17} />
                      {name}
                    </Link>
                  ))}

                  <button
                    type="button"
                    className="dropdown-link logout-button"
                    onClick={() => {
                      closeMenus();
                      // JWT logout logic pore add korbo.
                    }}
                  >
                    <LogOut size={17} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
