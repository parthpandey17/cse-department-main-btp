import axios from "axios";
import { buildDepartmentPath } from "../../department/paths";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3022";

let currentDept = "cse";

export const setDept = (dept) => {
  currentDept = dept || "cse";
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (!config.url.startsWith("/api/")) {
    config.url = `/api/${currentDept}${config.url}`;
  }

  try {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {}

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem("token");
      } catch (storageError) {}

      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = buildDepartmentPath(currentDept, "/admin/login");
      }
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (email, password) => api.post("/api/auth/login", { email, password }),
  getMe: () => api.get("/api/auth/me"),
  changePassword: (password) =>
    api.post("/api/auth/change-password", { password }),
};

export const publicAPI = {
  getSliders: (params) => api.get("/public/sliders", { params }),
  getPeople: (params) => api.get("/public/people", { params }),
  getPersonBySlug: (slug) =>
    api.get(`/public/people/${encodeURIComponent(slug)}`),
  getPrograms: (params) => api.get("/public/programs", { params }),
  getProgramDetails: (id) => api.get(`/public/programs/${id}`),
  getNews: (params) => api.get("/public/news", { params }),
  getNewsById: (id) => api.get(`/public/news/${id}`),
  getEvents: (params) => api.get("/public/events", { params }),
  getEventById: (id) => api.get(`/public/events/${id}`),
  getAchievements: (params) => api.get("/public/achievements", { params }),
  getAchievementById: (id) => api.get(`/public/achievements/${id}`),
  getNewsletters: (params) => api.get("/public/newsletters", { params }),
  getDirectory: () => api.get("/public/directory"),
  getInfoBlock: (key) => api.get(`/public/info/${encodeURIComponent(key)}`),
  getResearch: (params) => api.get("/public/research", { params }),
  getResearchById: (id) => api.get(`/public/research/${id}`),
  getFacilities: (params) => api.get("/public/facilities", { params }),
  getFacilityById: (id) => api.get(`/public/facilities/${id}`),
  getOpportunities: (params) => api.get("/public/opportunities", { params }),
  getOpportunityById: (id) => api.get(`/public/opportunities/${id}`),
};

export const adminAPI = {
  getSliders: (params) => api.get("/admin/sliders", { params }),
  createSlider: (fd) =>
    api.post("/admin/sliders", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateSlider: (id, fd) =>
    api.put(`/admin/sliders/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteSlider: (id) => api.delete(`/admin/sliders/${id}`),

  getPeople: (params) => api.get("/admin/people", { params }),
  createPerson: (fd) =>
    api.post("/admin/people", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updatePerson: (id, fd) =>
    api.put(`/admin/people/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deletePerson: (id) => api.delete(`/admin/people/${id}`),
  createFacultyLogin: (personId) =>
    api.post(`/admin/people/${personId}/create-login`),

  getPrograms: () => api.get("/admin/programs"),
  createProgram: (fd) =>
    api.post("/admin/programs", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateProgram: (id, fd) =>
    api.put(`/admin/programs/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteProgram: (id) => api.delete(`/admin/programs/${id}`),

  getProgramSections: (programId) => api.get(`/admin/programs/${programId}/sections`),
  createProgramSection: (programId, data) =>
    api.post(`/admin/programs/${programId}/sections`, data),
  updateProgramSection: (sectionId, data) =>
    api.put(`/admin/programs/sections/${sectionId}`, data),
  deleteProgramSection: (sectionId) =>
    api.delete(`/admin/programs/sections/${sectionId}`),

  createSemester: (sectionId, data) =>
    api.post(`/admin/programs/sections/${sectionId}/semesters`, data),
  deleteSemester: (semesterId) => api.delete(`/admin/programs/semesters/${semesterId}`),
  createCourse: (semesterId, data) =>
    api.post(`/admin/programs/semesters/${semesterId}/courses`, data),
  updateCourse: (courseId, data) =>
    api.put(`/admin/programs/courses/${courseId}`, data),
  deleteCourse: (courseId) => api.delete(`/admin/programs/courses/${courseId}`),

  createOutcome: (sectionId, data) =>
    api.post(`/admin/programs/sections/${sectionId}/outcomes`, data),
  updateOutcome: (outcomeId, data) =>
    api.put(`/admin/programs/outcomes/${outcomeId}`, data),
  deleteOutcome: (outcomeId) => api.delete(`/admin/programs/outcomes/${outcomeId}`),

  saveSectionContent: (data) => api.post("/admin/programs/sections/content", data),
  getProgramDetailsAdmin: (programId) => api.get(`/admin/programs/${programId}`),
  uploadEditorImage: (fd) =>
    api.post("/admin/upload-editor-image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getNews: () => api.get("/admin/news"),
  createNews: (fd) =>
    api.post("/admin/news", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateNews: (id, fd) =>
    api.put(`/admin/news/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteNews: (id) => api.delete(`/admin/news/${id}`),

  getEvents: () => api.get("/admin/events"),
  createEvent: (fd) =>
    api.post("/admin/events", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateEvent: (id, fd) =>
    api.put(`/admin/events/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteEvent: (id) => api.delete(`/admin/events/${id}`),

  getAchievements: () => api.get("/admin/achievements"),
  createAchievement: (fd) =>
    api.post("/admin/achievements", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateAchievement: (id, fd) =>
    api.put(`/admin/achievements/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteAchievement: (id) => api.delete(`/admin/achievements/${id}`),

  getNewsletters: () => api.get("/admin/newsletters"),
  createNewsletter: (fd) =>
    api.post("/admin/newsletters", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateNewsletter: (id, fd) =>
    api.put(`/admin/newsletters/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteNewsletter: (id) => api.delete(`/admin/newsletters/${id}`),

  getDirectory: () => api.get("/admin/directory"),
  createDirectoryEntry: (data) => api.post("/admin/directory", data),
  updateDirectoryEntry: (id, data) => api.put(`/admin/directory/${id}`, data),
  deleteDirectoryEntry: (id) => api.delete(`/admin/directory/${id}`),

  getInfoBlocks: () => api.get("/admin/info-blocks"),
  createInfoBlock: (fd) =>
    api.post("/admin/info-blocks", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateInfoBlock: (id, fd) =>
    api.put(`/admin/info-blocks/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteInfoBlock: (id) => api.delete(`/admin/info-blocks/${id}`),

  getResearch: () => api.get("/admin/research"),
  createResearch: (fd) =>
    api.post("/admin/research", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateResearch: (id, fd) =>
    api.put(`/admin/research/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteResearch: (id) => api.delete(`/admin/research/${id}`),

  getFacilities: () => api.get("/admin/facilities"),
  createFacility: (fd) =>
    api.post("/admin/facilities", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateFacility: (id, fd) =>
    api.put(`/admin/facilities/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteFacility: (id) => api.delete(`/admin/facilities/${id}`),

  getOpportunities: () => api.get("/admin/opportunities"),
  createOpportunity: (fd) =>
    api.post("/admin/opportunities", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateOpportunity: (id, fd) =>
    api.put(`/admin/opportunities/${id}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteOpportunity: (id) => api.delete(`/admin/opportunities/${id}`),
};

export default api;
