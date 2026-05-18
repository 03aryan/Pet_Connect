import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandIcon, LocationIcon } from "../icons";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const PET_SPECIES = ["dog", "cat", "rabbit", "bird", "other"];

export default function CaretakerOnboarding() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    bio: "",
    location: "",
    phone: "",
    pricePerDay: "",
    petsAccepted: ["dog", "cat"],
    experienceYears: "",
    available: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // Load existing profile
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiRequest("/api/caretakers/me/profile", { token });
        if (data.caretaker) {
          const c = data.caretaker;
          setForm({
            bio: c.bio || "",
            location: c.location || "",
            phone: c.phone || "",
            pricePerDay: c.pricePerDay ?? "",
            petsAccepted: c.petsAccepted || ["dog", "cat"],
            experienceYears: c.experienceYears ?? "",
            available: Boolean(c.available),
          });
        }
      } catch (err) {
        if (!String(err.message || "").toLowerCase().includes("not found")) {
          setSubmitError(err.message || "Unable to load your caretaker profile");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const update = (field) => (e) => {
    const value =
      field === "available" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    setSubmitError("");
    setSubmitSuccess("");
  };

  const toggleSpecies = (sp) => {
    setForm((prev) => ({
      ...prev,
      petsAccepted: prev.petsAccepted.includes(sp)
        ? prev.petsAccepted.filter((s) => s !== sp)
        : [...prev.petsAccepted, sp],
    }));
    setSubmitError("");
    setSubmitSuccess("");
  };

  const validate = () => {
    const e = {};
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.pricePerDay || Number(form.pricePerDay) < 0)
      e.pricePerDay = "Valid price per day is required";
    if (form.petsAccepted.length === 0)
      e.petsAccepted = "Select at least one pet type";
    return e;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setErrors({});
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitting(true);

    try {
      await apiRequest("/api/caretakers/profile", {
        method: "POST",
        token,
        body: {
          bio: form.bio,
          location: form.location,
          phone: form.phone,
          pricePerDay: Number(form.pricePerDay),
          petsAccepted: form.petsAccepted,
          experienceYears: Number(form.experienceYears || 0),
          available: form.available,
        },
      });
      setSubmitSuccess("Your caretaker profile has been saved!");
    } catch (err) {
      setSubmitError(err.message || "Could not save profile right now");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-14 text-center text-gray-400">
        <div className="spinner mx-auto mb-4" />
        Loading your caretaker profile...
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
      <div className="mb-8">
        <Link
          to="/rent-a-friend"
          className="text-sm text-gray-400 hover:text-primary-dark transition-colors"
        >
          ← Back to Rent-a-Friend
        </Link>
      </div>

      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-beige-dark/20 shadow-sm overflow-hidden">
        {/* Band */}
        <div className="h-2 bg-gradient-to-r from-pink-400 to-rose-500" />

        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-beige-dark/20">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 text-pink-500 flex items-center justify-center">
              <HeartHandIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Caretaker Registration
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Create your profile so pet parents can find you and book your care services.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5" noValidate>

          {/* Location + Phone */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Location *
              </label>
              <div className="relative">
                <LocationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-beige-darker" />
                <input
                  value={form.location}
                  onChange={update("location")}
                  placeholder="e.g., Bandra, Mumbai"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.location ? "border-red-400" : "border-beige-dark/50"}`}
                />
              </div>
              {errors.location && (
                <p className="text-xs text-red-500 mt-1.5">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                value={form.phone}
                onChange={update("phone")}
                placeholder="+91-9000000000"
                className="w-full px-4 py-2.5 rounded-xl border border-beige-dark/50 text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          {/* Price + Experience */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Price Per Day (Rs.) *
              </label>
              <input
                type="number"
                min="0"
                value={form.pricePerDay}
                onChange={update("pricePerDay")}
                placeholder="e.g., 500"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.pricePerDay ? "border-red-400" : "border-beige-dark/50"}`}
              />
              {errors.pricePerDay && (
                <p className="text-xs text-red-500 mt-1.5">{errors.pricePerDay}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={form.experienceYears}
                onChange={update("experienceYears")}
                placeholder="e.g., 3"
                className="w-full px-4 py-2.5 rounded-xl border border-beige-dark/50 text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          {/* Pets Accepted */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pets I Accept *
            </label>
            <div className="flex flex-wrap gap-2">
              {PET_SPECIES.map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => toggleSpecies(sp)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                    form.petsAccepted.includes(sp)
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                      : "bg-white border border-beige-dark/40 text-gray-500 hover:border-pink-400 hover:text-pink-500"
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
            {errors.petsAccepted && (
              <p className="text-xs text-red-500 mt-1.5">{errors.petsAccepted}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              About Me
            </label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={update("bio")}
              placeholder="Tell pet parents about your love for animals, experience, home setup…"
              className="w-full px-4 py-2.5 rounded-xl border border-beige-dark/50 text-sm bg-white outline-none transition-all focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>

          {/* Available toggle */}
          <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.available}
              onChange={update("available")}
              className="w-4 h-4 accent-pink-500"
            />
            I am currently available for bookings
          </label>

          {/* Messages */}
          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              ✓ {submitSuccess}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-md shadow-pink-400/20 hover:shadow-lg hover:shadow-pink-400/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Caretaker Profile"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/rent-a-friend")}
              className="px-6 py-2.5 text-sm font-semibold text-primary-dark border border-primary/50 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
            >
              Back to Listings
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
