// src/components/Navbar.jsx
// ─────────────────────────────────────────────
// Sticky top navigation bar.
// Props:
//   page       – current active page key (string)
//   setPage    – function to navigate to a page
//   activeDept – dept key if a dept page is active, else null
// ─────────────────────────────────────────────

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEPTS } from '../data/departments';
import { getDepartmentBasePath } from '../department/paths';

const LOGO_URL = '/LNMIIT-Logo-Transperant-Background.png';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const page = location.pathname === '/about' ? 'about' : 'home';

  const navigateTo = (target) => {
    navigate(target);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <nav className="navbar">
        <div className="navbar-inner">

          {/* Logo */}
          <div className="nav-logo" onClick={() => navigateTo('/')}>
            <img
              src={LOGO_URL}
              alt="LNMIIT Logo"
              className="logo-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Desktop links */}
          <div className="nav-links">
            <button
              className={`nav-btn${page === 'home' ? ' active' : ''}`}
              onClick={() => navigateTo('/')}
            >
              Home
            </button>

            <button
              className={`nav-btn${page === 'about' ? ' active' : ''}`}
              onClick={() => navigateTo('/about')}
            >
              About LNMIIT
            </button>
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* ── Mobile slide-in nav ── */}
      <div className={`mobile-nav${menuOpen ? ' open' : ''}`}>
        <button className="nav-btn" onClick={() => navigateTo('/')}>
          Home
        </button>
        <button className="nav-btn" onClick={() => navigateTo('/about')}>
          About LNMIIT
        </button>
        {Object.values(DEPTS).map((d) => (
          <button
            key={d.key}
            className="nav-btn"
            style={{ color: '#ffcc02' }}
            onClick={() => navigateTo(getDepartmentBasePath(d.key))}
          >
            {d.icon} {d.abbr} Department
          </button>
        ))}
      </div>
    </>
  );
}
