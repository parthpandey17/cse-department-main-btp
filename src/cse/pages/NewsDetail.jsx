import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import Loading from "../components/Loading.jsx";
import PageWrapper from "../components/common/PageWrapper.jsx";
import { publicAPI } from "../lib/api.js";
import SEO from "../components/SEO.jsx";
import { useDepartment } from "../../department/DepartmentContext";

export default function NewsDetail() {
  const { id } = useParams();
  const { deptPath } = useDepartment();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await publicAPI.getNewsById(id);
        setNews(res.data?.data || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load news article.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchNews();
  }, [id]);

  if (loading) return <Loading />;

  if (error || !news) {
    return (
      <PageWrapper>
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Link to={deptPath("/news")} className="text-lnmiit-red hover:underline">
            ← Back to News
          </Link>
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error || "News article not found."}
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <SEO title={news.title} description={news.summary || news.title} />

      <article className="mx-auto max-w-4xl px-4 py-10">
        <Link
          to={deptPath("/news")}
          className="mb-8 inline-flex items-center text-lnmiit-red hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to News
        </Link>

        <h1 className="text-4xl font-bold text-gray-900">{news.title}</h1>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          {news.date ? new Date(news.date).toLocaleDateString("en-IN") : "Recent"}
        </div>

        {news.image_path && (
          <img
            src={news.image_path}
            alt={news.title}
            className="mt-8 max-h-[420px] w-full rounded-2xl object-cover"
          />
        )}

        {news.summary && (
          <p className="mt-8 text-lg leading-8 text-gray-700">{news.summary}</p>
        )}

        <div className="prose mt-8 max-w-none text-gray-800">
          {news.body || news.summary}
        </div>
      </article>
    </PageWrapper>
  );
}
