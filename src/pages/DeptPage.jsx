// src/pages/DeptPage.jsx
// ─────────────────────────────────────────────
// Improved department detail page with rich UI.
// ─────────────────────────────────────────────

import { DEPTS } from '../data/departments';
import Footer from '../components/Footer';

export default function DeptPage({ deptKey, setPage }) {
  const dept = DEPTS[deptKey];
  if (!dept) return null;

  const goHome = () => {
    setPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="dept-page page-enter"
      data-dept={dept.key}
      style={{
        '--dept-rgb': dept.colorRgb,
        '--dept-accent': dept.tagColor,
        '--dept-color': dept.color,
      }}
    >
      {/* ── Dept Hero ── */}
      <div className="dept-hero">
        <div className="dept-hero-noise" />
        <div
          className="dept-hero-glow"
          style={{
            background: `radial-gradient(ellipse 80% 70% at 100% 50%, rgba(${dept.colorRgb},0.18) 0%, transparent 65%),
                         radial-gradient(ellipse 60% 80% at 0% 100%, rgba(${dept.colorRgb},0.10) 0%, transparent 55%)`,
          }}
        />
        <div className="dept-hero-grid" />

        <div className="dept-hero-content">
          <button className="dept-back" onClick={goHome}>
            <span className="dept-back-arrow">←</span>
            <span>Back to Portal</span>
          </button>

          <div className="dept-hero-meta">
            <div
              className="dept-hero-badge"
              style={{
                color: dept.tagColor,
                background: `rgba(${dept.colorRgb},0.08)`,
                border: `1px solid rgba(${dept.colorRgb},0.25)`,
              }}
            >
              <span className="dept-hero-badge-icon">{dept.icon}</span>
              <span>{dept.abbr}</span>
              <span className="dept-hero-badge-sep">·</span>
              <span>Department</span>
            </div>
            <div className="dept-hero-tags">
              {dept.tags.map((tag, i) => (
                <span key={i} className="dept-hero-chip">{tag}</span>
              ))}
            </div>
          </div>

          <h1 className="dept-hero-title">{dept.name}</h1>
          <p className="dept-hero-desc">{dept.heroDesc}</p>

          <div className="dept-hero-stats">
            {dept.stats.map((s, i) => (
              <div key={i} className="dept-stat-block">
                <div className="dept-stat-num" style={{ color: dept.tagColor }}>{s.num}</div>
                <div className="dept-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="dept-hero-accent-bar"
          style={{ background: `linear-gradient(90deg, ${dept.color}, rgba(${dept.colorRgb},0.3))` }}
        />
      </div>

      {/* ── Main Content ── */}
      <div className="dept-content">

        {/* ── Section: Highlights ── */}
        <div className="dept-section">
          <div className="dept-section-header">
            <div className="dept-section-label" style={{ color: dept.tagColor, borderColor: `rgba(${dept.colorRgb},0.3)`, background: `rgba(${dept.colorRgb},0.07)` }}>
              Laboratories & Centres
            </div>
            <h2 className="dept-section-title">Our Research Infrastructure</h2>
            <p className="dept-section-desc">State-of-the-art labs and research centres powering the next generation of discoveries.</p>
          </div>

          <div className="highlights-grid">
            {dept.highlights.map((h, i) => (
              <div key={i} className="highlight-card">
                <div className="highlight-card-icon-wrap" style={{ background: `rgba(${dept.colorRgb},0.09)`, border: `1px solid rgba(${dept.colorRgb},0.18)` }}>
                  <span className="highlight-card-icon">{h.icon}</span>
                </div>
                <div className="highlight-card-body">
                  <h3 className="highlight-card-title">{h.title}</h3>
                  <p className="highlight-card-text">{h.text}</p>
                </div>
                <div className="highlight-card-stripe" style={{ background: `linear-gradient(180deg, rgba(${dept.colorRgb},0.85), rgba(${dept.colorRgb},0.15))` }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Section: Courses ── */}
        <div className="dept-section dept-section--alt">
          <div className="dept-section-header">
            <div className="dept-section-label" style={{ color: dept.tagColor, borderColor: `rgba(${dept.colorRgb},0.3)`, background: `rgba(${dept.colorRgb},0.07)` }}>
              Academics
            </div>
            <h2 className="dept-section-title">Core Curriculum</h2>
            <p className="dept-section-desc">A rigorous programme designed to build deep expertise and broad perspective.</p>
          </div>

          <div className="curriculum-list">
            {dept.courses.map((c, i) => (
              <div key={i} className="curriculum-row">
                <div className="curriculum-index" style={{ color: `rgba(${dept.colorRgb},0.45)` }}>{String(i + 1).padStart(2, '0')}</div>
                <div className="curriculum-code" style={{ color: dept.tagColor }}>{c.code}</div>
                <div className="curriculum-name">{c.name}</div>
                <div className="curriculum-credits">{c.credits}</div>
                <div className="curriculum-indicator" style={{ background: `rgba(${dept.colorRgb},0.65)` }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Section: Faculty ── */}
        <div className="dept-section">
          <div className="dept-section-header">
            <div className="dept-section-label" style={{ color: dept.tagColor, borderColor: `rgba(${dept.colorRgb},0.3)`, background: `rgba(${dept.colorRgb},0.07)` }}>
              People
            </div>
            <h2 className="dept-section-title">Faculty Members</h2>
            <p className="dept-section-desc">Award-winning researchers and dedicated educators shaping the discipline.</p>
          </div>

          <div className="faculty-grid-new">
            {dept.faculty.map((f, i) => (
              <div key={i} className="faculty-card-new">
                <div className="faculty-avatar-new" style={{ background: `linear-gradient(135deg, rgba(${dept.colorRgb},0.18) 0%, rgba(${dept.colorRgb},0.06) 100%)`, border: `2px solid rgba(${dept.colorRgb},0.2)`, color: dept.tagColor }}>
                  {f.initials}
                </div>
                <div className="faculty-info">
                  <div className="faculty-name-new">{f.name}</div>
                  <div className="faculty-role-new">{f.role}</div>
                </div>
                <div className="faculty-dept-dot" style={{ background: `rgba(${dept.colorRgb},0.7)` }} />
              </div>
            ))}
            <div className="faculty-card-cta">
              <div className="faculty-cta-icon">👥</div>
              <div className="faculty-cta-text">View all {dept.abbr} faculty members</div>
              <div className="faculty-cta-arrow">→</div>
            </div>
          </div>
        </div>

      </div>

      <Footer setPage={setPage} />
    </div>
  );
}