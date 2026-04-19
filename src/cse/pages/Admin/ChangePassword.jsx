import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../lib/api.js";
import { useDepartment } from "../../../department/DepartmentContext";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { deptPath } = useDepartment();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await authAPI.changePassword(formData.password);

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      storedUser.mustChangePassword = false;
      localStorage.setItem("user", JSON.stringify(storedUser));

      navigate(deptPath("/admin"));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-2 text-2xl font-bold">Change Password</h2>
        <p className="mb-6 text-gray-600">
          You must change your password before continuing.
        </p>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New password"
            className="input-field"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            className="input-field"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
