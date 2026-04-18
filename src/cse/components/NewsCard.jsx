import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getImageUrl } from "../utils/imageUtils";
import { useDepartment } from "../../department/DepartmentContext";

const NewsCard = ({ news }) => {
  const { deptPath } = useDepartment();

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-[#A6192E]/25 hover:shadow-lg"
    >
      {news.image_path && (
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          <motion.img
            src={getImageUrl(news.image_path)}
            alt={news.title || "News image"}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.25 }}
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute right-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#A6192E] shadow-sm backdrop-blur-sm">
            {formatDate(news.date)}
          </div>
        </div>
      )}

      <div className="flex flex-grow flex-col p-6">
        <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-[#A6192E]">
          {news.title}
        </h3>

        {news.summary && (
          <p className="mb-4 line-clamp-3 flex-grow text-sm text-gray-600">
            {news.summary}
          </p>
        )}

        <Link
          to={deptPath(`/news/${news.id}`)}
          className="mt-auto inline-flex items-center"
          aria-label="Read full article"
        >
          <motion.span
            className="group/link inline-flex items-center text-sm font-medium text-[#A6192E] hover:text-[#7D0F22]"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 450, damping: 18 }}
          >
            Read Full Article
            <svg
              className="ml-1 h-4 w-4 transition-transform group-hover/link:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </motion.span>
        </Link>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#A6192E] via-[#7D0F22] to-[#A6192E] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </motion.div>
  );
};

export const NewsCardSkeleton = () => (
  <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
    <div className="relative aspect-[16/9] animate-pulse bg-gray-200">
      <div className="absolute right-4 top-4 h-6 w-24 animate-pulse rounded-full bg-gray-300" />
    </div>
    <div className="space-y-4 p-6">
      <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="space-y-2">
        <div className="h-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mt-4 h-4 w-1/4 animate-pulse rounded bg-gray-200" />
    </div>
  </div>
);

export default NewsCard;
