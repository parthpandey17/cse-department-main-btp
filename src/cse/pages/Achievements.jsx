import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import AchievementCard from "../components/AchievementCard.jsx";
import Loading from "../components/Loading.jsx";
import SectionHeader from "../components/common/SectionHeader.jsx";
import PageWrapper from "../components/common/PageWrapper.jsx";
import { publicAPI } from "../lib/api.js";
import { useDepartment } from "../../department/DepartmentContext";

const Achievements = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { deptPath } = useDepartment();
  const [category, setCategory] = useState("student");
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    setCategory(cat === "faculty" ? "faculty" : "student");
  }, [location.search]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const res = await publicAPI.getAchievements({ category });
        setAchievements(res.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [category]);

  return (
    <PageWrapper>
      <section className="container mx-auto px-4 pb-16">
        <SectionHeader title="Achievements" />

        <div className="mt-8 mb-10 flex justify-center gap-4">
          {["student", "faculty"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                navigate(deptPath(`/achievements?category=${cat}`));
              }}
              className={`rounded-full border px-6 py-2 text-sm font-medium transition-all ${
                category === cat
                  ? "border-[#A6192E] bg-[#A6192E] text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {cat === "student" ? "Student Achievements" : "Faculty Achievements"}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : achievements.length > 0 ? (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </motion.div>
        ) : (
          <p className="mt-12 text-center text-gray-500">No achievements found.</p>
        )}
      </section>
    </PageWrapper>
  );
};

export default Achievements;
