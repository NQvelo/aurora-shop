import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import BestsellersSection from "@/components/home/BestsellersSection";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        if (!error && data?.is_admin) {
          navigate("/admin/orders");
        }
      }
    };
    checkAdmin();
  }, [user, navigate]);

  return (
    <Layout>
      <HeroSection />
      <BestsellersSection />
    </Layout>
  );
};

export default Index;
