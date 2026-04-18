import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FacultyCard from "../components/FacultyCard.jsx";
import Loading from "../components/Loading.jsx";
import { publicAPI } from "../lib/api.js";
import SEO from "../components/SEO.jsx";
import { useDepartment } from "../../department/DepartmentContext";

const People = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { deptName, deptPath } = useDepartment();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    person_type: "",
    q: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const personType = params.get("person_type");

    if (!personType) {
      navigate(deptPath("/people?person_type=Faculty"), { replace: true });
      return;
    }

    setFilters((current) => ({
      ...current,
      person_type: personType,
    }));
  }, [deptPath, location.search, navigate]);

  useEffect(() => {
    const fetchPeople = async () => {
      setLoading(true);
      try {
        const res = await publicAPI.getPeople(filters);
        setPeople(res.data.data || []);
      } catch (error) {
        console.error("Error loading people", error);
      } finally {
        setLoading(false);
      }
    };

    if (filters.person_type) {
      fetchPeople();
    }
  }, [filters]);

  const processedPeople = useMemo(() => {
    if (!filters.person_type) return people;

    const filtered = people.filter((person) => person.person_type === filters.person_type);
    if (filters.person_type !== "Faculty") return filtered;

    const hod = filtered.filter((person) =>
      person.designation?.toLowerCase().includes("head"),
    );
    const professors = filtered.filter(
      (person) =>
        person.designation?.toLowerCase().includes("professor") &&
        !person.designation?.toLowerCase().includes("associate") &&
        !person.designation?.toLowerCase().includes("assistant") &&
        !person.designation?.toLowerCase().includes("head"),
    );
    const associate = filtered.filter((person) =>
      person.designation?.toLowerCase().includes("associate professor"),
    );
    const assistant = filtered.filter((person) =>
      person.designation?.toLowerCase().includes("assistant professor"),
    );
    const others = filtered.filter(
      (person) =>
        !person.designation?.toLowerCase().includes("professor") &&
        !person.designation?.toLowerCase().includes("associate") &&
        !person.designation?.toLowerCase().includes("assistant") &&
        !person.designation?.toLowerCase().includes("head"),
    );

    return [...hod, ...professors, ...associate, ...assistant, ...others];
  }, [filters.person_type, people]);

  const pageTitle = useMemo(() => {
    if (filters.person_type === "Faculty") return "Faculty Members";
    if (filters.person_type === "Staff") return "Staff Members";
    if (filters.person_type === "Research Scholar") return "Research Scholars";
    if (filters.person_type === "Alumni") return "Prominent Alumni";
    return "People";
  }, [filters.person_type]);

  if (loading) return <Loading />;

  return (
    <>
      <SEO
        title={`${pageTitle} | ${deptName} | LNMIIT Jaipur`}
        description={`Meet the ${pageTitle.toLowerCase()} of ${deptName} at LNMIIT Jaipur.`}
        canonical={deptPath("/people")}
      />

      <div className="container mx-auto px-4 py-10">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-4xl font-bold text-[#A6192E]">{pageTitle}</h1>
          <div className="mx-auto h-1 w-24 rounded-full bg-[#A6192E]" />
        </div>

        <div className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            value={filters.q}
            onChange={(event) =>
              setFilters({
                ...filters,
                q: event.target.value,
              })
            }
          />
        </div>

        {processedPeople.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {processedPeople.map((person) => (
              <FacultyCard key={person.id || person.slug} person={person} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white py-16 text-center shadow-sm">
            <p className="font-medium text-gray-700">No records found</p>
          </div>
        )}
      </div>
    </>
  );
};

export default People;
