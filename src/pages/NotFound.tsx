import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <h1 className="font-display text-6xl md:text-8xl mb-4">404</h1>
        <p className="text-muted-foreground text-sm mb-8">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="btn-luxury-outline">
          Return Home
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
