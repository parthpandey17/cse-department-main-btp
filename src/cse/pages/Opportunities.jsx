import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { publicAPI } from "../lib/api.js";
import { useDepartment } from "../../department/DepartmentContext";

const GROUP_ORDER = ["faculty", "research", "non_academic", "general"];
const SECTION_TITLES = {
  faculty: "Faculty Positions",
  research: "Research Positions",
  non_academic: "Non-academic Positions",
  general: "Related Links & Notices",
};

export default function Opportunities() {
  const navigate = useNavigate();
  const { deptPath } = useDepartment();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await publicAPI.getOpportunities();
        setItems(response.data?.data || []);
      } catch (error) {
        console.error("Failed to load opportunities", error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  const grouped = useMemo(() => {
    const byGroup = {
      faculty: [],
      research: [],
      non_academic: [],
      general: [],
    };

    items.forEach((item) => {
      const group = byGroup[item.page_group] ? item.page_group : "general";
      byGroup[group].push(item);
    });

    return byGroup;
  }, [items]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-red-800" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-slate-50 px-4 py-10 md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-800/80">
            Opportunities
          </p>
          <h1 className="mt-3 text-4xl text-slate-900 md:text-5xl">Careers</h1>
          <div className="mt-6 h-px w-full bg-slate-900/90" />
        </div>

        <div className="space-y-16">
          {GROUP_ORDER.map((group) => {
            const groupItems = grouped[group];
            if (!groupItems?.length) return null;

            return (
              <section
                key={group}
                className="rounded-[28px] bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/70 md:p-8"
              >
                <div className="mb-8 flex items-center gap-3">
                  <span className="h-1.5 w-12 rounded-full bg-red-800" />
                  <h2 className="text-3xl text-slate-900 md:text-4xl">
                    {SECTION_TITLES[group]}
                  </h2>
                </div>

                <div className="grid gap-6">
                  {groupItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border bg-white p-6 shadow-sm">
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-2xl font-semibold text-slate-900">{item.title}</h3>
                          {item.subtitle && (
                            <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-red-800/80">
                              {item.subtitle}
                            </p>
                          )}
                          {item.description && (
                            <p className="mt-4 max-w-3xl leading-8 text-slate-700">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {item.cta_text && item.cta_url && (
                            <a
                              href={item.cta_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 rounded-full bg-red-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900"
                            >
                              <FileText size={16} />
                              {item.cta_text}
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => navigate(deptPath(`/opportunities/${item.id}`))}
                            className="inline-flex items-center gap-2 rounded-full border border-red-800 px-5 py-3 text-sm font-semibold text-red-800 transition hover:bg-red-800 hover:text-white"
                          >
                            View details
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
