import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { HeartHandIcon, LocationIcon, StarIcon, CalendarIcon } from "../icons";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const PET_SPECIES = ["dog", "cat", "rabbit", "bird", "other"];

const formatPrice = (p) => {
  const inr = new Intl.NumberFormat("en-IN");
  return `Rs. ${inr.format(p || 0)}`;
};

const daysBetween = (start, end) => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s) || isNaN(e) || e <= s) return 0;
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
};

export default function CaretakerBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isAuthenticated } = useAuth();

  const [caretaker, setCaretaker] = useState(null);
  const [loadingCaretaker, setLoadingCaretaker] = useState(true);
  const [caretakerError, setCaretakerError] = useState("");

  const [form, setForm] = useState({
    petName: "",
    petSpecies: "dog",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoadingCaretaker(true);
      setCaretakerError("");
      try {
        const data = await apiRequest(`/api/caretakers/${id}`, {
          signal: controller.signal,
        });
        setCaretaker(data.caretaker || null);
      } catch (err) {
        if (err.name !== "AbortError")
          setCaretakerError(err.message || "Could not load caretaker details");
      } finally {
        setLoadingCaretaker(false);
      }
    };
    load();
    return () => controller.abort();
  }, [id]);

  if (loadingCaretaker) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center animate-fade-in-up text-gray-400">
        <div className="spinner mb-4" />
        Loading caretaker details...
      </section>
    );
  }

  if (caretakerError || !caretaker) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center animate-fade-in-up">
        <HeartHandIcon className="w-12 h-12 text-beige-dark mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Caretaker Not Found</h1>
        <p className="text-gray-500 mb-6">
          {caretakerError || "The caretaker you're looking for doesn't exist."}
        </p>
        <Link
          to="/rent-a-friend"
          className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          ← Back to all caretakers
        </Link>
      </section>
    );
  }

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (submitError) setSubmitError("");
  };

  const validate = () => {
    const e = {};
    if (!form.petName.trim()) e.petName = "Pet name is required";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.endDate) e.endDate = "End date is required";
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
      e.endDate = "End date must be after start date";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setErrors({});
    setSubmitError("");
    setSubmitting(true);
    try {
      await apiRequest("/api/caretakers/book", {
        method: "POST",
        token,
        body: {
          caretakerId: id,
          petName: form.petName,
          petSpecies: form.petSpecies,
          startDate: form.startDate,
          endDate: form.endDate,
          notes: form.notes,
        },
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Unable to book caretaker right now.");
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (submitted) {
    const days = daysBetween(form.startDate, form.endDate);
    return (
      <section className="mx-auto max-w-lg px-4 py-20 text-center animate-fade-in-up">
        <div className="w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-green-100 mb-6 animate-scale-in">
          <svg className="w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed! 🐾</h1>
        <p className="text-gray-500 mb-1">
          <span className="font-semibold text-primary-dark">{caretaker.user?.name}</span> will
          take care of <span className="font-semibold text-gray-700">{form.petName}</span>.
        </p>
        <p className="text-sm text-gray-400 mb-2">
          {form.startDate} → {form.endDate} · {days} day{days !== 1 ? "s" : ""}
        </p>
        <p className="text-lg font-bold text-primary-dark mb-8">
          Total: {formatPrice(days * caretaker.pricePerDay)}
        </p>
        <button
          onClick={() => navigate("/rent-a-friend")}
          className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-md shadow-pink-400/20 hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
        >
          Back to Caretakers
        </button>
      </section>
    );
  }

  // Date helpers
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  const days = daysBetween(form.startDate, form.endDate);
  const totalPrice = days * caretaker.pricePerDay;

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12 animate-fade-in-up">
      {/* Breadcrumb */}
      <Link
        to="/rent-a-friend"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary-dark transition-colors mb-8"
      >
        ← Back to all caretakers
      </Link>

      <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-beige-dark/20 shadow-sm overflow-hidden">
        {/* Band */}
        <div className="h-2 bg-gradient-to-r from-pink-400 to-rose-500" />

        {/* Caretaker summary header */}
        <div className="p-6 sm:p-8 border-b border-beige-dark/15">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-500 flex items-center justify-center text-xl font-bold shrink-0">
              {(caretaker.user?.name || "C")[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {caretaker.user?.name || "Caretaker"}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <LocationIcon className="w-3.5 h-3.5" />
                  {caretaker.location}
                </span>
                <span className="flex items-center gap-1 text-sm text-amber-500 font-semibold">
                  <StarIcon className="w-3.5 h-3.5" />
                  {(caretaker.ratingAverage || 0).toFixed(1)}
                </span>
                <span className="text-sm font-extrabold text-primary-dark">
                  {formatPrice(caretaker.pricePerDay)} / day
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6" noValidate>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-pink-500" />
            Book a Stay
          </h2>

          {/* Pet Name + Species */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ct-petname" className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Pet's Name
              </label>
              <input
                id="ct-petname"
                type="text"
                value={form.petName}
                onChange={update("petName")}
                placeholder="e.g., Buddy"
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-pink-300 focus:border-pink-400 ${errors.petName ? "border-red-400" : "border-beige-dark/50"}`}
              />
              {errors.petName && (
                <p className="text-xs text-red-500 mt-1.5">{errors.petName}</p>
              )}
            </div>

            <div>
              <label htmlFor="ct-species" className="block text-sm font-medium text-gray-700 mb-1.5">
                Pet Type
              </label>
              <select
                id="ct-species"
                value={form.petSpecies}
                onChange={update("petSpecies")}
                className="w-full px-4 py-3 rounded-xl border border-beige-dark/50 text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-pink-300 focus:border-pink-400 capitalize"
              >
                {PET_SPECIES.map((sp) => (
                  <option key={sp} value={sp} className="capitalize">
                    {sp.charAt(0).toUpperCase() + sp.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ct-start" className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Date
              </label>
              <input
                id="ct-start"
                type="date"
                min={minDate}
                value={form.startDate}
                onChange={update("startDate")}
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-pink-300 focus:border-pink-400 ${errors.startDate ? "border-red-400" : "border-beige-dark/50"}`}
              />
              {errors.startDate && (
                <p className="text-xs text-red-500 mt-1.5">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label htmlFor="ct-end" className="block text-sm font-medium text-gray-700 mb-1.5">
                End Date
              </label>
              <input
                id="ct-end"
                type="date"
                min={form.startDate || minDate}
                value={form.endDate}
                onChange={update("endDate")}
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-pink-300 focus:border-pink-400 ${errors.endDate ? "border-red-400" : "border-beige-dark/50"}`}
              />
              {errors.endDate && (
                <p className="text-xs text-red-500 mt-1.5">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Live price estimate */}
          {days > 0 && (
            <div className="rounded-xl bg-pink-50 border border-pink-100 px-5 py-4 flex items-center justify-between animate-scale-in">
              <div>
                <p className="text-sm text-pink-600 font-medium">
                  {days} day{days !== 1 ? "s" : ""} × {formatPrice(caretaker.pricePerDay)}
                </p>
                <p className="text-xs text-pink-400">Estimated total</p>
              </div>
              <p className="text-2xl font-extrabold text-pink-600">
                {formatPrice(totalPrice)}
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label htmlFor="ct-notes" className="block text-sm font-medium text-gray-700 mb-1.5">
              Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="ct-notes"
              rows={3}
              value={form.notes}
              onChange={update("notes")}
              placeholder="Feeding schedule, medications, special requirements…"
              className="w-full px-4 py-3 rounded-xl border border-beige-dark/50 text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-pink-300 focus:border-pink-400 resize-none"
            />
          </div>

          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !caretaker.available}
            className="w-full py-4 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-lg shadow-pink-400/25 hover:shadow-xl hover:shadow-pink-400/35 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {!caretaker.available
              ? "Caretaker is currently unavailable"
              : submitting
              ? "Confirming Booking..."
              : "Confirm Booking"}
          </button>
        </form>
      </div>
    </section>
  );
}
