import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  StethoscopeIcon,
  StarIcon,
  LocationIcon,
  CalendarIcon,
  UserIcon,
} from "../icons";
import { apiRequest } from "../lib/api";

const formatFee = (fee) => {
  const inr = new Intl.NumberFormat("en-IN");
  return `Rs. ${inr.format(fee || 0)}`;
};

export default function VetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiRequest(`/api/vets/${id}`, {
          signal: controller.signal,
        });
        setVet(data.vet || null);
      } catch (err) {
        if (err.name !== "AbortError")
          setError(err.message || "Could not load vet profile");
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-20 text-center animate-fade-in-up text-gray-400">
        <div className="spinner mb-4" />
        Loading vet profile...
      </section>
    );
  }

  if (error || !vet) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center animate-fade-in-up">
        <StethoscopeIcon className="w-14 h-14 text-beige-dark mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Vet Not Found</h1>
        <p className="text-gray-500 mb-6">
          {error || "The veterinarian you're looking for doesn't exist."}
        </p>
        <Link
          to="/meet-a-vet"
          className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          ← Back to all vets
        </Link>
      </section>
    );
  }

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(vet.ratingAverage || 0));

  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 animate-fade-in-up">
      {/* Breadcrumb */}
      <Link
        to="/meet-a-vet"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary-dark transition-colors mb-8"
      >
        ← Back to all vets
      </Link>

      {/* ── Profile card ─────────────────────────── */}
      <div className="glass-card rounded-3xl overflow-hidden mb-6">
        {/* Gradient band */}
        <div className="h-2 bg-gradient-to-r from-teal-400 via-primary to-secondary" />

        {/* Hero section */}
        <div className="p-8 sm:p-10 bg-gradient-to-br from-blue-50/60 via-transparent to-secondary/10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Big avatar */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-400 to-primary-dark text-white flex items-center justify-center text-3xl font-extrabold shadow-xl shrink-0">
              {(vet.user?.name || "V")[0].toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {vet.user?.name || "Vet"}
                </h1>
                {vet.available ? (
                  <span className="chip bg-green-100 text-green-700 border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
                    Available
                  </span>
                ) : (
                  <span className="chip bg-red-50 text-red-500 border border-red-100">
                    Unavailable
                  </span>
                )}
              </div>

              <p className="text-primary-dark font-semibold text-lg">{vet.specialty}</p>
              {vet.clinicName && (
                <p className="text-gray-500 text-sm mt-0.5">{vet.clinicName}</p>
              )}

              {/* Stars */}
              <div className="flex items-center gap-1.5 mt-3">
                <div className="flex">
                  {stars.map((filled, i) => (
                    <StarIcon
                      key={i}
                      className={`w-4 h-4 ${filled ? "text-amber-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {(vet.ratingAverage || 0).toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({vet.ratingCount || 0} reviews)
                </span>
              </div>
            </div>

            {/* Consultation fee */}
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-400 mb-0.5">Consultation Fee</p>
              <p className="text-3xl font-extrabold gradient-text">
                {formatFee(vet.consultationFee)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Info chips row ─────────────────────── */}
        <div className="px-8 sm:px-10 py-4 border-t border-beige-dark/15 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-beige/50 text-sm text-gray-600">
            <LocationIcon className="w-4 h-4 text-primary" />
            {vet.location}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-beige/50 text-sm text-gray-600">
            <UserIcon className="w-4 h-4 text-primary" />
            {vet.experienceYears} years experience
          </div>
          {vet.phone && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-beige/50 text-sm text-gray-600">
              📞 {vet.phone}
            </div>
          )}
          {vet.languages?.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-beige/50 text-sm text-gray-600">
              🌐 {vet.languages.join(", ")}
            </div>
          )}
        </div>

        {/* ── Bio ───────────────────────────────── */}
        {vet.bio && (
          <div className="px-8 sm:px-10 py-6 border-t border-beige-dark/15">
            <h2 className="text-base font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {vet.bio}
            </p>
          </div>
        )}

        {/* ── Specialization detail ─────────────── */}
        <div className="px-8 sm:px-10 py-6 border-t border-beige-dark/15">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Specialization</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: "🩺", label: "Primary", value: vet.specialty },
              { icon: "🏥", label: "Clinic", value: vet.clinicName || "Private Practice" },
              { icon: "📅", label: "Joined", value: new Date(vet.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) },
            ].map((item) => (
              <div key={item.label} className="bg-beige/30 rounded-2xl p-4">
                <p className="text-xl mb-2">{item.icon}</p>
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ───────────────────────────────── */}
        <div className="px-8 sm:px-10 py-6 border-t border-beige-dark/15">
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              to={`/vet/book/${vet._id}`}
              className={`flex-1 sm:flex-none px-8 py-3.5 text-sm font-semibold rounded-2xl text-center transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 ${
                vet.available
                  ? "text-white bg-gradient-to-r from-teal-500 to-primary-dark shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35"
                  : "text-gray-400 bg-beige/60 cursor-not-allowed"
              }`}
              onClick={(e) => !vet.available && e.preventDefault()}
            >
              <CalendarIcon className="w-4 h-4" />
              {vet.available ? "Book Appointment" : "Currently Unavailable"}
            </Link>
            <Link
              to="/meet-a-vet"
              className="px-6 py-3.5 text-sm font-semibold text-primary-dark border border-primary/50 rounded-2xl hover:bg-primary hover:text-white transition-all duration-300"
            >
              See Other Vets
            </Link>
          </div>
        </div>
      </div>

      {/* ── Placeholder reviews ─────────────────── */}
      <div className="glass-card rounded-3xl p-8 sm:p-10">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Reviews
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({vet.ratingCount || 0})
          </span>
        </h2>
        {vet.ratingCount === 0 ? (
          <div className="text-center py-8">
            <StarIcon className="w-10 h-10 text-beige-dark mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No reviews yet — be the first to book!</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="text-5xl font-extrabold gradient-text">
              {(vet.ratingAverage || 0).toFixed(1)}
            </div>
            <div>
              <div className="flex">
                {stars.map((filled, i) => (
                  <StarIcon key={i} className={`w-5 h-5 ${filled ? "text-amber-400" : "text-gray-200"}`} />
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Based on {vet.ratingCount} review{vet.ratingCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
