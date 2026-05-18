import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HeartHandIcon,
  DogIcon,
  CatIcon,
  RabbitIcon,
  BirdIcon,
  PawIcon,
  LocationIcon,
  StarIcon,
} from "../icons";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const iconMap = {
  dog: DogIcon,
  cat: CatIcon,
  rabbit: RabbitIcon,
  bird: BirdIcon,
  other: PawIcon,
};

const speciesOptions = ["All", "Dog", "Cat", "Rabbit", "Bird", "Other"];

const formatPrice = (p) => {
  const inr = new Intl.NumberFormat("en-IN");
  return `Rs. ${inr.format(p || 0)} / day`;
};

function SkeletonCard() {
  return (
    <div className="glass-card rounded-2xl p-6 overflow-hidden">
      <div className="flex items-center gap-4 mb-4">
        <div className="skeleton w-14 h-14 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="skeleton h-3 w-full rounded mb-2" />
      <div className="skeleton h-3 w-5/6 rounded mb-5" />
      <div className="skeleton h-10 w-full rounded-xl" />
    </div>
  );
}

export default function RentAFriend() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [locationSearch, setLocationSearch] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");

  // Debounce location input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedLocation(locationSearch), 500);
    return () => clearTimeout(t);
  }, [locationSearch]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ limit: "60" });
        if (speciesFilter !== "All")
          params.set("species", speciesFilter.toLowerCase());
        if (debouncedLocation.trim())
          params.set("location", debouncedLocation.trim());

        const data = await apiRequest(
          `/api/caretakers?${params.toString()}`,
          { signal: controller.signal },
        );
        setCaretakers(data.caretakers || []);
      } catch (err) {
        if (err.name !== "AbortError")
          setError(err.message || "Failed to load caretakers");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [speciesFilter, debouncedLocation]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">

      {/* ── Hero Header ─────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-14 bg-gradient-to-br from-pink-50 via-beige-light/60 to-secondary/30 border border-beige-dark/20 shadow-lg p-8 sm:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="relative text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white mb-5 shadow-xl animate-float">
            <HeartHandIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Rent‑a‑Friend
          </h1>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto text-lg">
            Travelling or busy? Find a trusted caretaker who will love your pet
            like their own while you're away.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/caretaker/onboard"
                className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg shadow-pink-400/30 hover:shadow-xl transition-all duration-300 active:scale-95"
              >
                🏡 Become a Caretaker
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-6 py-3 text-sm font-semibold text-primary-dark border border-primary/50 bg-white/60 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300"
              >
                Login to register as caretaker
              </Link>
            )}
            <span className="chip bg-green-100 text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
              {caretakers.filter((c) => c.available).length} Available Now
            </span>
          </div>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        {/* Location search */}
        <div className="relative flex-1 min-w-0">
          <LocationIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-beige-darker" />
          <input
            type="text"
            placeholder="Search by city or area…"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-beige-dark/40 bg-white text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        {/* Species chips */}
        <div className="flex flex-wrap gap-2">
          {speciesOptions.map((s) => (
            <button
              key={s}
              onClick={() => setSpeciesFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                speciesFilter === s
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white border border-beige-dark/30 text-gray-500 hover:border-primary/40 hover:text-primary-dark"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ────────────────────────────────── */}
      {!loading && error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── Grid ─────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : caretakers.length > 0
          ? caretakers.map((c) => {
              const topSpecies = c.petsAccepted?.[0] || "other";
              const Icon = iconMap[topSpecies] || PawIcon;
              return (
                <div
                  key={c._id}
                  className="glass-card animate-fade-in-up rounded-2xl overflow-hidden"
                >
                  {/* Colored band */}
                  <div className="h-1.5 bg-gradient-to-r from-pink-400 to-rose-500" />

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-pink-500 shrink-0 group-hover:bg-pink-500 transition-colors">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-semibold text-gray-900 truncate">
                            {c.user?.name || "Caretaker"}
                          </h2>
                          {c.available && (
                            <span
                              className="w-2 h-2 rounded-full bg-green-400 shrink-0 animate-pulse-dot"
                              title="Available"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <LocationIcon className="w-3 h-3" />
                          {c.location}
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {c.bio && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {c.bio}
                      </p>
                    )}

                    {/* Chips */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {c.petsAccepted?.map((sp) => (
                        <span
                          key={sp}
                          className="chip bg-pink-50 text-pink-600 border border-pink-100 capitalize"
                        >
                          {sp}
                        </span>
                      ))}
                      {c.experienceYears > 0 && (
                        <span className="chip bg-beige/60 text-gray-500">
                          {c.experienceYears} yr exp
                        </span>
                      )}
                    </div>

                    {/* Rating + Price */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-beige-dark/15">
                      <div className="flex items-center gap-1 text-amber-500">
                        <StarIcon className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {(c.ratingAverage || 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({c.ratingCount || 0})
                        </span>
                      </div>
                      <p className="text-lg font-extrabold text-primary-dark">
                        {formatPrice(c.pricePerDay)}
                      </p>
                    </div>

                    {/* CTA */}
                    <Link
                      to={`/caretaker/book/${c._id}`}
                      className={`mt-4 block w-full py-3 text-sm font-semibold text-center rounded-xl transition-all duration-300 active:scale-[0.98] ${
                        c.available
                          ? "text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-md shadow-pink-400/20 hover:shadow-lg hover:shadow-pink-400/30"
                          : "text-gray-400 bg-beige/60 cursor-not-allowed"
                      }`}
                      onClick={(e) => !c.available && e.preventDefault()}
                    >
                      {c.available ? "Book Caretaker" : "Currently Unavailable"}
                    </Link>
                  </div>
                </div>
              );
            })
          : null}
      </div>

      {/* ── Empty state ───────────────────────────── */}
      {!loading && !error && caretakers.length === 0 && (
        <div className="text-center py-20">
          <HeartHandIcon className="w-16 h-16 mx-auto text-beige-dark mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            No caretakers found
          </h2>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            {speciesFilter !== "All" || locationSearch
              ? "Try adjusting your filters."
              : "No caretakers have listed themselves yet. Be the first!"}
          </p>
          {isAuthenticated && (
            <Link
              to="/caretaker/onboard"
              className="inline-block px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg shadow-pink-400/25 hover:shadow-xl transition-all duration-300 active:scale-95"
            >
              Register as a Caretaker
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
