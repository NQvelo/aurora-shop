import { Link } from 'react-router-dom';
import heroAW1 from '@/assets/hero-aw25-1.jpg';
import heroAW2 from '@/assets/hero-aw25-2.jpg';

const CollectionSection = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel - SS25 */}
      <div className="relative min-h-[60vh] md:min-h-[80vh] overflow-hidden group">
        <img
          src={heroAW1}
          alt="Spring Summer 2025 Collection"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-2 opacity-80">
            Coming Soon
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl tracking-wide mb-6 text-center">
            Spring/Summer 2025
          </h2>
          <Link
            to="/collections/ss25"
            className="btn-luxury border border-white bg-transparent text-white hover:bg-white hover:text-black"
          >
            Preview Collection
          </Link>
        </div>
      </div>

      {/* Right Panel - Editorial Image */}
      <div className="relative min-h-[60vh] md:min-h-[80vh] overflow-hidden group">
        <img
          src={heroAW2}
          alt="Spring Summer 2025 Editorial"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover:bg-black/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-end text-white p-8 pb-12">
          <p className="text-[11px] uppercase tracking-[0.2em] font-light">
            Effortless Summer Elegance
          </p>
        </div>
      </div>
    </section>
  );
};

export default CollectionSection;
