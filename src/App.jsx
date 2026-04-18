import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import DepartmentApp from "./department/DepartmentApp";
import { SUPPORTED_DEPARTMENTS } from "./department/paths";

function LegacyDepartmentRedirect({ dept }) {
  const location = useLocation();
  const prefix = `/${dept}`;
  const suffix = location.pathname.startsWith(prefix)
    ? location.pathname.slice(prefix.length)
    : "";

  return (
    <Navigate
      replace
      to={`/department/${dept}${suffix}${location.search}${location.hash}`}
    />
  );
}

function PortalPage({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PortalPage>
              <HomePage />
            </PortalPage>
          }
        />
        <Route
          path="/about"
          element={
            <PortalPage>
              <AboutPage />
            </PortalPage>
          }
        />
        <Route path="/department/:deptName/*" element={<DepartmentApp />} />
        {SUPPORTED_DEPARTMENTS.map((dept) => (
          <Route
            key={dept}
            path={`/${dept}/*`}
            element={<LegacyDepartmentRedirect dept={dept} />}
          />
        ))}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
