import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";
import { useDepartment } from "../../department/DepartmentContext";

export default function FacultyCard({ person }) {
  const { deptName, deptPath } = useDepartment();

  if (!person) return null;

  const slug =
    person.slug || person.name?.toLowerCase().trim().replace(/\s+/g, "-");

  return (
    <Link to={deptPath(`/people/${slug}`)}>
      <div className="mx-auto w-full max-w-xs cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex h-64 w-full items-center justify-center overflow-hidden bg-gray-100">
          {person.photo_path ? (
            <img
              src={person.photo_path}
              alt={`${person.name} - ${person.designation || "Faculty"}, ${deptName}, LNMIIT Jaipur`}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-300">
              <span className="text-4xl text-gray-600">👤</span>
            </div>
          )}
        </div>

        <div className="p-4 text-center">
          <h3 className="text-lg font-semibold leading-snug text-gray-900">
            {person.name}
          </h3>

          <p className="mt-1 text-sm font-medium leading-tight text-red-700">
            {person.designation || "Faculty Member"}
          </p>

          {person.email && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
              <Mail size={14} className="text-red-700" />
              <span className="truncate">{person.email}</span>
            </div>
          )}

          {person.department && (
            <div className="mt-1 flex items-center justify-center gap-2 text-xs text-gray-600">
              <MapPin size={14} className="text-red-700" />
              <span className="truncate">{person.department}</span>
            </div>
          )}

          {person.research_areas && (
            <p className="mt-3 line-clamp-2 text-xs text-gray-600">
              <span className="font-medium">Research:</span> {person.research_areas}
            </p>
          )}

          <button className="mt-4 w-full rounded-lg bg-red-700 py-2 text-sm font-medium text-white hover:bg-red-800">
            View Profile →
          </button>
        </div>
      </div>
    </Link>
  );
}
