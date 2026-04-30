import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";

/* Corner star SVG component matching the logo design */
function CornerStar({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="16,0 18,12 32,16 18,20 16,32 14,20 0,16 14,12" />
      <polygon points="16,4 17.5,14 28,16 17.5,18 16,28 14.5,18 4,16 14.5,14" opacity="0.6" />
    </svg>
  );
}

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background text-ink-green">
      {/* Decorative borders — matching logo theme */}
      <div className="page-frame" />
      <CornerStar className="corner-star corner-star--tl" />
      <CornerStar className="corner-star corner-star--tr" />
      <CornerStar className="corner-star corner-star--bl" />
      <CornerStar className="corner-star corner-star--br" />

      <div className="relative z-10 text-center flex flex-col items-center">
        <img
          src="/logo.png"
          alt="Inkopia"
          className="w-[160px] md:w-[220px] h-auto mb-8"
        />
        <div className="gold-divider visible mb-6 mx-auto" />
        <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-sans mb-3">
          Page Not Found
        </p>
        <h1 className="mb-4 text-5xl md:text-7xl font-serif font-bold leading-[0.95]">
          404
        </h1>
        <p className="mb-8 text-sm text-muted-foreground font-sans font-light max-w-xs">
          The page you are looking for does not exist in our vault.
        </p>
        <Link
          to="/"
          className="btn-inkopia bg-primary text-primary-foreground px-10 py-3 text-xs font-sans tracking-[0.3em] uppercase relative z-10"
        >
          Return to Experience
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
