import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { HomeIcon, MailIcon, PawIcon } from "../icons";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const formatPrice = (price, status) => {
  const inr = new Intl.NumberFormat("en-IN");
  const value = inr.format(Number(price || 0));
  return status === "rent" ? `Rs. ${value}/day` : `Rs. ${value}`;
};

export default function PetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, isAuthenticated } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState({
    startDate: "",
    days: "",
    contactPhone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadPet = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const data = await apiRequest(`/api/pets/${id}`, {
          signal: controller.signal,
        });
        setPet(data.pet || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          setLoadError(err.message || "Could not load pet details");
        }
      } finally {
        setLoading(false);
      }
    };

    loadPet();
    return () => controller.abort();
  }, [id]);

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (submitError) setSubmitError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.contactPhone.trim()) {
      nextErrors.contactPhone = "Contact phone is required";
    }

    if (pet?.status === "rent") {
      if (!form.startDate) nextErrors.startDate = "Please choose a start date";

      const dayCount = parseInt(form.days, 10);
      if (!dayCount) {
        nextErrors.days = "Please enter number of days";
      } else if (dayCount < 1 || dayCount > 30) {
        nextErrors.days = "Days must be between 1 and 30";
      }
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!pet) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError("");
    setSubmitting(true);

    try {
      const payload = {
        message: form.message,
        contactPhone: form.contactPhone,
      };

      if (pet.status === "rent") {
        payload.startDate = form.startDate;
        payload.days = Number(form.days);
      }

      await apiRequest(`/api/pets/${id}/inquiries`, {
        method: "POST",
        token,
        body: payload,
      });

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Unable to submit your request right now.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-400">
        Loading pet details...
      </section>
    );
  }

  if (loadError || !pet) {
    return (
      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <HomeIcon className="w-12 h-12 text-beige-dark mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Listing Not Found
        </h1>
        <p className="text-gray-500 mb-6">
          {loadError || "This pet listing is unavailable."}
        </p>
        <Link
          to="/buy-adopt"
          className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          &larr; Back to listings
        </Link>
      </section>
    );
  }

  const isOwnListing =
    isAuthenticated && String(user?._id) === String(pet.owner?._id);

  if (submitted) {
    return (
      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16 text-center animate-fade-in-up">
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
          Request Sent Successfully
        </h1>
        <p className="text-gray-500 mb-6">
          {pet.status === "rent"
            ? "Your rent-a-friend booking request was sent to the owner."
            : "Your buy/adoption inquiry was sent to the owner."}
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link
            to="/buy-adopt"
            className="px-5 py-2.5 text-sm font-semibold text-primary-dark border border-primary/50 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
          >
            Continue Browsing
          </Link>
          <Link
            to="/rent-a-friend"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
          >
            Rent More Pets
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <Link
        to="/buy-adopt"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary-dark transition-colors mb-6"
      >
        <PawIcon className="w-4 h-4" />
        Back to listings
      </Link>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-beige-dark/20 shadow-sm overflow-hidden">
          <div className="h-72 bg-gradient-to-br from-beige-light/60 to-secondary/20 flex items-center justify-center">
            {pet.imageURL ? (
              <img
                src={pet.imageURL}
                alt={pet.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <PawIcon className="w-20 h-20 text-primary/30" />
            )}
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
              <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary-dark">
                {pet.status === "rent" ? "For Rent" : "Buy / Adopt"}
              </span>
            </div>
            <p className="text-gray-500 mb-4">
              {pet.breed} · {pet.species} · {pet.age}
            </p>
            <p className="text-2xl font-extrabold text-primary-dark mb-4">
              {formatPrice(pet.price, pet.status)}
            </p>

            <h2 className="text-sm font-semibold text-gray-700 mb-1">
              Description
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {pet.description || "No additional details provided."}
            </p>

            <div className="mt-4 pt-4 border-t border-beige-dark/20">
              <p className="text-xs text-gray-400">Listed by</p>
              <p className="text-sm font-semibold text-gray-700">
                {pet.owner?.name || "Pet Parent"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-beige-dark/20 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {pet.status === "rent" ? "Book a Day" : "Send Buy/Adopt Inquiry"}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {pet.status === "rent"
              ? "Tell the owner your preferred start date and duration."
              : "Share your contact details and a short message for the owner."}
          </p>

          {isOwnListing ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              This is your own listing. You cannot submit an inquiry on it.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {pet.status === "rent" ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                      htmlFor="rent-start-date"
                    >
                      Start Date
                    </label>
                    <input
                      id="rent-start-date"
                      type="date"
                      value={form.startDate}
                      onChange={update("startDate")}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.startDate ? "border-red-400" : "border-beige-dark/50"}`}
                    />
                    {errors.startDate && (
                      <p className="text-xs text-red-500 mt-1.5">
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                      htmlFor="rent-days"
                    >
                      Number of Days
                    </label>
                    <input
                      id="rent-days"
                      type="number"
                      min="1"
                      max="30"
                      value={form.days}
                      onChange={update("days")}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.days ? "border-red-400" : "border-beige-dark/50"}`}
                    />
                    {errors.days && (
                      <p className="text-xs text-red-500 mt-1.5">
                        {errors.days}
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="contact-phone"
                >
                  Contact Phone
                </label>
                <div className="relative">
                  <MailIcon className="w-4.5 h-4.5 absolute left-3 top-1/2 -translate-y-1/2 text-beige-darker" />
                  <input
                    id="contact-phone"
                    type="text"
                    value={form.contactPhone}
                    onChange={update("contactPhone")}
                    placeholder="Your phone number"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.contactPhone ? "border-red-400" : "border-beige-dark/50"}`}
                  />
                </div>
                {errors.contactPhone && (
                  <p className="text-xs text-red-500 mt-1.5">
                    {errors.contactPhone}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                  htmlFor="request-message"
                >
                  Message (Optional)
                </label>
                <textarea
                  id="request-message"
                  rows={4}
                  value={form.message}
                  onChange={update("message")}
                  placeholder={
                    pet.status === "rent"
                      ? "Tell the owner your plan for the day..."
                      : "Tell the owner why you are interested..."
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-beige-dark/50 text-sm bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Submitting Request..."
                  : pet.status === "rent"
                    ? "Confirm Rent Request"
                    : "Send Inquiry"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
