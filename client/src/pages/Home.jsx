import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import ThreeHero from '../components/ThreeHero';
import { PawIcon, HomeIcon, HeartHandIcon, StethoscopeIcon, BowlIcon } from '../icons';

const features = [
  {
    Icon: HomeIcon,
    title: 'Buy / Adopt',
    desc: 'Find your perfect companion from verified breeders and shelters.',
    to: '/buy-adopt',
    color: 'from-blue-400 to-primary',
  },
  {
    Icon: HeartHandIcon,
    title: 'Rent‑a‑Friend',
    desc: "Trusted caretakers who'll love your pet while you're away.",
    to: '/rent-a-friend',
    color: 'from-pink-400 to-rose-500',
  },
  {
    Icon: StethoscopeIcon,
    title: 'Meet a Vet',
    desc: 'Online & in-person consultations with specialized, trusted vets.',
    to: '/meet-a-vet',
    color: 'from-teal-400 to-primary-dark',
  },
  {
    Icon: BowlIcon,
    title: 'Stray Feed',
    desc: 'Help strays near you by organising community feeds.',
    to: '/stray-feed',
    color: 'from-amber-400 to-orange-500',
  },
];

const stats = [
  { value: '2,500+', label: 'Happy Pets' },
  { value: '500+',   label: 'Verified Vets' },
  { value: '1,200+', label: 'Caretakers' },
  { value: '98%',    label: 'Satisfaction Rate' },
];

const steps = [
  { num: '01', title: 'Create an Account', desc: 'Sign up in seconds — free forever.' },
  { num: '02', title: 'Browse Listings',   desc: 'Explore pets, vets, and caretakers near you.' },
  { num: '03', title: 'Book Instantly',    desc: 'Schedule a vet, rent a friend, or adopt a pet.' },
  { num: '04', title: 'Enjoy Together',    desc: 'Build a loving community around every pet.' },
];

const testimonials = [
  {
    name: 'Priya Mehta',
    role: 'Dog Mom · Mumbai',
    text: '"Found the most wonderful caretaker for my labrador Bruno while I was travelling to Goa. He came back even happier than before!"',
    avatar: 'PM',
  },
  {
    name: 'Arjun Sharma',
    role: 'Cat Dad · Delhi',
    text: '"Booked a vet consultation in 2 minutes flat. The specialist knew exactly what was wrong with my Persian cat. Incredible service!"',
    avatar: 'AS',
  },
  {
    name: 'Sneha Joshi',
    role: 'Rescue Volunteer · Pune',
    text: '"The Stray Feed feature helped our NGO coordinate over 400 community feeds in one month. Pet Connect is a blessing!"',
    avatar: 'SJ',
  },
];

// Scroll reveal hook
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible'); },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function StatCard({ value, label, delay }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal text-center" style={{ transitionDelay: delay }}>
      <p className="text-3xl sm:text-4xl font-extrabold gradient-text">{value}</p>
      <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
    </div>
  );
}

export default function Home() {
  const featRef  = useReveal();
  const stepsRef = useReveal();
  const testRef  = useReveal();
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const id = setInterval(
      () => setTestimonialIdx((i) => (i + 1) % testimonials.length),
      4000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* ─── Hero ─────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Three.js background */}
        <ThreeHero className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Soft vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-surface/30 via-transparent to-surface/80 pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur border border-beige-dark/25 text-xs font-semibold text-primary-dark shadow-sm mb-8 animate-fade-in-down">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
            India's #1 Pet Community Platform
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight animate-fade-in-up">
            Every Pet Deserves
            <br />
            <span className="gradient-text animate-gradient">
              A Loving Home
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-500 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Buy, adopt, find a caretaker, consult a specialist vet, or feed a
            stray — all in one warm, furry community.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/buy-adopt"
              className="px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary to-primary-dark rounded-2xl shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:from-primary-dark hover:to-primary-deeper transition-all duration-300 active:scale-95"
            >
              🐾 Explore Pets
            </Link>
            <Link
              to="/rent-a-friend"
              className="px-8 py-4 text-base font-semibold text-primary-dark border-2 border-primary/50 bg-white/60 backdrop-blur rounded-2xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 active:scale-95"
            >
              🏡 Find a Caretaker
            </Link>
          </div>
        </div>

        {/* Animated scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-float opacity-60">
          <div className="w-5 h-8 rounded-full border-2 border-primary-dark flex items-start justify-center pt-1">
            <div className="w-1 h-2 rounded-full bg-primary-dark animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────── */}
      <section className="py-16 bg-white/60 backdrop-blur border-y border-beige-dark/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
            {stats.map((s, i) => (
              <StatCard
                key={s.label}
                value={s.value}
                label={s.label}
                delay={`${i * 0.1}s`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature cards ────────────────────────── */}
      <section ref={featRef} className="reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Everything Your Pet Needs
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            A complete ecosystem built around the well-being of every furry, feathered, and fuzzy friend.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-grid">
          {features.map(({ Icon, title, desc, to, color }) => (
            <Link
              key={to}
              to={to}
              className="group glass-card animate-fade-in-up rounded-2xl p-6 flex flex-col"
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
              <span className="mt-4 text-xs font-semibold text-primary-dark flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-beige-light/40 via-white/60 to-secondary-light/30">
        <div ref={stepsRef} className="reveal mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">How It Works</h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              Getting started takes less than a minute.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className="text-center group">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-md border border-beige-dark/20 flex items-center justify-center text-xl font-extrabold text-primary-dark group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-4">
                  {s.num}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────── */}
      <section ref={testRef} className="reveal mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Loved by Pet Families 🐶
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 stagger-grid">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`glass-card animate-fade-in-up rounded-2xl p-6 flex flex-col gap-4 transition-all duration-500 ${
                i === testimonialIdx ? 'ring-2 ring-primary/30 shadow-xl shadow-primary/10' : ''
              }`}
            >
              <p className="text-sm text-gray-600 leading-relaxed italic flex-1">{t.text}</p>
              <div className="flex items-center gap-3 pt-3 border-t border-beige-dark/15">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setTestimonialIdx(i)}
              className={`rounded-full transition-all duration-300 ${
                i === testimonialIdx
                  ? 'w-6 h-2 bg-primary'
                  : 'w-2 h-2 bg-beige-dark hover:bg-primary/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ───────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary via-primary-dark to-primary-deeper p-12 text-center text-white shadow-2xl shadow-primary/30">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/5 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-1/4 translate-y-1/4" />

          <div className="relative">
            <PawIcon className="w-12 h-12 mx-auto mb-5 opacity-90 animate-float" />
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
              Join the Pet Connect Family
            </h2>
            <p className="max-w-xl mx-auto opacity-85 text-lg mb-8">
              Thousands of pet parents trust us every day. Your journey starts here.
            </p>
            <Link
              to="/signup"
              className="inline-block px-10 py-4 bg-white text-primary-dark font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:bg-beige-light transition-all duration-300 active:scale-95"
            >
              Get Started — It's Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
