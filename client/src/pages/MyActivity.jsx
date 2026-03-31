import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarIcon, PawIcon, UsersIcon } from "../icons";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const appointmentTag = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  confirmed: "bg-blue-50 text-blue-600 border-blue-200",
  completed: "bg-green-50 text-green-600 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const inquiryTag = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  accepted: "bg-blue-50 text-blue-600 border-blue-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  cancelled: "bg-gray-50 text-gray-600 border-gray-200",
  completed: "bg-green-50 text-green-600 border-green-200",
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

export default function MyActivity() {
  const { token, user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [myInquiries, setMyInquiries] = useState([]);
  const [ownerInquiries, setOwnerInquiries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const requests = [
        apiRequest("/api/vets/appointments?limit=20", { token }),
        apiRequest("/api/pets/my/inquiries?limit=20", { token }),
      ];

      if (user?.role === "owner") {
        requests.push(
          apiRequest("/api/pets/owner/inquiries?limit=20", { token }),
        );
      }

      const [appointmentsData, myInquiriesData, ownerInquiriesData] =
        await Promise.all(requests);

      setAppointments(appointmentsData.appointments || []);
      setMyInquiries(myInquiriesData.inquiries || []);
      setOwnerInquiries(ownerInquiriesData?.inquiries || []);
    } catch (err) {
      setError(err.message || "Unable to load your activity feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.role]);

  const cancelAppointment = async (appointmentId) => {
    setCancelingId(appointmentId);

    try {
      await apiRequest(`/api/vets/appointments/${appointmentId}/cancel`, {
        method: "PATCH",
        token,
      });

      setAppointments((prev) =>
        prev.map((item) =>
          item._id === appointmentId ? { ...item, status: "cancelled" } : item,
        ),
      );
    } catch (err) {
      setError(err.message || "Failed to cancel appointment");
    } finally {
      setCancelingId("");
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-400">
        Loading your activity...
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Activity</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your vet appointments and buy/rent requests in one place.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-beige-dark/20 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-beige-dark/20 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">
              My Vet Appointments
            </h2>
          </div>

          <div className="p-5 space-y-3">
            {appointments.length === 0 ? (
              <p className="text-sm text-gray-400">No appointments yet.</p>
            ) : (
              appointments.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-beige-dark/20 bg-white/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.vet?.name || item.vetName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(item.date)} at {item.time}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Pet: {item.petName || "Not specified"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${appointmentTag[item.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
                      >
                        {item.status}
                      </span>

                      {["pending", "confirmed"].includes(item.status) ? (
                        <button
                          type="button"
                          onClick={() => cancelAppointment(item._id)}
                          disabled={cancelingId === item._id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                        >
                          {cancelingId === item._id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-beige-dark/20 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-beige-dark/20 flex items-center gap-2">
            <PawIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">
              My Buy/Rent Requests
            </h2>
          </div>

          <div className="p-5 space-y-3">
            {myInquiries.length === 0 ? (
              <p className="text-sm text-gray-400">No pet inquiries yet.</p>
            ) : (
              myInquiries.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-beige-dark/20 bg-white/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {item.pet?.name || "Pet"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Type: {item.type} · Sent on {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${inquiryTag[item.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {user?.role === "owner" ? (
          <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-beige-dark/20 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-beige-dark/20 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">
                Requests on My Listings
              </h2>
            </div>

            <div className="p-5 space-y-3">
              {ownerInquiries.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No incoming requests yet.
                </p>
              ) : (
                ownerInquiries.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl border border-beige-dark/20 bg-white/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.pet?.name || "Pet"} request
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          From: {item.user?.name || "User"} · {item.type} ·{" "}
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${inquiryTag[item.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-8">
        <Link
          to="/buy-adopt"
          className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          Explore more pets
        </Link>
      </div>
    </section>
  );
}
