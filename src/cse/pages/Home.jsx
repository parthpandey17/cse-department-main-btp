import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Slider from "../components/Slider.jsx";
import NewsCard from "../components/NewsCard.jsx";
import EventCard from "../components/EventCard.jsx";
import AchievementCard from "../components/AchievementCard.jsx";
import Loading from "../components/Loading.jsx";
import PageWrapper from "../components/common/PageWrapper.jsx";
import { publicAPI } from "../lib/api.js";
import { useDepartment } from "../../department/DepartmentContext";

/* ── Reusable section heading ── */
const SectionHeading = ({ eyebrow, title, subtitle, linkTo, linkLabel }) => (
  <div className="home-section-heading">
    {eyebrow && <p className="home-eyebrow">{eyebrow}</p>}
    <h2 className="home-section-title">{title}</h2>
    {subtitle && <p className="home-section-subtitle">{subtitle}</p>}
    <div className="home-section-rule" />
    {linkTo && (
      <Link to={linkTo} className="home-view-all dept-link">
        {linkLabel || "View All"} →
      </Link>
    )}
  </div>
);

const stats = [
  { num: "50+",  label: "Faculty Members",       icon: "👨‍🏫" },
  { num: "800+", label: "Students",               icon: "🎓" },
  { num: "100+", label: "Research Publications",  icon: "📄" },
  { num: "95%",  label: "Placement Rate",         icon: "🏆" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: "easeOut", delay },
});

const Home = () => {
  const { deptName, deptPath } = useDepartment();
  const [sliders, setSliders]         = useState([]);
  const [news, setNews]               = useState([]);
  const [events, setEvents]           = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [aboutInfo, setAboutInfo]     = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidersRes, newsRes, eventsRes, achievementsRes, aboutRes] =
          await Promise.all([
            publicAPI.getSliders(),
            publicAPI.getNews({ published: 1, limit: 3 }),
            publicAPI.getEvents({ upcoming: 1, limit: 3 }),
            publicAPI.getAchievements({ limit: 3 }),
            publicAPI.getInfoBlock("about_department"),
          ]);
        setSliders(slidersRes?.data?.data || []);
        setNews(newsRes?.data?.data || []);
        setAchievements(achievementsRes?.data?.data || []);
        setAboutInfo(aboutRes?.data?.data || null);
        setEvents(Array.isArray(eventsRes?.data?.data) ? eventsRes.data.data : []);
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <PageWrapper noPadding>

      {/* ── HERO SLIDER ── */}
      <div className="home-hero">
        <Slider slides={sliders} />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="home-hero-overlay"
        >
          <div className="home-hero-glass">
            <p className="home-hero-eyebrow">The LNM Institute of Information Technology, Jaipur</p>
            <h1 className="home-hero-title">Department of<br />{deptName}</h1>
            <Link to={deptPath("/programs")} className="home-hero-cta">
              Explore Our Programs →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── ABOUT ── */}
      {aboutInfo && (
        <section className="home-section home-section--white">
          <div className="home-container">
            <SectionHeading eyebrow="Who We Are" title={aboutInfo.title} />
            <motion.p {...fadeUp(0.1)} className="home-about-body">
              {aboutInfo.body}
            </motion.p>
          </div>
        </section>
      )}

      {/* ── STATS ── */}
      <section className="home-stats-strip dept-highlight-strip">
        <div className="home-container">
          <div className="home-stats-grid">
            {stats.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)} className="home-stat-item">
                <span className="home-stat-icon">{s.icon}</span>
                <span className="home-stat-num">{s.num}</span>
                <span className="home-stat-label">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST NEWS ── */}
      {news.length > 0 && (
        <section className="home-section home-section--white">
          <div className="home-container">
            <SectionHeading
              eyebrow="Stay Updated"
              title="Latest News"
              subtitle="Recent highlights and announcements from the department."
              linkTo={deptPath("/news")}
              linkLabel="View All News"
            />
            <div className="home-cards-grid">
              {news.map((item, i) => (
                <motion.div key={item.id} {...fadeUp(i * 0.1)}>
                  <NewsCard news={item} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── UPCOMING EVENTS ── */}
      {events.length > 0 && (
        <section className="home-section home-section--gray">
          <div className="home-container">
            <SectionHeading
              eyebrow="Mark Your Calendar"
              title="Upcoming Events"
              subtitle="Conferences, workshops, and seminars happening at the department."
              linkTo={deptPath("/events")}
              linkLabel="View All Events"
            />
            <div className="home-cards-grid">
              {events.map((event, i) => (
                <motion.div key={event.id} {...fadeUp(i * 0.1)}>
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ACHIEVEMENTS ── */}
      {achievements.length > 0 && (
        <section className="home-section home-section--white">
          <div className="home-container">
            <SectionHeading
              eyebrow="Pride of the Department"
              title="Achievements"
              subtitle="Celebrating the milestones and accolades of our students and faculty."
              linkTo={deptPath("/achievements")}
              linkLabel="View All Achievements"
            />
            <div className="home-cards-grid">
              {achievements.map((a, i) => (
                <motion.div key={a.id} {...fadeUp(i * 0.1)}>
                  <AchievementCard achievement={a} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

    </PageWrapper>
  );
};

export default Home;