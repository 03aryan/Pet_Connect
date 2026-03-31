import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { PawIcon } from "../icons";
import { useAuth } from "../context/AuthContext";

const baseNavLinks = [
  { to: "/", label: "Home" },
  { to: "/buy-adopt", label: "Buy/Adopt" },
  { to: "/rent-a-friend", label: "Rent‑a‑Friend" },
  { to: "/meet-a-vet", label: "Meet a Vet" },
  { to: "/stray-feed", label: "Stray Feed" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navLinks = isAuthenticated
    ? [...baseNavLinks, { to: "/my-activity", label: "My Activity" }]
    : baseNavLinks;

  const firstName = user?.firstName || user?.name?.split(" ")[0] || "Friend";

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 border-b border-beige-dark/20 shadow-sm shadow-beige-dark/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ── Logo ─────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="Pet Connect Home"
          >
            <PawIcon className="w-7 h-7 text-primary group-hover:text-primary-dark transition-colors duration-300" />
            <span className="text-xl font-bold tracking-tight text-primary-dark group-hover:text-primary-deeper transition-colors duration-300">
              Pet Connect
            </span>
          </Link>

          {/* ── Desktop Links ────────────────────── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-300 ${
                    isActive
                      ? "text-primary-dark bg-primary/10"
                      : "text-gray-500 hover:text-primary-dark hover:bg-beige/50"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* ── Auth Buttons (Desktop) ───────────── */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {user?.role === "vet" ? (
                  <Link
                    to="/vet/dashboard"
                    className="px-4 py-2 text-sm font-semibold text-primary-dark border border-primary/40 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Vet Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/vet/onboard"
                    className="px-4 py-2 text-sm font-semibold text-primary-dark border border-primary/40 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Become a Vet
                  </Link>
                )}

                <span className="px-4 py-2 text-sm font-semibold text-primary-dark border border-beige-dark/40 bg-beige/40 rounded-xl">
                  Welcome, {firstName}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-5 py-2 text-sm font-semibold text-primary-dark border border-primary/60 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 active:scale-95"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  id="nav-login-btn"
                  className="px-5 py-2 text-sm font-semibold text-primary-dark border border-primary/60 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 active:scale-95"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  id="nav-signup-btn"
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:from-primary-dark hover:to-primary-deeper transition-all duration-300 active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ─────────────────── */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden flex flex-col gap-[5px] items-center justify-center w-10 h-10 rounded-lg hover:bg-beige/50 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span
              className={`block h-0.5 w-5 bg-primary-dark rounded-full transition-all duration-300 origin-center ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-primary-dark rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0 scale-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-5 bg-primary-dark rounded-full transition-all duration-300 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ──────────────────────── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 pb-5 pt-2 space-y-1 bg-white/90 backdrop-blur-xl border-t border-beige-dark/15">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-primary-dark bg-primary/10"
                    : "text-gray-500 hover:text-primary-dark hover:bg-beige/40"
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          <div className="pt-4 border-t border-beige-dark/15">
            {isAuthenticated ? (
              <div className="space-y-2">
                {user?.role === "vet" ? (
                  <Link
                    to="/vet/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-primary-dark border border-primary/60 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Vet Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/vet/onboard"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-primary-dark border border-primary/60 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Become a Vet
                  </Link>
                )}

                <p className="px-1 text-sm font-semibold text-primary-dark">
                  Welcome, {firstName}
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-center px-4 py-2.5 text-sm font-semibold text-primary-dark border border-primary/60 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-primary-dark border border-primary/60 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
