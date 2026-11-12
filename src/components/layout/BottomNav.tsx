import { useEffect, useState, type ComponentProps, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bag2, Category, Home2, ProfileCircle, type Icon } from "iconsax-react";
import { TabBar } from "glisse";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useShop } from "@/context/ShopContext";
import { useLocale } from "@/hooks/useLocale";

const COMPACT_QUERY = "(max-width: 1023px)";

const TAB_BAR_STYLE = {
  "--lg-tab-selected": "#ba1f79",
} as CSSProperties;

function TabIcon({ icon: IconGlyph }: { icon: Icon }) {
  return (
    <IconGlyph size={20} color="currentColor" variant="Linear" aria-hidden />
  );
}

function TabLink({
  href,
  ...props
}: { href: string } & Omit<ComponentProps<typeof Link>, "to">) {
  return <Link to={href} {...props} />;
}

function useCompactLayout() {
  const [compact, setCompact] = useState(
    () => window.matchMedia(COMPACT_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(COMPACT_QUERY);
    const onChange = () => setCompact(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);
    return () => {
      media.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);

  return compact;
}

const BottomNav = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { cartCount } = useShop();
  const { pathFor } = useLocale();
  const location = useLocation();
  const compact = useCompactLayout();
  const isAdmin = location.pathname.startsWith("/admin");

  if (!compact || isAdmin) return null;

  const rest = location.pathname.replace(/^\/(en|ka)(?=\/|$)/, "") || "/";
  const active = rest === "/"
    ? "home"
    : rest.startsWith("/collections")
      ? "categories"
      : rest.startsWith("/cart")
        ? "cart"
        : rest.startsWith("/profile") || rest.startsWith("/login")
          ? "profile"
          : null;

  return (
    <div className="mobile-tab-bar-dock pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="relative flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-2">
        <TabBar
          className="mobile-tab-bar pointer-events-auto"
          data-theme="light"
          aria-label={t("tabs.label")}
          link={TabLink}
          value={active}
          style={TAB_BAR_STYLE}
          items={[
            {
              value: "home",
              label: t("tabs.home"),
              href: pathFor("/"),
              icon: <TabIcon icon={Home2} />,
            },
            {
              value: "categories",
              label: t("tabs.categories"),
              href: pathFor("/collections"),
              icon: (
                <TabIcon icon={Category} />
              ),
            },
            {
              value: "cart",
              label: t("tabs.cart"),
              href: pathFor("/cart"),
              icon: (
                <span className="relative inline-flex">
                  <TabIcon icon={Bag2} />
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-medium leading-none text-background">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </span>
              ),
            },
            {
              value: "profile",
              label: t("tabs.profile"),
              href: user ? pathFor("/profile") : pathFor("/login"),
              icon: (
                <TabIcon icon={ProfileCircle} />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default BottomNav;
