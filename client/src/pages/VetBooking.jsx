import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { StethoscopeIcon, CalendarIcon, UserIcon, ChevronIcon } from "../icons";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

const formatFee = (fee) => {
  const inr = new Intl.NumberFormat("en-IN");
  return `Rs. ${inr.format(fee || 0)}`;
};

export default function VetBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isAuthenticated } = useAuth();

  const [vet, setVet] = useState(null);
  const [loadingVet, setLoadingVet] = useState(true);
  const [vetError, setVetError] = useState("");

  const [form, setForm] = useState({
    petName: "",
    date: "",
    time: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadVet = async () => {
      setLoadingVet(true);
      setVetError("");

      try {
        const data = await apiRequest(`/api/vets/${id}`, {
          signal: controller.signal,
        });
        setVet(data.vet || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          setVetError(err.message || "Could not load vet details");
        }
      } finally {
        setLoadingVet(false);
      }
    };

    loadVet();
    return () => controller.abort();
  }, [id]);

  if (loadingVet) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center animate-fade-in-up text-gray-400">
        Loading vet details...
      </section>
    );
  }

  if (vetError || !vet) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-20 text-center animate-fade-in-up">
        <StethoscopeIcon className="w-12 h-12 text-beige-dark mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Vet Not Found</h1>
        <p className="text-gray-500 mb-6">
          {vetError || "The veterinarian you're looking for doesn't exist."}
        </p>
        <Link
          to="/meet-a-vet"
          className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          &larr; Back to all vets
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
    const errs = {};
    if (!form.petName.trim()) errs.petName = "Pet name is required";
    if (!form.date) errs.date = "Please select a date";
    if (!form.time) errs.time = "Please select a time slot";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setSubmitError("");
    setSubmitting(true);

    try {
      await apiRequest("/api/vets/book", {
        method: "POST",
        token,
        body: {
          vetId: id,
          petName: form.petName,
          date: form.date,
          time: form.time,
          notes: form.notes,
        },
      });

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Unable to book consultation right now.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="mx-auto max-w-lg px-4 py-20 text-center animate-fade-in-up">
        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100 mb-6">
          <svg
            className="w-8 h-8 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-gray-500 mb-2">
          Your consultation with{" "}
          <span className="font-semibold text-primary-dark">
            {vet.user?.name || "the vet"}
          </span>{" "}
          has been booked.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          {form.date} at {form.time}
        </p>
        <button
          onClick={() => navigate("/meet-a-vet")}
          className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-md shadow-primary/20 hover:shadow-lg transition-all duration-300 active:scale-[0.98]"
        >
          Back to Vets
        </button>
      </section>
    );
  }

  // Get tomorrow's date as min for date picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12 animate-fade-in-up">
      {/* Breadcrumb */}
      <Link
        to="/meet-a-vet"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-primary-dark transition-colors mb-8"
      >
        <ChevronIcon className="w-4 h-4 rotate-90" />
        Back to all vets
      </Link>

      <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-beige-dark/20 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
        <div className="p-6 sm:p-8 border-b border-beige-dark/15">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {vet.user?.name || "Vet"}
              </h1>
              <p className="text-sm text-gray-500">
                {vet.specialty} · {formatFee(vet.consultationFee)}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 space-y-6"
          noValidate
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Schedule Consultation
          </h2>

          {/* Pet Name */}
          <div>
            <label
              htmlFor="book-petname"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Pet Name
            </label>
            <input
              id="book-petname"
              type="text"
              value={form.petName}
              onChange={update("petName")}
              placeholder="e.g., Buddy"
              className={`w-full px-4 py-3 rounded-xl border text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.petName ? "border-red-400" : "border-beige-dark/50"}`}
            />
            {errors.petName && (
              <p className="text-xs text-red-500 mt-1.5">{errors.petName}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="book-date"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Preferred Date
            </label>
            <div className="relative">
              <input
                id="book-date"
                type="date"
                min={minDate}
                value={form.date}
                onChange={update("date")}
                className={`w-full px-4 py-3 rounded-xl border text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.date ? "border-red-400" : "border-beige-dark/50"}`}
              />
            </div>
            {errors.date && (
              <p className="text-xs text-red-500 mt-1.5">{errors.date}</p>
            )}
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2.5">
              Select Time Slot
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => {
                    setForm((p) => ({ ...p, time: slot }));
                    setErrors((p) => ({ ...p, time: "" }));
                  }}
                  className={`py-2.5 text-xs font-medium rounded-xl border transition-all duration-200 ${
                    form.time === slot
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                      : "bg-white text-gray-600 border-beige-dark/40 hover:border-primary/40 hover:text-primary-dark"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            {errors.time && (
              <p className="text-xs text-red-500 mt-1.5">{errors.time}</p>
            )}
          </div>

          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          {/* Notes */}
          <div>
            <label
              htmlFor="book-notes"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Additional Notes{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="book-notes"
              rows={3}
              value={form.notes}
              onChange={update("notes")}
              placeholder="Describe symptoms or concerns…"
              className="w-full px-4 py-3 rounded-xl border border-beige-dark/50 text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !vet.available}
            className="w-full py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {!vet.available
              ? "Vet is currently unavailable"
              : submitting
                ? "Confirming Booking..."
                : "Confirm Booking"}
          </button>
        </form>
      </div>
    </section>
  );
}
