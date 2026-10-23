import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Moon,
  Plus,
  Sun,
  X,
} from 'lucide-react';
import Dropdown from '../UI/Dropdown';
import { usePlateShare } from '../../context/usePlateShare';

const publicLinks = [
  { name: 'Home', path: '/' },
  { name: 'Explore food', path: '/explore' },
  { name: 'Our mission', path: '/about' },
  { name: 'Help', path: '/help' },
];

const styles = `
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: color-mix(in srgb, var(--color-background) 94%, transparent);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(16px);
}
.navbar-container {
  width: min(1280px, calc(100% - 48px));
  min-height: 76px;
  margin-inline: auto;
  display: flex;
  align-items: center;
  gap: 32px;
}
.navbar-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  font-family: 'Manrope', sans-serif;
  font-size: 21px;
  font-weight: 800;
}
.navbar-logo-icon {
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  color: #fff;
  background: #246246;
  border-radius: 50%;
}
.logo-highlight { color: var(--color-primary); }
.navbar-links {
  display: flex;
  align-items: center;
  gap: 25px;
  width: 100%;
}
.navbar-link {
  color: var(--color-muted);
  font-size: 13px;
  font-weight: 700;
  transition: color 0.2s ease;
}
.navbar-link:hover,
.navbar-link.active { color: var(--color-primary); }
.navbar-contact { margin-left: auto; }
.navbar-auth { display: flex; align-items: center; gap: 20px; }
.navbar-login { color: var(--color-text); font-size: 13px; font-weight: 700; }
.navbar-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  color: #fff;
  background: #246246;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  transition: background 0.2s ease;
}
.navbar-cta:hover { background: #174b35; }
.theme-toggle,
.navbar-menu-button {
  display: grid;
  place-items: center;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  padding: 0;
  color: var(--color-text);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 50%;
}
.navbar-menu-button { display: none; border: 0; }
.profile-wrapper { position: relative; }
.profile-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 7px;
  color: var(--color-text);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 30px;
}
.profile-avatar { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.profile-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 110;
  width: 235px;
  padding: 9px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-soft);
}
.dropdown-heading {
  margin: 5px 8px 10px;
  overflow: hidden;
  color: var(--color-muted);
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  text-transform: uppercase;
}
.dropdown-link {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 9px;
  color: var(--color-text);
  background: transparent;
  border: 0;
  border-radius: 5px;
  font-size: 13px;
  text-align: left;
}
.dropdown-link:hover { color: var(--color-primary); background: var(--color-primary-soft); }
.logout-button {
  margin-top: 5px;
  border-top: 1px solid var(--color-border);
  border-radius: 0 0 5px 5px;
  color: #b84738;
}
@media (max-width: 860px) {
  .navbar-container { min-height: 68px; width: calc(100% - 32px); gap: 12px; }
  .navbar-menu-button { display: grid; margin-left: auto; }
  .navbar-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    align-items: stretch;
    flex-direction: column;
    gap: 0;
    padding: 10px 20px 22px;
    background: var(--color-background);
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-soft);
  }
  .navbar-links.is-open { display: flex; }
  .navbar-link { padding: 13px 4px; }
  .navbar-contact { margin-left: 0; }
  .navbar-auth {
    align-items: stretch;
    flex-direction: column;
    gap: 12px;
    padding-top: 15px;
    border-top: 1px solid var(--color-border);
  }
  .navbar-login { padding: 7px 0; text-align: center; }
  .navbar-cta { justify-content: center; }
  .profile-wrapper { padding-top: 12px; border-top: 1px solid var(--color-border); }
  .profile-dropdown { position: static; width: 100%; margin-top: 10px; box-shadow: none; }
}
`;

function Navbar() {
  const { user, logout, theme, setTheme } = usePlateShare();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{styles}</style>
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <span className="navbar-logo-icon">
              <Leaf size={23} />
            </span>
            <span>
              Plate<span className="logo-highlight">Share</span>
            </span>
          </Link>

          <button
            type="button"
            className="navbar-menu-button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
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
                onClick={closeMenu}
              >
                {link.name}
              </NavLink>
            ))}
            <Link
              to="/contact"
              className="navbar-link navbar-contact"
              onClick={closeMenu}
            >
              Contact
            </Link>
            <button
              type="button"
              className="theme-toggle"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {!user ? (
              <div className="navbar-auth">
                <Link to="/login" className="navbar-login" onClick={closeMenu}>
                  Log in
                </Link>
                <Link to="/register" className="navbar-cta" onClick={closeMenu}>
                  Join the table <span aria-hidden="true">↗</span>
                </Link>
              </div>
            ) : (
              <Dropdown
                className="profile-wrapper"
                menuClassName="profile-dropdown"
                trigger={({ open, toggle }) => (
                  <button
                    type="button"
                    className="profile-trigger"
                    aria-label="Open profile menu"
                    aria-expanded={open}
                    onClick={toggle}
                  >
                    <img
                      className="profile-avatar"
                      src={
                        user.photoURL ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=eaf4ec&color=287a4b`
                      }
                      alt=""
                    />
                    <ChevronDown size={16} />
                  </button>
                )}
              >
                {({ close }) => (
                  <>
                    <p className="dropdown-heading">{user.name}</p>
                    <Link to="/dashboard" className="dropdown-link">
                      <LayoutDashboard size={17} /> Dashboard
                    </Link>
                    <Link to="/add-food" className="dropdown-link">
                      <Plus size={17} /> Share food
                    </Link>
                    <Link to="/profile" className="dropdown-link">
                      <Leaf size={17} /> Profile
                    </Link>
                    <button
                      type="button"
                      className="dropdown-link logout-button"
                      onClick={() => {
                        close();
                        closeMenu();
                        logout();
                        navigate('/');
                      }}
                    >
                      <LogOut size={17} /> Logout
                    </button>
                  </>
                )}
              </Dropdown>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}

export default Navbar;
