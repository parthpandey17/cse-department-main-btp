import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../lib/api.js";
import { useDepartment } from "../../../department/DepartmentContext";

const Dashboard = () => {
  const { deptInfo, deptPath } = useDepartment();
  const [stats, setStats] = useState({
    sliders: 0, people: 0, programs: 0, news: 0,
    events: 0, achievements: 0, newsletters: 0, directory: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sliders, people, programs, news, events, achievements, newsletters, directory] =
          await Promise.all([
            adminAPI.getSliders(), adminAPI.getPeople(), adminAPI.getPrograms(),
            adminAPI.getNews(), adminAPI.getEvents(), adminAPI.getAchievements(),
            adminAPI.getNewsletters(), adminAPI.getDirectory(),
          ]);
        setStats({
          sliders: sliders.data.data.length, people: people.data.data.length,
          programs: programs.data.data.length, news: news.data.data.length,
          events: events.data.data.length, achievements: achievements.data.data.length,
          newsletters: newsletters.data.data.length, directory: directory.data.data.length,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { title: "Hero Sliders",     count: stats.sliders,      icon: "🖼️",  link: "/admin/sliders",      accent: "#3b82f6", bg: "rgba(59,130,246,0.08)"  },
    { title: "Faculty Members",  count: stats.people,       icon: "👥",  link: "/admin/people",       accent: "#10b981", bg: "rgba(16,185,129,0.08)"  },
    { title: "Programs",         count: stats.programs,     icon: "📚",  link: "/admin/programs",     accent: "#8b5cf6", bg: "rgba(139,92,246,0.08)"  },
    { title: "News Articles",    count: stats.news,         icon: "📰",  link: "/admin/news",         accent: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
    { title: "Events",           count: stats.events,       icon: "📅",  link: "/admin/events",       accent: "#ef4444", bg: "rgba(239,68,68,0.08)"   },
    { title: "Achievements",     count: stats.achievements, icon: "🏆",  link: "/admin/achievements", accent: "#6366f1", bg: "rgba(99,102,241,0.08)"  },
    { title: "Newsletters",      count: stats.newsletters,  icon: "📄",  link: "/admin/newsletters",  accent: "#ec4899", bg: "rgba(236,72,153,0.08)"  },
    { title: "Directory Entries",count: stats.directory,    icon: "📞",  link: "/admin/directory",    accent: "#14b8a6", bg: "rgba(20,184,166,0.08)"  },
  ];

  const quickActions = [
    { label: "Add News Article",   icon: "📰", link: "/admin/news"   },
    { label: "Add Event",          icon: "📅", link: "/admin/events"  },
    { label: "Add Faculty Member", icon: "👥", link: "/admin/people"  },
  ];

  const abbr = deptInfo?.abbr || "Dept";

  return (
    <div className="admin-dashboard">
      {/* Page header */}
      <div className="admin-dash-header">
        <div>
          <p className="admin-dash-eyebrow">Overview</p>
          <h1 className="admin-dash-title">{abbr} Dashboard</h1>
        </div>
        <div className="admin-dash-date">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="admin-dash-loading">
          <div className="admin-dash-spinner" />
          <span>Loading dashboard…</span>
        </div>
      ) : (
        <div className="admin-stat-grid">
          {cards.map((card) => (
            <Link key={card.title} to={deptPath(card.link)} className="admin-stat-card" style={{ "--card-accent": card.accent, "--card-bg": card.bg }}>
              <div className="admin-stat-card-top">
                <div className="admin-stat-icon-wrap">
                  <span className="admin-stat-icon">{card.icon}</span>
                </div>
                <div className="admin-stat-count">{card.count}</div>
              </div>
              <div className="admin-stat-label">{card.title}</div>
              <div className="admin-stat-arrow">View all →</div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <div className="admin-qa-header">
          <h2 className="admin-qa-title">Quick Actions</h2>
          <p className="admin-qa-sub">Jump straight to the most common tasks</p>
        </div>
        <div className="admin-qa-grid">
          {quickActions.map((a) => (
            <Link key={a.label} to={deptPath(a.link)} className="admin-qa-btn">
              <span className="admin-qa-btn-icon">{a.icon}</span>
              <span className="admin-qa-btn-label">{a.label}</span>
              <span className="admin-qa-btn-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;