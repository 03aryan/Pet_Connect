import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarIcon, ClockIcon, StethoscopeIcon, UsersIcon } from "../icons";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const statusStyles = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  confirmed: "bg-blue-50 text-blue-600 border-blue-200",
  completed: "bg-green-50 text-green-600 border-green-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const statusOptions = ["pending", "confirmed", "completed", "cancelled"];

const formatDate = (value) => {
  if (!value) return "N/A";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function VetDashboard() {
  const { token, user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const stats = useMemo(() => {
    const pending = appointments.filter(
      (item) => item.status === "pending",
    ).length;
    const confirmed = appointments.filter(
      (item) => item.status === "confirmed",
    ).length;
    const completed = appointments.filter(
      (item) => item.status === "completed",
    ).length;

    return {
      total: appointments.length,
      pending,
      confirmed,
      completed,
    };
  }, [appointments]);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [profileData, appointmentsData] = await Promise.all([
        apiRequest("/api/vets/me/profile", { token }),
        apiRequest("/api/vets/me/appointments?limit=50", { token }),
      ]);

      setProfile(profileData.vet || null);
      setAppointments(appointmentsData.appointments || []);
    } catch (err) {
      setError(err.message || "Unable to load vet dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const updateStatus = async (appointmentId, status) => {
    setUpdatingId(appointmentId);

    try {
      await apiRequest(`/api/vets/appointments/${appointmentId}/status`, {
        method: "PATCH",
        token,
        body: { status },
      });

      setAppointments((prev) =>
        prev.map((item) =>
          item._id === appointmentId ? { ...item, status } : item,
        ),
      );
    } catch (err) {
      setError(err.message || "Failed to update appointment status");
    } finally {
      setUpdatingId("");
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-400">
        Loading vet dashboard...
      </section>
    );
  }

  if (error && !profile) {
    return (
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </div>

        <div className="mt-6">
          <Link
            to="/vet/onboard"
            className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            Complete vet onboarding first
          </Link>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          No Vet Profile Found
        </h1>
        <p className="text-gray-500 mb-5">
          Set up your profile to start receiving appointments.
        </p>
        <Link
          to="/vet/onboard"
          className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
        >
          Start Vet Onboarding
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vet Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome, {user?.name || profile.user?.name}. Manage your profile and
            appointments here.
          </p>
        </div>

        <Link
          to="/vet/onboard"
          className="px-5 py-2.5 text-sm font-semibold text-primary-dark border border-primary/50 rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
        >
          Edit Vet Profile
        </Link>
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Appointments",
            value: stats.total,
            icon: <CalendarIcon className="w-5 h-5" />,
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: <ClockIcon className="w-5 h-5" />,
          },
          {
            label: "Confirmed",
            value: stats.confirmed,
            icon: <UsersIcon className="w-5 h-5" />,
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: <StethoscopeIcon className="w-5 h-5" />,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white/60 backdrop-blur-md rounded-2xl border border-beige-dark/20 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2 text-primary">
              {card.icon}
              <span className="text-2xl font-bold text-primary-dark">
                {card.value}
              </span>
            </div>
            <p className="text-xs uppercase tracking-wider text-gray-400">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-beige-dark/20 shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
        <div className="p-6 border-b border-beige-dark/20">
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming and Recent Appointments
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {appointments.length === 0 ? (
            <p className="text-sm text-gray-400">
              No appointments assigned yet.
            </p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="rounded-xl border border-beige-dark/20 bg-white/70 p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {appointment.user?.name || "Pet Parent"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(appointment.date)} at {appointment.time}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Pet: {appointment.petName || "Not specified"}
                    </p>
                    {appointment.notes ? (
                      <p className="text-xs text-gray-500 mt-1 max-w-xl">
                        Notes: {appointment.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${statusStyles[appointment.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}
                    >
                      {appointment.status}
                    </span>

                    <select
                      value={appointment.status}
                      onChange={(event) =>
                        updateStatus(appointment._id, event.target.value)
                      }
                      disabled={updatingId === appointment._id}
                      className="px-3 py-1.5 text-xs rounded-lg border border-beige-dark/40 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
