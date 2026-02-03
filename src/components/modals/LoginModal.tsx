import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useShop } from "@/context/ShopContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const LoginModal = () => {
  const { isLoginOpen, setIsLoginOpen } = useShop();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isLoginOpen) return null;

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

        // Check if user is admin
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
      }
      setIsLoginOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="drawer-overlay animate-fade-in"
        onClick={() => setIsLoginOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background w-full max-w-md p-8 animate-slide-up relative text-foreground">
          <button
            onClick={() => setIsLoginOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-muted transition-colors rounded-full"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="font-display text-2xl mb-2 lowercase italic">
            {isLogin ? "Sign in" : "Create Account"}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {isLogin
              ? "Welcome back to Aurora"
              : "Join us for exclusive offers and updates"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-transparent text-sm focus:outline-none focus:border-foreground transition-colors"
                required
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="btn-luxury-primary w-full mt-6"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : isLogin
                ? "Sign in"
                : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 underline hover:text-foreground transition-colors"
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
