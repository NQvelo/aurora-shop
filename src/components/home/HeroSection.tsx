import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroAW1 from "@/assets/hero-aw25-1.jpg";
import heroAW2 from "@/assets/hero-aw25-2.jpg";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/hooks/useLocale";

interface HomeSettings {
  left_title: string;
  left_subtitle: string;
  left_image: string;
  right_image: string;
  cta_text: string;
  cta_link: string;
}

const HeroSection = () => {
  const { pathFor } = useLocale();
  const [settings, setSettings] = useState<HomeSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from("home_settings")
        .select("*")
        .limit(1)
        .single();
      if (data) {
        setSettings({
          left_title: data.left_title || "Autumn/Winter 2025",
          left_subtitle: data.left_subtitle || "New Season",
          left_image: data.left_image || "",
          right_image: data.right_image || "",
          cta_text: data.cta_text || "Shop the Collection",
          cta_link: data.cta_link || "/collections/aw25",
        });
      }
    };

    loadSettings();
  }, []);

  const leftImage = settings?.left_image || heroAW1;
  const rightImage = settings?.right_image || heroAW2;
  const leftSubtitle = settings?.left_subtitle || "New Season";
  const leftTitle = settings?.left_title || "Autumn/Winter 2025";
  const ctaText = settings?.cta_text || "Shop the Collection";
  const ctaLink = settings?.cta_link || "/collections/aw25";

  return (
    <section className="hero-split">
      {/* Left Panel - AW25 Image 1 */}
      <div className="hero-panel relative min-h-[50vh] md:min-h-[calc(100vh-var(--top-bar-height)-var(--header-height))]">
        <img
          src={leftImage}
          alt="Autumn Winter 2025 Collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        <div className="hero-panel-content font-body">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-2 opacity-90 text-white drop-shadow-lg">
            {leftSubtitle}
          </p>
          <h2 className="font-body text-3xl md:text-4xl lg:text-5xl font-normal mb-4 text-white drop-shadow-lg">
            {leftTitle}
          </h2>
        </div>
      </div>

      {/* Right Panel - AW25 Image 2 */}
      <div className="hero-panel relative min-h-[50vh] md:min-h-[calc(100vh-var(--top-bar-height)-var(--header-height))]">
        <img
          src={rightImage}
          alt="Autumn Winter 2025 Collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/30 to-black/20" />
        <div className="hero-panel-content font-body">
          <Link
            to={pathFor(ctaLink)}
            className="btn-luxury bg-white/95 text-black hover:bg-white shadow-lg"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
