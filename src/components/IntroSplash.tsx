import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";

const HOLD_MS = 1700;
const FADE_MS = 600;

const IntroSplash = () => {
  const { pathname } = useLocation();
  const [phase, setPhase] = useState<"in" | "out" | "done">("in");
  const skip = pathname.startsWith("/admin");

  useEffect(() => {
    if (skip) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const hold = window.setTimeout(() => setPhase("out"), HOLD_MS);
    const done = window.setTimeout(() => {
      document.body.style.overflow = previousOverflow;
      setPhase("done");
    }, HOLD_MS + FADE_MS);

    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(done);
      document.body.style.overflow = previousOverflow;
    };
  }, [skip]);

  if (phase === "done" || skip) return null;

  return (
    <div
      className={`intro-splash ${phase === "out" ? "intro-splash-out" : ""}`}
      aria-hidden="true"
    >
      <img src={logo} alt="" className="intro-splash-logo" />
    </div>
  );
};

export default IntroSplash;
