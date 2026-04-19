import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../lib/api.js";
import { useDepartment } from "../../../department/DepartmentContext";

const Login = () => {
  const navigate = useNavigate();
  const { deptInfo, deptName, deptPath } = useDepartment();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    portal: "admin",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(formData.email, formData.password);
      const { token, user } = response.data.data;

      if (formData.portal === "admin" && user.role === "faculty") {
        setError("Please login using Faculty portal");
        return;
      }

      if (formData.portal === "faculty" && user.role !== "faculty") {
        setError("This account is not a faculty account");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.mustChangePassword) {
        navigate(deptPath("/admin/change-password"));
        return;
      }

      if (user.role === "faculty") {
        navigate(deptPath(`/admin/people/${user.facultyProfileId}`));
      } else {
        navigate(deptPath("/admin"));
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lnmiit-red text-2xl font-bold text-white">
              LNMIIT
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
            <p className="mt-2 text-gray-600">
              {deptInfo?.abbr || deptName} Department Portal
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Login As
              </label>
              <select
                name="portal"
                value={formData.portal}
                onChange={handleChange}
                className="input-field"
              >
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="admin@lnmiit.ac.in"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Default credentials for testing:</p>
            <p className="font-mono">admin@lnmiit.ac.in / Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
