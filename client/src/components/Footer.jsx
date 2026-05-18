import { Link } from 'react-router-dom';
import { PawIcon, DogIcon, CatIcon, RabbitIcon, BirdIcon } from '../icons';

const footerLinks = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Buy / Adopt', to: '/buy-adopt' },
      { label: 'Rent‑a‑Friend', to: '/rent-a-friend' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Meet a Vet', to: '/meet-a-vet' },
      { label: 'Stray Feed', to: '/stray-feed' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Login', to: '/login' },
      { label: 'Sign Up', to: '/signup' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-beige/60 to-beige-dark/50 border-t border-beige-dark/15">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group mb-5">
              <PawIcon className="w-7 h-7 text-primary group-hover:text-primary-dark transition-colors" />
              <span className="text-lg font-bold text-primary-dark group-hover:text-primary-deeper transition-colors">
                Pet Connect
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Connecting loving hearts with furry friends. Adopt, rent, or care
              — every pet deserves love.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold text-primary-dark uppercase tracking-widest mb-4">
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-500 hover:text-primary-dark transition-all duration-200 inline-block hover:translate-x-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-beige-darker/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Pet Connect. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[DogIcon, CatIcon, RabbitIcon, BirdIcon].map((Icon, i) => (
              <Icon
                key={i}
                className="w-5 h-5 text-beige-darker hover:text-primary transition-colors duration-200 cursor-default"
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
