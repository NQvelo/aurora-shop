import { Link } from 'react-router-dom';
import heroAW1 from '@/assets/hero-aw25-1.jpg';
import heroAW2 from '@/assets/hero-aw25-2.jpg';

const HeroSection = () => {
  return (
    <section className="hero-split">
      {/* Left Panel - AW25 Image 1 */}
      <div className="hero-panel relative min-h-[50vh] md:min-h-[calc(100vh-var(--top-bar-height)-var(--header-height))]">
        <img
          src={heroAW1}
          alt="Autumn Winter 2025 Collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="hero-panel-content">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-2 opacity-80">
            New Season
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wide mb-4">
            Autumn/Winter 2025
          </h2>
        </div>
      </div>

      {/* Right Panel - AW25 Image 2 */}
      <div className="hero-panel relative min-h-[50vh] md:min-h-[calc(100vh-var(--top-bar-height)-var(--header-height))]">
        <img
          src={heroAW2}
          alt="Autumn Winter 2025 Collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="hero-panel-content">
          <Link
            to="/collections/aw25"
            className="btn-luxury bg-white/90 text-black hover:bg-white"
          >
            Shop the Collection
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
