import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StethoscopeIcon, UserIcon, LocationIcon } from "../icons";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function VetOnboarding() {
  const navigate = useNavigate();
  const { token, refreshUser } = useAuth();

  const [form, setForm] = useState({
    clinicName: "",
    specialty: "",
    location: "",
    consultationFee: "",
    experienceYears: "",
    phone: "",
    languages: "",
    bio: "",
    available: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    const loadMyProfile = async () => {
      setLoading(true);

      try {
        const data = await apiRequest("/api/vets/me/profile", { token });
        if (data.vet) {
          setForm({
            clinicName: data.vet.clinicName || "",
            specialty: data.vet.specialty || "",
            location: data.vet.location || "",
            consultationFee: data.vet.consultationFee || "",
            experienceYears: data.vet.experienceYears || "",
            phone: data.vet.phone || "",
            languages: (data.vet.languages || []).join(", "),
            bio: data.vet.bio || "",
            available: Boolean(data.vet.available),
          });
        }
      } catch (err) {
        if (
          !String(err.message || "")
            .toLowerCase()
            .includes("not found")
        ) {
          setSubmitError(err.message || "Unable to load your vet profile");
        }
      } finally {
        setLoading(false);
      }
    };

    loadMyProfile();
  }, [token]);

  const update = (field) => (event) => {
    const value =
      field === "available" ? event.target.checked : event.target.value;

    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (submitError) setSubmitError("");
    if (submitSuccess) setSubmitSuccess("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.specialty.trim()) nextErrors.specialty = "Specialty is required";
    if (!form.location.trim()) nextErrors.location = "Location is required";
    if (!form.consultationFee || Number(form.consultationFee) < 0) {
      nextErrors.consultationFee = "Valid consultation fee is required";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError("");
    setSubmitSuccess("");
    setIsSubmitting(true);

    try {
      const payload = {
        clinicName: form.clinicName,
        specialty: form.specialty,
        location: form.location,
        consultationFee: Number(form.consultationFee),
        experienceYears: Number(form.experienceYears || 0),
        phone: form.phone,
        languages: form.languages,
        bio: form.bio,
        available: form.available,
      };

      await apiRequest("/api/vets/profile", {
        method: "POST",
        token,
        body: payload,
      });

      await refreshUser();

      setSubmitSuccess("Your vet profile has been saved successfully.");
    } catch (err) {
      setSubmitError(err.message || "Could not save profile right now");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14 text-center text-gray-400">
        Loading vet onboarding form...
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
      <div className="mb-8">
        <Link
          to="/meet-a-vet"
          className="text-sm text-gray-400 hover:text-primary-dark transition-colors"
        >
          &larr; Back to vets
        </Link>
      </div>

      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-beige-dark/20 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
        <div className="p-6 sm:p-8 border-b border-beige-dark/20">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <StethoscopeIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Vet Onboarding
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Create your profile so pet parents can discover and book
                consultations.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 space-y-5"
          noValidate
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Clinic Name
              </label>
              <input
                value={form.clinicName}
                onChange={update("clinicName")}
                placeholder="Paws Care Clinic"
                className="w-full px-4 py-2.5 rounded-xl border border-beige-dark/50 text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Specialty *
              </label>
              <input
                value={form.specialty}
                onChange={update("specialty")}
                placeholder="Small Animals"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.specialty ? "border-red-400" : "border-beige-dark/50"}`}
              />
              {errors.specialty && (
                <p className="text-xs text-red-500 mt-1.5">
                  {errors.specialty}
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Location *
              </label>
              <div className="relative">
                <LocationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-beige-darker" />
                <input
                  value={form.location}
                  onChange={update("location")}
                  placeholder="Delhi"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.location ? "border-red-400" : "border-beige-dark/50"}`}
                />
              </div>
              {errors.location && (
                <p className="text-xs text-red-500 mt-1.5">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Consultation Fee (Rs.) *
              </label>
              <input
                type="number"
                min="0"
                value={form.consultationFee}
                onChange={update("consultationFee")}
                placeholder="600"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.consultationFee ? "border-red-400" : "border-beige-dark/50"}`}
              />
              {errors.consultationFee && (
                <p className="text-xs text-red-500 mt-1.5">
                  {errors.consultationFee}
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
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
                placeholder="8"
                className="w-full px-4 py-2.5 rounded-xl border border-beige-dark/50 text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={update("phone")}
                placeholder="+91-9000000000"
                className="w-full px-4 py-2.5 rounded-xl border border-beige-dark/50 text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Languages (comma-separated)
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-beige-darker" />
              <input
                value={form.languages}
                onChange={update("languages")}
                placeholder="English, Hindi"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-beige-dark/50 text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bio
            </label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={update("bio")}
              placeholder="Describe your experience and approach..."
              className="w-full px-4 py-2.5 rounded-xl border border-beige-dark/50 text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.available}
              onChange={update("available")}
              className="w-4 h-4 accent-primary"
            />
            I am currently available for bookings
          </label>

          {submitError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {submitSuccess}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving Profile..." : "Save Vet Profile"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/vet/dashboard")}
              className="px-6 py-2.5 text-sm font-semibold text-primary-dark border border-primary/50 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
            >
              Open Vet Dashboard
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
