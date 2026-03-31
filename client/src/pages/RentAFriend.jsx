import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HeartHandIcon,
  DogIcon,
  CatIcon,
  RabbitIcon,
  BirdIcon,
  PawIcon,
} from "../icons";
import { apiRequest } from "../lib/api";

const iconMap = {
  dog: DogIcon,
  cat: CatIcon,
  rabbit: RabbitIcon,
  bird: BirdIcon,
  other: PawIcon,
};

const formatRate = (price) => {
  const inr = new Intl.NumberFormat("en-IN");
  return `Rs. ${inr.format(price || 0)} / day`;
};

export default function RentAFriend() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadFriends = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest("/api/pets?status=rent&limit=60", {
          signal: controller.signal,
        });
        setFriends(data.pets || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load rent listings");
        }
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
    return () => controller.abort();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 animate-fade-in-up">
      <div className="text-center mb-14">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
          <HeartHandIcon className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Rent‑a‑Friend
        </h1>
        <p className="mt-3 text-gray-500 max-w-xl mx-auto">
          Not ready to commit? Spend a day with a furry companion and brighten
          both your lives.
        </p>
      </div>

      {loading && (
        <div className="text-center py-14 text-gray-400">
          Loading companions...
        </div>
      )}

      {!loading && error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && friends.length === 0 && (
        <div className="text-center py-14 text-gray-400">
          No rent listings are available right now.
        </div>
      )}

      {!loading && !error && friends.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {friends.map((f) => {
            const Icon = iconMap[f.species] || PawIcon;
            return (
              <div
                key={f._id}
                className="group p-6 bg-white/50 backdrop-blur-md rounded-2xl border border-beige-dark/20 shadow-sm hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 mx-auto flex items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon className="w-7 h-7" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {f.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {f.breed} · {f.age}
                </p>
                <p className="mt-3 text-lg font-bold text-primary-dark">
                  {formatRate(f.price)}
                </p>
                <Link
                  to={`/pets/${f._id}`}
                  className="mt-5 inline-block w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98]"
                >
                  Book a Day
                </Link>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
