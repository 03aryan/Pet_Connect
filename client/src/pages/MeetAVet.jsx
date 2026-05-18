import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  StethoscopeIcon,
  UserIcon,
  StarIcon,
  CalendarIcon,
  LocationIcon,
} from "../icons";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const formatFee = (fee) => {
  const inr = new Intl.NumberFormat("en-IN");
  return `Rs. ${inr.format(fee || 0)}`;
};

const SPECIALTIES = [
  "All",
  "Small Animals",
  "Large Animals",
  "Exotic Pets",
  "Dental",
  "Surgery",
  "Dermatology",
  "Oncology",
  "General",
];

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="h-1.5 bg-beige skeleton" />
      <div className="p-6 space-y-3">
        <div className="flex items-center gap-4">
          <div className="skeleton w-14 h-14 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-7 w-16 rounded-lg" />
          <div className="skeleton h-7 w-20 rounded-lg" />
          <div className="skeleton h-7 w-24 rounded-lg" />
        </div>
        <div className="skeleton h-10 w-full rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function MeetAVet() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ limit: "60" });
        if (specialtyFilter !== "All") params.set("specialty", specialtyFilter);
        if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());

        const data = await apiRequest(`/api/vets?${params.toString()}`, {
          signal: controller.signal,
        });
        setVets(data.vets || []);
      } catch (err) {
        if (err.name !== "AbortError")
          setError(err.message || "Failed to load vets");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [specialtyFilter, debouncedSearch]);

  const avgRating =
    vets.length > 0
      ? (vets.reduce((s, v) => s + (v.ratingAverage || 0), 0) / vets.length).toFixed(1)
      : "0.0";

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">

      {/* ── Header ──────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-br from-blue-50 via-beige-light/40 to-secondary/30 border border-beige-dark/20 shadow-lg p-8 sm:p-12">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/5 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-primary-dark text-white mb-5 shadow-xl animate-float">
            <StethoscopeIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Meet a Vet
          </h1>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto text-lg">
            Specialized veterinary professionals available for online and
            in-person consultations — filtered by their area of expertise.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            {isAuthenticated ? (
              <>
                <Link
                  to="/vet/onboard"
                  className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-primary-dark rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl transition-all duration-300 active:scale-95"
                >
                  {user?.role === "vet" ? "Edit Vet Profile" : "List Yourself as Vet"}
                </Link>
                {user?.role === "vet" && (
                  <Link
                    to="/vet/dashboard"
                    className="px-6 py-3 text-sm font-semibold text-primary-dark border border-primary/50 bg-white/60 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Open Vet Dashboard
                  </Link>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="px-6 py-3 text-sm font-semibold text-primary-dark border border-primary/50 bg-white/60 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300"
              >
                Login to list yourself as a vet
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats bar ────────────────────────────── */}
      {!loading && (
        <div className="flex items-center justify-center gap-10 mb-10 flex-wrap animate-fade-in-up">
          {[
            { value: `${vets.length}+`, label: "Verified Vets" },
            { value: avgRating, label: "Avg Rating" },
            { value: `${vets.filter((v) => v.available).length}`, label: "Available Now" },
          ].map((s) => (
            <div key={s.label} className="text-center stat-value">
              <p className="text-2xl font-bold gradient-text">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Search + Filters ─────────────────────── */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search by name, specialty, or city…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-lg px-5 py-3 rounded-xl border border-beige-dark/40 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />

        {/* Specialty filter chips */}
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((sp) => (
            <button
              key={sp}
              onClick={() => setSpecialtyFilter(sp)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                specialtyFilter === sp
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white border border-beige-dark/30 text-gray-500 hover:border-primary/40 hover:text-primary-dark"
              }`}
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ────────────────────────────────── */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 mb-6">
          {error}
        </div>
      )}

      {/* ── Vet Grid ─────────────────────────────── */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : vets.length > 0
          ? vets.map((v) => (
              <div
                key={v._id}
                className="glass-card animate-fade-in-up rounded-2xl overflow-hidden cursor-pointer"
                onClick={() => navigate(`/vet/${v._id}`)}
              >
                {/* Header band */}
                <div className="h-1.5 bg-gradient-to-r from-teal-400 to-primary" />

                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-secondary/40 text-teal-600 shrink-0 text-lg font-bold">
                      {(v.user?.name || "V")[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-base font-semibold text-gray-900 truncate">
                          {v.user?.name || "Vet"}
                        </h2>
                        {v.available && (
                          <span
                            className="w-2 h-2 rounded-full bg-green-400 shrink-0 animate-pulse-dot"
                            title="Available"
                          />
                        )}
                      </div>
                      <p className="text-sm text-primary-dark font-medium">{v.specialty}</p>
                      {v.clinicName && (
                        <p className="text-xs text-gray-400">{v.clinicName}</p>
                      )}
                    </div>
                  </div>

                  {/* Info chips */}
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600">
                      <StarIcon className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold">
                        {(v.ratingAverage || 0).toFixed(1)}
                      </span>
                      <span className="text-[10px] text-amber-400">({v.ratingCount || 0})</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-beige/60 text-xs text-gray-500">
                      {v.experienceYears} yrs exp
                    </span>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-beige/60 text-xs text-gray-500">
                      <LocationIcon className="w-3 h-3" />
                      {v.location}
                    </div>
                  </div>

                  {/* Fee & CTA */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-beige-dark/15">
                    <div>
                      <p className="text-xs text-gray-400">Consultation Fee</p>
                      <p className="text-lg font-bold text-primary-dark">
                        {formatFee(v.consultationFee)}
                      </p>
                    </div>
                    <Link
                      to={`/vet/book/${v._id}`}
                      onClick={(e) => { e.stopPropagation(); if (!v.available) e.preventDefault(); }}
                      className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 active:scale-[0.98] ${
                        v.available
                          ? "text-white bg-gradient-to-r from-teal-500 to-primary-dark shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                          : "text-gray-400 bg-beige/60 cursor-not-allowed"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        {v.available ? "Book Now" : "Unavailable"}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          : null}
      </div>

      {/* ── Empty state ───────────────────────────── */}
      {!loading && !error && vets.length === 0 && (
        <div className="text-center py-20">
          <StethoscopeIcon className="w-16 h-16 text-beige-dark mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">No vets found</h2>
          <p className="text-gray-400 mb-4 max-w-sm mx-auto">
            {specialtyFilter !== "All" || searchQuery
              ? "Try adjusting your search or filters."
              : "No vet profiles listed yet."}
          </p>
          {(specialtyFilter !== "All" || searchQuery) && (
            <button
              onClick={() => { setSpecialtyFilter("All"); setSearchQuery(""); }}
              className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}
