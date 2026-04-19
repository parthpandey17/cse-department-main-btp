import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authAPI } from "../../lib/api.js";
import { useDepartment } from "../../../department/DepartmentContext";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { deptInfo, deptName, deptPath } = useDepartment();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getMe();
        const me = response.data.data;
        setUser(me);

        if (me?.role === "faculty") {
          if (me.mustChangePassword) {
            if (location.pathname !== deptPath("/admin/change-password")) {
              navigate(deptPath("/admin/change-password"), { replace: true });
            }
            return;
          }

          const allowedPath = me.facultyProfileId
            ? deptPath(`/admin/people/${me.facultyProfileId}`)
            : deptPath("/admin");

          const isDashboard = location.pathname === deptPath("/admin");
          const isAllowedProfile =
            location.pathname === allowedPath ||
            location.pathname.startsWith(`${allowedPath}/`);

          if (location.pathname === deptPath("/admin/people")) {
            navigate(allowedPath, { replace: true });
            return;
          }

          if (
            location.pathname.startsWith(deptPath("/admin")) &&
            !isDashboard &&
            !isAllowedProfile
          ) {
            navigate(allowedPath, { replace: true });
          }
        }
      } catch (error) {
        navigate(deptPath("/admin/login"));
      }
    };

    checkAuth();
  }, [deptPath, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate(deptPath("/admin/login"));
  };

  const isActive = (path) => location.pathname === deptPath(path);

  const menuItems = useMemo(() => {
    const baseItems = [{ path: "/admin", label: "Dashboard", icon: "📊" }];

    if (user?.role === "faculty") {
      return [
        ...baseItems,
        {
          path: user.facultyProfileId
            ? `/admin/people/${user.facultyProfileId}`
            : "/admin/people",
          label: "Edit My Profile",
          icon: "👤",
        },
      ];
    }

    return [
      ...baseItems,
      { path: "/admin/sliders", label: "Hero Sliders", icon: "🖼️" },
      { path: "/admin/people", label: "Faculty", icon: "👥" },
      { path: "/admin/programs", label: "Programs", icon: "📚" },
      { path: "/admin/news", label: "News", icon: "📰" },
      { path: "/admin/events", label: "Events", icon: "📅" },
      { path: "/admin/achievements", label: "Achievements", icon: "🏆" },
      { path: "/admin/newsletters", label: "Newsletters", icon: "📄" },
      { path: "/admin/directory", label: "Directory", icon: "📞" },
      { path: "/admin/info-blocks", label: "Info Blocks", icon: "📝" },
      { path: "/admin/research", label: "Research", icon: "🔬" },
      { path: "/admin/facilities", label: "Facilities", icon: "🏢" },
      { path: "/admin/opportunities", label: "Opportunities", icon: "💼" },
    ];
  }, [user]);

  if (!user) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-dash-spinner" />
      </div>
    );
  }

  const abbr = deptInfo?.abbr || deptName.toUpperCase();

  return (
    <div className="admin-shell">
      {/* ── Top bar ── */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="admin-topbar-brand">
            <span className="admin-topbar-badge">{abbr}</span>
            <span className="admin-topbar-title">Admin Panel</span>
          </div>
          <Link to="/" className="admin-topbar-portal-link">
            ← Main Portal
          </Link>
        </div>
        <div className="admin-topbar-right">
          <div className="admin-topbar-user">
            <div className="admin-user-avatar">
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <span className="admin-user-name">{user.name}</span>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="admin-body">
        {/* ── Sidebar ── */}
        <aside
          className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`}
        >
          <div className="admin-sidebar-inner">
            <div className="admin-sidebar-section-label">Content</div>
            <nav className="admin-nav">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={deptPath(item.path)}
                  onClick={() => setSidebarOpen(false)}
                  className={`admin-nav-item ${isActive(item.path) ? "admin-nav-item--active" : ""}`}
                >
                  <span className="admin-nav-icon">{item.icon}</span>
                  <span className="admin-nav-label">{item.label}</span>
                  {isActive(item.path) && <span className="admin-nav-pip" />}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Overlay ── */}
        {sidebarOpen && (
          <div
            className="admin-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main ── */}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
