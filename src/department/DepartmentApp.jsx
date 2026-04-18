import { Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "../cse/index.css";
import { DepartmentProvider } from "./DepartmentContext";
import { isSupportedDept } from "./paths";
import { setDept } from "../cse/lib/api";

import Navbar from "../cse/components/Navbar";
import Footer from "../cse/components/Footer";
import Home from "../cse/pages/Home";
import People from "../cse/pages/People";
import FacultyProfile from "../cse/pages/FacultyProfile";
import Programs from "../cse/pages/Programs";
import Newsletter from "../cse/pages/Newsletter";
import Achievements from "../cse/pages/Achievements";
import AchievementDetail from "../cse/pages/AchievementDetail";
import Events from "../cse/pages/Events";
import EventDetail from "../cse/pages/EventDetail";
import News from "../cse/pages/News";
import NewsDetail from "../cse/pages/NewsDetail";
import Directory from "../cse/pages/Directory";
import Research from "../cse/pages/Research";
import ResearchDetail from "../cse/pages/ResearchDetail";
import Facilities from "../cse/pages/Facilities";
import FacilityDetail from "../cse/pages/FacilityDetail";
import Opportunities from "../cse/pages/Opportunities";
import OpportunityDetail from "../cse/pages/OpportunityDetail";
import AdminLogin from "../cse/pages/Admin/Login";
import AdminLayout from "../cse/pages/Admin/Layout";
import Dashboard from "../cse/pages/Admin/Dashboard";
import SliderManagement from "../cse/pages/Admin/SliderManagement";
import PeopleManagement from "../cse/pages/Admin/PeopleManagement";
import ProgramsManagement from "../cse/pages/Admin/ProgramsManagement";
import NewsManagement from "../cse/pages/Admin/NewsManagement";
import EventsManagement from "../cse/pages/Admin/EventsManagement";
import AchievementsManagement from "../cse/pages/Admin/AchievementsManagement";
import NewsletterManagement from "../cse/pages/Admin/NewsletterManagement";
import DirectoryManagement from "../cse/pages/Admin/DirectoryManagement";
import InfoBlocksManagement from "../cse/pages/Admin/InfoBlocksManagement";
import ResearchManagement from "../cse/pages/Admin/ResearchManagement";
import FacilitiesManagement from "../cse/pages/Admin/FacilitiesManagement";
import OpportunitiesManagement from "../cse/pages/Admin/OpportunitiesManagement";

function DepartmentPublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default function DepartmentApp() {
  const { deptName } = useParams();

  if (!isSupportedDept(deptName)) {
    return <Navigate replace to="/" />;
  }

  setDept(deptName);

  return (
    <HelmetProvider>
      <DepartmentProvider deptName={deptName}>
        <Routes>
          <Route element={<DepartmentPublicLayout />}>
            <Route index element={<Home />} />
            <Route path="people" element={<People />} />
            <Route path="people/:slug" element={<FacultyProfile />} />
            <Route path="programs" element={<Programs />} />
            <Route path="research" element={<Research />} />
            <Route path="research/:id" element={<ResearchDetail />} />
            <Route path="facilities" element={<Facilities />} />
            <Route path="facilities/:id" element={<FacilityDetail />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="achievements" element={<Achievements />} />
            <Route
              path="achievements/students"
              element={<Achievements category="student" />}
            />
            <Route
              path="achievements/faculty"
              element={<Achievements category="faculty" />}
            />
            <Route path="achievements/:id" element={<AchievementDetail />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="news" element={<News />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="directory" element={<Directory />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="opportunities/:id" element={<OpportunityDetail />} />
          </Route>

          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="sliders" element={<SliderManagement />} />
            <Route path="people" element={<PeopleManagement />} />
            <Route path="programs" element={<ProgramsManagement />} />
            <Route path="research" element={<ResearchManagement />} />
            <Route path="facilities" element={<FacilitiesManagement />} />
            <Route path="news" element={<NewsManagement />} />
            <Route path="events" element={<EventsManagement />} />
            <Route path="achievements" element={<AchievementsManagement />} />
            <Route path="newsletters" element={<NewsletterManagement />} />
            <Route path="directory" element={<DirectoryManagement />} />
            <Route path="info-blocks" element={<InfoBlocksManagement />} />
            <Route path="opportunities" element={<OpportunitiesManagement />} />
          </Route>

          <Route path="*" element={<Navigate replace to="." />} />
        </Routes>
      </DepartmentProvider>
    </HelmetProvider>
  );
}