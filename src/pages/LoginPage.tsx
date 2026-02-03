import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/lib/supabase";
import heroAW from "@/assets/hero-aw25-1.jpg";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data: authData, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });
        if (error) throw error;

        if (authData.user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", authData.user.id)
            .single();

          if (profileData?.is_admin) {
            toast.success("Admin access granted");
            navigate("/admin/orders");
          } else {
            toast.success("Successfully signed in");
            navigate("/");
          }
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (error) throw error;
        toast.success("Registration successful. Please check your email.");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-var(--header-height))] grid md:grid-cols-2">
        {/* Left side: form */}
        <div className="flex flex-col justify-center px-8 lg:px-16 py-12 max-w-md w-full mx-auto">
          <h1 className="font-body text-2xl md:text-3xl mb-8 font-normal">
            {isLogin ? "Welcome Back!" : "Create your account"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="form-label text-[11px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors"
                  required
                />
              </div>
            )}

            <div>
              <label className="form-label text-[11px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors"
                required
              />
            </div>

            <div>
              <label className="form-label text-[11px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full border border-foreground text-[11px] uppercase tracking-[0.2em] py-3 hover:bg-foreground hover:text-background transition-colors"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : isLogin
                ? "Continue"
                : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            <button
              type="button"
              onClick={() => setIsLogin((prev) => !prev)}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {isLogin ? "Create account" : "Back to sign in"}
            </button>
          </div>
        </div>

        {/* Right side: hero image */}
        <div className="hidden md:block relative">
          <img
            src={heroAW}
            alt="Aurora campaign"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
