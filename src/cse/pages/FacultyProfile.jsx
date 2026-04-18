import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading";
import FacultySidebar from "../components/FacultySidebar";
import FacultyAccordion from "../components/FacultyAccordion";
import { publicAPI } from "../lib/api.js";
import SEO from "../components/SEO.jsx";
import { useDepartment } from "../../department/DepartmentContext";

export default function FacultyProfile() {
  const { slug } = useParams();
  const { deptName, deptPath } = useDepartment();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await publicAPI.getPersonBySlug(slug);
        setFaculty(res?.data?.data || null);
      } catch (err) {
        console.error("Faculty profile load failed:", err);
        setError("Failed to load faculty profile.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loading />
      </div>
    );
  }

  if (error || !faculty) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="font-medium text-red-700">
            {error || "Faculty profile not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${faculty.name} - ${faculty.designation} | ${deptName} | LNMIIT Jaipur`}
        description={`${faculty.name}, ${faculty.designation} at LNMIIT Jaipur. Research interests: ${faculty.research || "Not specified."}`}
        keywords={`${faculty.name}, ${faculty.research || ""}, ${deptName}, faculty`}
        canonical={deptPath(`/people/${faculty.slug}`)}
      />

      <div className="min-h-screen bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-4">
          <FacultySidebar faculty={faculty} />

          <main className="space-y-12 lg:col-span-3">
            {faculty.summary && (
              <section>
                <h1 className="mb-3 text-3xl font-bold lg:text-4xl">Summary</h1>
                <p className="whitespace-pre-line text-justify leading-relaxed text-gray-800">
                  {faculty.summary}
                </p>
              </section>
            )}

            {faculty.biography && (
              <section>
                <h2 className="mb-3 text-2xl font-bold lg:text-3xl">Biography</h2>
                <p className="whitespace-pre-line text-justify leading-relaxed text-gray-800">
                  {faculty.biography}
                </p>
              </section>
            )}

            {faculty.research_area && (
              <section>
                <h2 className="mb-3 text-2xl font-bold lg:text-3xl">Research Area</h2>
                <p className="leading-relaxed text-gray-800">{faculty.research_area}</p>
              </section>
            )}

            <div className="space-y-4">
              {Array.isArray(faculty.sections) && faculty.sections.length > 0 ? (
                faculty.sections.map((section, index) => (
                  <FacultyAccordion key={`${section.title}-${index}`} section={section} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No additional details available.</p>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
