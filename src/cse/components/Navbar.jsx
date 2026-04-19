import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaBars,
  FaChevronDown,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTimes,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import logo from "../assets/images/lnmiit_transparent_logo.png";
import { useDepartment } from "../../department/DepartmentContext";

const Navbar = () => {
  const location = useLocation();
  const { deptInfo, deptName, deptPath } = useDepartment();
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setOpenDropdown(null);
    setActiveDropdown(null);
  }, [location.pathname]);

  const isActive = (path) => {
    if (!path) return false;
    const fullPath = deptPath(path);
    if (path === "/") return location.pathname === fullPath;
    return location.pathname === fullPath || location.pathname.startsWith(`${fullPath}/`);
  };
  const toDeptPath = (path) => (path ? deptPath(path) : "#");
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const navLinks = [
    { id: "home", label: "Home", path: "/" },
    {
      id: "people",
      label: "People",
      path: "/people",
      dropdown: [
        { label: "Faculty", path: "/people?person_type=Faculty" },
        {
          label: "Staff",
          path: "/people?person_type=Staff",
          dropdown: [
            {
              label: "Research Scholars",
              path: "/people?person_type=Research Scholar",
            },
          ],
        },
        { label: "Prominent Alumni", path: "/people?person_type=Alumni" },
      ],
    },
    {
      id: "programs",
      label: "Programs",
      path: "/programs",
      dropdown: [
        { label: "Bachelors Programmes", path: "/programs#bachelors" },
        { label: "Masters Programmes", path: "/programs#masters" },
        { label: "Doctoral Programmes", path: "/programs#doctoral" },
      ],
    },
    {
      id: "research",
      label: "Research",
      path: "/research",
      dropdown: [
        { label: "Research Publications", path: "/research?type=Publication" },
        { label: "Research Projects", path: "/research?type=Project" },
        { label: "Patents", path: "/research?type=Patent" },
        { label: "Collaborations", path: "/research?type=Collaboration" },
      ],
    },
    {
      id: "facilities",
      label: "Facilities",
      path: "/facilities",
      dropdown: [
        { label: "Laboratories", path: "/facilities?category=Laboratory" },
        { label: "Infrastructure", path: "/facilities?category=Infrastructure" },
        { label: "Equipment", path: "/facilities?category=Equipment" },
        { label: "Software", path: "/facilities?category=Software" },
      ],
    },
    {
      id: "events",
      label: "Events",
      path: "/events",
    },
    {
      id: "more",
      label: "Others",
      dropdown: [
        { label: "News", path: "/news" },
        {
          label: "Achievements",
          dropdown: [
            { label: "Student Achievements", path: "/achievements?category=student" },
            { label: "Faculty Achievements", path: "/achievements?category=faculty" },
          ],
        },
        { label: "Newsletter", path: "/newsletter" },
        { label: "Departmental Directory", path: "/directory" },
        { label: "Opportunities", path: "/opportunities" },
        { label: "Admin Panel", path: "/admin/login" },
      ],
    },
  ];

  return (
    <>
      <div className="dept-topbar text-white">
        <div className="dept-topbar-inner container mx-auto px-4 py-2.5">
          <div className="flex flex-col items-center justify-between gap-3 text-sm sm:flex-row sm:gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <a className="dept-topbar-link" href="tel:01412688090">0141 268 8090</a>
              <a className="dept-topbar-link" href="mailto:info.lnmiit@lnmiit.ac.in">info.lnmiit@lnmiit.ac.in</a>
            </div>

            <div className="flex gap-2 text-lg">
              <span className="dept-social-icon"><FaInstagram /></span>
              <span className="dept-social-icon"><FaYoutube /></span>
              <span className="dept-social-icon"><FaFacebookF /></span>
              <span className="dept-social-icon"><FaTwitter /></span>
              <span className="dept-social-icon"><FaLinkedinIn /></span>
            </div>
          </div>
        </div>
      </div>

      <nav
        className={`dept-navbar sticky top-0 z-50 transition-shadow ${
          isScrolled ? "shadow-lg" : "shadow-md"
        }`}
      >
        <div className="dept-navbar-inner flex items-center justify-between px-4 py-3 sm:px-6 lg:py-4">
          <div className="hidden min-w-[240px] sm:block">
            <div className="dept-heading text-lg font-bold dept-text-primary">{deptName}</div>
            <div className="text-sm text-gray-600">
              The LNM Institute of Information Technology
            </div>
            <Link
              to="/"
              className="dept-back-link mt-2 inline-flex items-center text-sm font-medium dept-text-primary hover:underline"
            >
              ← Back to Main Portal
            </Link>
          </div>

          <div className="relative hidden items-center gap-1 lg:flex">
            {navLinks.map(({ id, path, label, dropdown }) => (
              <div
                key={id}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={toDeptPath(path)}
                  onClick={(event) => dropdown && event.preventDefault()}
                  className={`dept-nav-link flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive(path)
                      ? "dept-nav-active text-white"
                      : "text-gray-700"
                  }`}
                >
                  {label}
                  {dropdown && (
                    <FaChevronDown
                      className={`text-xs transition-transform duration-200 ${
                        activeDropdown === id ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </Link>

                <AnimatePresence>
                  {dropdown && activeDropdown === id && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="dept-dropdown absolute top-full z-50 mt-2 w-60 rounded-2xl"
                    >
                      <div className="py-1.5">
                      {dropdown.map((item, index) => (
                        <div key={index} className="group/item relative">
                          {item.path ? (
                            <Link
                              to={toDeptPath(item.path)}
                              className="dept-dropdown-link block px-4 py-2 text-sm text-gray-700"
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <div className="cursor-default px-4 py-2 text-sm font-semibold text-gray-700">
                              {item.label}
                            </div>
                          )}

                          {item.dropdown && (
                            <div className="dept-dropdown absolute left-full top-0 hidden w-60 rounded-2xl group-hover/item:block">
                              {item.dropdown.map((sub, subIndex) => (
                                <Link
                                  key={subIndex}
                                  to={toDeptPath(sub.path)}
                                  className="dept-dropdown-link block px-4 py-2 text-sm text-gray-700"
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <Link to={deptPath("/")} className="dept-logo-wrap">
            <img
              src={logo}
              alt={`${deptInfo?.abbr || "LNMIIT"} logo`}
              className="h-14 object-contain lg:h-16"
            />
          </Link>

          <button
            className="dept-mobile-toggle rounded-lg p-2 text-2xl lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="dept-mobile-drawer overflow-hidden border-t shadow-lg lg:hidden"
            >
              <Link
                to="/"
                className="dept-mobile-item block border-b px-6 py-4 text-sm font-semibold dept-text-primary"
                onClick={() => setIsOpen(false)}
              >
                ← Back to Main Portal
              </Link>
              {navLinks.map((item) => (
                <div key={item.id} className="border-b">
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className={`dept-mobile-item flex w-full items-center justify-between px-6 py-4 ${
                      isActive(item.path) ? "active" : ""
                    }`}
                  >
                    {item.label}
                    {item.dropdown && (
                      <FaChevronDown
                        className={`transition-transform duration-200 ${
                          openDropdown === item.id ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {item.dropdown && openDropdown === item.id && (
                    <div className="dept-mobile-sub bg-gray-50">
                      {item.dropdown.map((sub, index) => (
                        <div key={index}>
                          {sub.path ? (
                            <Link
                              to={toDeptPath(sub.path)}
                              className="dept-mobile-item block px-10 py-3"
                              onClick={() => setIsOpen(false)}
                            >
                              {sub.label}
                            </Link>
                          ) : (
                            <div className="px-10 py-3 font-medium">{sub.label}</div>
                          )}

                          {sub.dropdown &&
                            sub.dropdown.map((nested, nestedIndex) => (
                              <Link
                                key={nestedIndex}
                                to={toDeptPath(nested.path)}
                                className="dept-mobile-item block px-14 py-2 text-sm"
                                onClick={() => setIsOpen(false)}
                              >
                                {nested.label}
                              </Link>
                            ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
