import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/hooks/useLocale";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

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
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
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
      } else {
        setSettings({
          left_title: "Autumn/Winter 2025",
          left_subtitle: "New Season",
          left_image: "",
          right_image: "",
          cta_text: "Shop the Collection",
          cta_link: "/collections/aw25",
        });
      }
      setLoading(false);
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    const timer = window.setInterval(() => api.scrollNext(), 5000);
    return () => {
      api.off("select", onSelect);
      window.clearInterval(timer);
    };
  }, [api]);

  const leftSubtitle = settings?.left_subtitle ?? "New Season";
  const leftTitle = settings?.left_title ?? "Autumn/Winter 2025";
  const ctaText = settings?.cta_text ?? "Shop the Collection";
  const ctaLink = settings?.cta_link ?? "/collections/aw25";
  const slides = [
    { image: settings?.left_image ?? "", key: "left" },
    { image: settings?.right_image ?? "", key: "right" },
  ];

  if (loading) {
    return (
      <section className="h-[70vh] bg-muted animate-pulse md:h-[78vh]" />
    );
  }

  return (
    <section className="relative">
      <Carousel opts={{ loop: true }} setApi={setApi}>
        <CarouselContent className="ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.key} className="basis-full pl-0">
              <div className="relative h-[70vh] md:h-[78vh]">
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/45" />
                <div className="absolute inset-x-0 bottom-16 z-10 px-8 font-body text-white md:px-12">
                  {index === 0 ? (
                    <>
                      <p className="mb-2 text-[10px] uppercase tracking-[0.25em] opacity-90 drop-shadow-lg">
                        {leftSubtitle}
                      </p>
                      <h2 className="font-body text-3xl font-normal drop-shadow-lg md:text-4xl lg:text-5xl">
                        {leftTitle}
                      </h2>
                    </>
                  ) : (
                    <Link
                      to={pathFor(ctaLink)}
                      className="btn-luxury bg-white/95 text-black shadow-lg hover:bg-white"
                    >
                      {ctaText}
                    </Link>
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.key}
            type="button"
            aria-label={`Slide ${index + 1}`}
            onClick={() => api?.scrollTo(index)}
            className={`h-0.5 w-6 ${index === current ? "bg-white" : "bg-white/45"}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
