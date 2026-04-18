import { useEffect, useState } from "react";
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
        setUser(response.data.data);
      } catch (error) {
        navigate(deptPath("/admin/login"));
      }
    };

    checkAuth();
  }, [deptPath, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate(deptPath("/admin/login"));
  };

  const isActive = (path) => location.pathname === deptPath(path);

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
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

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-lnmiit-red" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <header className="fixed left-0 right-0 top-0 z-40 bg-white shadow-md">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-md p-2 hover:bg-gray-100 lg:hidden"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-lnmiit-red">
              LNMIIT {deptInfo?.abbr || deptName.toUpperCase()} Admin
            </h1>
            <Link
              to="/"
              className="hidden text-sm font-medium text-[#8B0000] hover:underline md:inline-flex"
            >
              ← Main Portal
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        <aside
          className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r bg-white shadow-md transition-transform duration-200 ease-in-out lg:static lg:h-auto lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="space-y-1 p-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={deptPath(item.path)}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center rounded-md px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-[#A6192E]/10 font-semibold text-[#A6192E] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-[#A6192E]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
