import { useEffect, useRef, useState } from "react";
import { adminAPI, authAPI, publicAPI } from "../../lib/api.js";
import { useDepartment } from "../../../department/DepartmentContext";

const PeopleManagement = () => {
  const { deptName } = useDepartment();
  const [user, setUser] = useState(null);
  const hasAutoOpenedRef = useRef(false);

  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);

  const emptyForm = {
    name: "",
    person_type: "Faculty",
    designation: "",
    email: "",
    phone: "",
    department: deptName,
    webpage: "",
    summary: "",
    research_areas: "",
    joining_date: "",
    bio: "",
    order: 0,
    profile_sections: [],
  };

  const [formData, setFormData] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [jsonText, setJsonText] = useState("[]");
  const [jsonError, setJsonError] = useState("");

  const mapFacultyProfileToPerson = (facultyData) => ({
    id: facultyData?.id ?? user?.facultyProfileId ?? null,
    slug: facultyData?.slug ?? "",
    name: facultyData?.name ?? user?.name ?? "",
    person_type: facultyData?.person_type ?? "Faculty",
    designation: facultyData?.designation ?? "",
    email: facultyData?.email ?? "",
    phone: facultyData?.phone ?? "",
    department: facultyData?.department ?? deptName,
    webpage: facultyData?.webpage ?? "",
    summary: facultyData?.summary ?? "",
    research_areas:
      facultyData?.research_areas ??
      facultyData?.researchArea ??
      facultyData?.research_area ??
      "",
    joining_date: facultyData?.joining_date ?? "",
    bio: facultyData?.bio ?? facultyData?.biography ?? "",
    order: facultyData?.order ?? 0,
    photo_path: facultyData?.photo_path ?? "",
    user_id: facultyData?.user_id ?? user?.id ?? null,
    profile_sections: Array.isArray(facultyData?.profile_sections)
      ? facultyData.profile_sections
      : [],
  });

  const fetchPeople = async (currentUser = user) => {
    try {
      setLoading(true);

      if (currentUser?.role === "faculty") {
        const slug = currentUser?.facultyProfile?.slug;

        if (!slug) {
          setPeople([]);
          return;
        }

        const res = await publicAPI.getPersonBySlug(slug);
        const facultyData = res?.data?.data || null;
        setPeople(facultyData ? [mapFacultyProfileToPerson(facultyData)] : []);
      } else {
        const res = await adminAPI.getPeople();
        setPeople(res.data.data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch people");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await authAPI.getMe();
        setUser(res.data.data);
      } catch (err) {
        console.error("User fetch failed:", err);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (user) fetchPeople(user);
  }, [user]);

  useEffect(() => {
    if (
      user?.role === "faculty" &&
      people.length === 1 &&
      !hasAutoOpenedRef.current
    ) {
      hasAutoOpenedRef.current = true;
      openModal(people[0]);
    }
  }, [user, people]);

  useEffect(() => {
    if (!showModal) return;

    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (jsonError) {
      alert("Fix JSON error first");
      return;
    }

    const data = new FormData();

    const profileSections = Array.isArray(formData.profile_sections)
      ? formData.profile_sections
      : [];

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "profile_sections") {
        data.append(key, JSON.stringify(profileSections));
      } else {
        data.append(key, value ?? "");
      }
    });

    if (photoFile) data.append("photo", photoFile);

    try {
      if (editingPerson) {
        await adminAPI.updatePerson(editingPerson.id, data);
        alert("Person updated successfully");
      } else {
        await adminAPI.createPerson(data);
        alert("Person created successfully");
      }

      await fetchPeople(user);
      closeModal();
    } catch (error) {
      console.error("Save error:", error);
      alert(error.response?.data?.error || "Failed to save person");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;

    try {
      await adminAPI.deletePerson(id);
      await fetchPeople(user);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  };

  const openModal = (person = null) => {
    if (person) {
      setEditingPerson(person);

      let sections = [];

      if (person.profile_sections) {
        if (typeof person.profile_sections === "string") {
          try {
            sections = JSON.parse(person.profile_sections);
          } catch {
            sections = [];
          }
        } else if (Array.isArray(person.profile_sections)) {
          sections = person.profile_sections;
        }
      }

      setFormData({
        ...emptyForm,
        ...person,
        joining_date: person.joining_date?.split("T")[0] || "",
        profile_sections: sections,
      });

      setJsonText(JSON.stringify(sections, null, 2));
    } else {
      setEditingPerson(null);
      setFormData(emptyForm);
      setJsonText("[]");
    }

    setPhotoFile(null);
    setJsonError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPerson(null);
    setFormData(emptyForm);
    setPhotoFile(null);
    setJsonText("[]");
    setJsonError("");
  };

  const handleJsonChange = (value) => {
    setJsonText(value);

    try {
      const parsed = JSON.parse(value);
      setFormData((prev) => ({ ...prev, profile_sections: parsed }));
      setJsonError("");
    } catch {
      setJsonError("Invalid JSON");
    }
  };

  const getSectionsCount = (person) => {
    if (!person.profile_sections) return 0;

    if (typeof person.profile_sections === "string") {
      try {
        const parsed = JSON.parse(person.profile_sections);
        return parsed.length || 0;
      } catch {
        return 0;
      }
    }

    if (Array.isArray(person.profile_sections)) {
      return person.profile_sections.length;
    }

    return 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-lnmiit-red" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {user?.role === "faculty" ? "Edit My Profile" : "People Management"}
        </h1>

        {user?.role !== "faculty" && (
          <button onClick={() => openModal()} className="btn-primary">
            Add Person
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Person Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Designation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sections
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {people.map((person) => {
              const sectionsCount = getSectionsCount(person);

              return (
                <tr key={person.id}>
                  <td className="px-6 py-4">
                    {person.photo_path ? (
                      <img
                        src={person.photo_path}
                        alt={person.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs">No Photo</span>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">{person.name}</td>
                  <td className="px-6 py-4">{person.person_type}</td>
                  <td className="px-6 py-4">{person.designation}</td>
                  <td className="px-6 py-4">{person.email}</td>

                  <td className="px-6 py-4">
                    {sectionsCount > 0
                      ? `${sectionsCount} sections`
                      : "No sections"}
                  </td>

                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => {
                        if (
                          user?.role === "faculty" &&
                          person.id !== user.facultyProfileId
                        ) {
                          alert("You can only edit your own profile");
                          return;
                        }

                        openModal(person);
                      }}
                      className="text-blue-600"
                    >
                      Edit
                    </button>

                    {user?.role !== "faculty" && !person.user_id && (
                      <button
                        onClick={async () => {
                          try {
                            const res = await adminAPI.createFacultyLogin(
                              person.id,
                            );
                            const { email, tempPassword } = res.data.data;

                            alert(
                              `Faculty login created successfully.\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\n\nPlease copy it now.`,
                            );

                            await fetchPeople(user);
                          } catch (err) {
                            alert(
                              err.response?.data?.error ||
                                "Failed to create faculty login",
                            );
                          }
                        }}
                        className="text-green-600"
                      >
                        Generate Login
                      </button>
                    )}

                    {user?.role !== "faculty" && (
                      <button
                        onClick={() => handleDelete(person.id)}
                        className="text-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {people.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan="7">
                  No people found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh] relative">
            <button
              type="button"
              onClick={closeModal}
              aria-label="Close modal"
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editingPerson ? "Edit Person" : "Add Person"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v })}
                required
              />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Person Type
                </label>
                <select
                  value={formData.person_type}
                  onChange={(e) =>
                    setFormData({ ...formData, person_type: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                  disabled={user?.role === "faculty"}
                >
                  <option value="Faculty">Faculty</option>
                  <option value="Staff">Staff</option>
                  <option value="Research Scholar">Research Scholar</option>
                  <option value="Alumni">Prominent Alumni</option>
                </select>
              </div>

              <Input
                label="Designation"
                value={formData.designation}
                onChange={(v) => setFormData({ ...formData, designation: v })}
              />

              <Input
                label="Email"
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
              />

              <Input
                label="Phone"
                value={formData.phone}
                onChange={(v) => setFormData({ ...formData, phone: v })}
              />

              <Input type="file" label="Photo" onFile={setPhotoFile} />

              <div>
                <label className="block text-sm font-medium mb-1">
                  Profile Sections (JSON)
                </label>
                <textarea
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className="w-full border rounded px-3 py-2 font-mono text-sm"
                  rows={8}
                />

                {jsonError && (
                  <p className="text-red-600 text-sm mt-1">{jsonError}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" className="btn-primary px-4 py-2 flex-1">
                  {editingPerson ? "Update" : "Create"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary px-4 py-2 flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleManagement;

const Input = ({ label, value, onChange, type = "text", onFile, required }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>

    {type === "file" ? (
      <input
        type="file"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
    ) : (
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded px-3 py-2"
        required={required}
      />
    )}
  </div>
);
