import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Slider from "../components/Slider.jsx";
import NewsCard from "../components/NewsCard.jsx";
import EventCard from "../components/EventCard.jsx";
import AchievementCard from "../components/AchievementCard.jsx";
import Loading from "../components/Loading.jsx";
import SectionHeader from "../components/common/SectionHeader.jsx";
import PageWrapper from "../components/common/PageWrapper.jsx";
import { publicAPI } from "../lib/api.js";
import { useDepartment } from "../../department/DepartmentContext";

const Home = () => {
  const { deptName, deptPath } = useDepartment();
  const [sliders, setSliders] = useState([]);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [aboutInfo, setAboutInfo] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loading />;

  return (
    <PageWrapper noPadding>
      <div className="relative min-h-[75vh] w-full overflow-hidden md:min-h-[85vh]">
        <Slider slides={sliders} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/60 via-black/30 to-transparent px-4 text-center"
        >
          <div className="max-w-3xl rounded-3xl border border-white/30 bg-white/10 p-8 shadow-xl backdrop-blur-lg md:p-10">
            <motion.h1 className="text-4xl font-bold text-white md:text-6xl">
              Department of {deptName}
            </motion.h1>
            <motion.p className="mt-4 text-lg text-gray-200 md:text-xl">
              The LNM Institute of Information Technology, Jaipur
            </motion.p>
            <motion.div className="mt-8 inline-flex">
              <Link
                to={deptPath("/programs")}
                className="rounded-xl bg-gradient-to-r from-[#7D0F22] via-[#A6192E] to-[#C93030] px-6 py-3 font-semibold text-white shadow-lg"
              >
                Explore Our Programs →
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {aboutInfo && (
        <section className="container mx-auto px-4 py-20">
          <SectionHeader title={aboutInfo.title} />
          <motion.p className="mx-auto max-w-4xl text-justify text-lg leading-relaxed text-gray-700">
            {aboutInfo.body}
          </motion.p>
        </section>
      )}

      <section className="dept-highlight-strip py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 text-white sm:grid-cols-2 md:grid-cols-4">
            <div className="rounded-xl bg-white/10 p-6 text-center shadow-lg backdrop-blur-md">
              <h3 className="text-4xl font-bold">50+</h3>
              <p className="mt-2 text-sm uppercase tracking-wide">Faculty Members</p>
            </div>
            <div className="rounded-xl bg-white/10 p-6 text-center shadow-lg backdrop-blur-md">
              <h3 className="text-4xl font-bold">800+</h3>
              <p className="mt-2 text-sm uppercase tracking-wide">Students</p>
            </div>
            <div className="rounded-xl bg-white/10 p-6 text-center shadow-lg backdrop-blur-md">
              <h3 className="text-4xl font-bold">100+</h3>
              <p className="mt-2 text-sm uppercase tracking-wide">Research Publications</p>
            </div>
            <div className="rounded-xl bg-white/10 p-6 text-center shadow-lg backdrop-blur-md">
              <h3 className="text-4xl font-bold">95%</h3>
              <p className="mt-2 text-sm uppercase tracking-wide">Placement Rate</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="mb-10 text-center">
          <SectionHeader title="Latest News" />
          <Link to={deptPath("/news")} className="dept-link mt-2 inline-flex hover:underline">
            View All →
          </Link>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <SectionHeader title="Upcoming Events" />
            <Link to={deptPath("/events")} className="dept-link mt-2 inline-flex hover:underline">
              View All →
            </Link>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="mb-10 text-center">
          <SectionHeader title="Achievements" />
          <Link
            to={deptPath("/achievements")}
            className="dept-link mt-2 inline-flex hover:underline"
          >
            View All →
          </Link>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </section>
    </PageWrapper>
  );
};

export default Home;
