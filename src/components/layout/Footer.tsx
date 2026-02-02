import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import { useState } from 'react';
import { useShop } from '@/context/ShopContext';
import { currencies, countries } from '@/data/products';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { currency, setCurrency, country, setCountry } = useShop();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    setEmail('');
    alert('Thank you for subscribing!');
  };

  return (
    <footer className="luxury-footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Customer Service */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] mb-6 font-medium">
              Customer Service
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/shipping" className="text-sm font-light text-background/70 hover:text-background transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm font-light text-background/70 hover:text-background transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm font-light text-background/70 hover:text-background transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] mb-6 font-medium">
              About
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-sm font-light text-background/70 hover:text-background transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/stockists" className="text-sm font-light text-background/70 hover:text-background transition-colors">
                  Stockists
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-sm font-light text-background/70 hover:text-background transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] mb-6 font-medium">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-sm font-light text-background/70 hover:text-background transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm font-light text-background/70 hover:text-background transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] mb-6 font-medium">
              Newsletter
            </h4>
            <p className="text-sm font-light text-background/70 mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-transparent border-b border-background/30 py-2 text-sm font-light placeholder:text-background/50 focus:outline-none focus:border-background transition-colors"
                required
              />
              <button
                type="submit"
                className="ml-4 text-[11px] uppercase tracking-[0.15em] hover:text-background/70 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-background/20 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Currency & Country */}
          <div className="flex items-center gap-6">
            <select
              value={currency.code}
              onChange={(e) => setCurrency(currencies.find(c => c.code === e.target.value)!)}
              className="bg-transparent text-[11px] uppercase tracking-[0.1em] text-background/70 focus:outline-none cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code} className="text-foreground">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <select
              value={country.code}
              onChange={(e) => setCountry(countries.find(c => c.code === e.target.value)!)}
              className="bg-transparent text-[11px] uppercase tracking-[0.1em] text-background/70 focus:outline-none cursor-pointer"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code} className="text-foreground">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-background/70 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-background/70 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-background/70 transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-[11px] text-background/50 tracking-wider">
            © {new Date().getFullYear()} Your Brand. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
