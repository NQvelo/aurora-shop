import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocale } from "@/hooks/useLocale";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const { pathFor, switchLanguage } = useLocale();
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    setEmail("");
    alert(t("footer.subscribe") + "!");
  };

  return (
    <footer className="luxury-footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Customer Service */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] mb-6 font-normal">
              {t("footer.customerService")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to={pathFor("/shipping")}
                  className="text-sm font-light text-background/70 hover:text-background transition-colors"
                >
                  {t("footer.shipping")}
                </Link>
              </li>
              <li>
                <Link
                  to={pathFor("/returns")}
                  className="text-sm font-light text-background/70 hover:text-background transition-colors"
                >
                  {t("footer.returns")}
                </Link>
              </li>
              <li>
                <Link
                  to={pathFor("/contact")}
                  className="text-sm font-light text-background/70 hover:text-background transition-colors"
                >
                  {t("footer.contactUs")}
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] mb-6 font-normal">
              {t("footer.about")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to={pathFor("/about")}
                  className="text-sm font-light text-background/70 hover:text-background transition-colors"
                >
                  {t("footer.ourStory")}
                </Link>
              </li>
              <li>
                <Link
                  to={pathFor("/stockists")}
                  className="text-sm font-light text-background/70 hover:text-background transition-colors"
                >
                  {t("footer.stockists")}
                </Link>
              </li>
              <li>
                <Link
                  to={pathFor("/careers")}
                  className="text-sm font-light text-background/70 hover:text-background transition-colors"
                >
                  {t("footer.careers")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] mb-6 font-normal">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to={pathFor("/terms")}
                  className="text-sm font-light text-background/70 hover:text-background transition-colors"
                >
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link
                  to={pathFor("/privacy")}
                  className="text-sm font-light text-background/70 hover:text-background transition-colors"
                >
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.15em] mb-6 font-normal">
              {t("footer.newsletter")}
            </h4>
            <p className="text-sm font-light text-background/70 mb-4">
              {t("footer.newsletterDesc")}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.enterEmail")}
                className="flex-1 bg-transparent border-b border-background/30 py-2 text-sm font-light placeholder:text-background/50 focus:outline-none focus:border-background transition-colors"
                required
              />
              <button
                type="submit"
                className="ml-4 text-[11px] uppercase tracking-[0.15em] hover:text-background/70 transition-colors"
              >
                {t("footer.subscribe")}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-background/20 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Language */}
          <div className="flex items-center gap-6 font-body text-xs uppercase tracking-[0.2em] text-background/70">
            <select
              value={i18n.language}
              onChange={(e) => switchLanguage(e.target.value)}
              className="bg-transparent font-body text-xs uppercase tracking-[0.2em] text-background/70 focus:outline-none cursor-pointer"
            >
              <option value="en">EN</option>
              <option value="ka">KA</option>
            </select>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-background/70 transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-background/70 transition-colors"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-background/70 transition-colors"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-[11px] text-background/50 tracking-wider">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
