import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function MeetAVet() {
  const { user, isAuthenticated } = useAuth();
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadVets = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest("/api/vets?limit=60", {
          signal: controller.signal,
        });
        setVets(data.vets || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load vets");
        }
      } finally {
        setLoading(false);
      }
    };

    loadVets();
    return () => controller.abort();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
          <StethoscopeIcon className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Meet a Vet
        </h1>
        <p className="mt-3 text-gray-500 max-w-xl mx-auto">
          Trusted veterinary professionals available for online and in-person
          consultations.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          {isAuthenticated ? (
            <>
              <Link
                to="/vet/onboard"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                {user?.role === "vet"
                  ? "Edit Vet Profile"
                  : "List Yourself as Vet"}
              </Link>

              {user?.role === "vet" ? (
                <Link
                  to="/vet/dashboard"
                  className="px-5 py-2.5 text-sm font-semibold text-primary-dark border border-primary/50 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Open Vet Dashboard
                </Link>
              ) : null}
            </>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-semibold text-primary-dark border border-primary/50 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
            >
              Login to list yourself as a vet
            </Link>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-center gap-8 mb-12 flex-wrap">
        {[
          { value: `${vets.length}+`, label: "Verified Vets" },
          {
            value:
              vets.length > 0
                ? (
                    vets.reduce(
                      (sum, vet) => sum + (vet.ratingAverage || 0),
                      0,
                    ) / vets.length
                  ).toFixed(1)
                : "0.0",
            label: "Avg Rating",
          },
          {
            value: `${vets.filter((vet) => vet.available).length}`,
            label: "Available Now",
          },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-2xl font-bold text-primary-dark">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-14 text-gray-400">Loading vets...</div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 mb-6">
          {error}
        </div>
      )}

      {!loading && !error && vets.length === 0 && (
        <div className="text-center py-14 text-gray-400">
          No vet profiles listed yet.
        </div>
      )}

      {!loading && !error && vets.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {vets.map((v) => (
            <div
              key={v._id}
              className="group bg-white/50 backdrop-blur-md rounded-2xl border border-beige-dark/20 shadow-sm hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Header band */}
              <div className="h-2 bg-gradient-to-r from-primary to-secondary" />

              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <UserIcon className="w-7 h-7" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-base font-semibold text-gray-900 truncate">
                        {v.user?.name || "Vet"}
                      </h2>
                      {v.available && (
                        <span
                          className="w-2 h-2 rounded-full bg-green-400 shrink-0"
                          title="Available"
                        />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{v.specialty}</p>
                  </div>
                </div>

                {/* Info chips */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600">
                    <StarIcon className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">
                      {(v.ratingAverage || 0).toFixed(1)}
                    </span>
                    <span className="text-[10px] text-amber-400">
                      ({v.ratingCount || 0})
                    </span>
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
                    className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 active:scale-[0.98] ${
                      v.available
                        ? "text-white bg-gradient-to-r from-primary to-primary-dark shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                        : "text-gray-400 bg-beige/60 cursor-not-allowed"
                    }`}
                    onClick={(e) => !v.available && e.preventDefault()}
                  >
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4" />
                      {v.available ? "Book Now" : "Unavailable"}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
