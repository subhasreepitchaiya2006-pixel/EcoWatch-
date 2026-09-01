import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "../hooks/useForm";
import { usePasswordToggle } from "../hooks/usePasswordToggle";
import { useAuth } from "../context/AuthContext";

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function SignInPage() {
  const navigate = useNavigate();
  const { values, handleChange } = useForm({ email: "", password: "" });
  const { inputType, iconName, toggleVisibility } = usePasswordToggle();
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(values);
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <img
          alt="World map background"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida/AP1WRLt8oK3SXjG0va2rnKGk7tnx9DYQzlP719oENSpMqNANTbA316S8WAaEVzz6k83CDLW6a6QvC-ddK1cw91ktihKxhZgmj_3dyBFp16hkFpOUu-uXckj9GIDRWfT6Fg7WjMYYd_KjCr7rmdrO_seOHtyMlAP15PUsYUUwdq9SExWkAF0Ml_0W212DUFOvgw0wSbfGXydC1FTnfTjQhPZ9TrtqrX0m3qssT8GjkEajvJ2cLexO9xx2r8pwL5k"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/80 via-surface-container-lowest/40 to-transparent backdrop-blur-[4px]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row w-full max-w-[1440px] mx-auto px-6 lg:px-16 pt-12 pb-24">
        <div className="flex-1 flex flex-col justify-center lg:pr-12 mb-12 lg:mb-0">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">EcoWatch Intelligence</h1>
          </div>
          <h2 className="text-[48px] leading-tight font-bold text-on-surface mb-6 max-w-[600px]">
            The Future of <br /><span className="text-primary">Planetary Resilience.</span>
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-[480px] leading-relaxed">
            Access high-resolution satellite intelligence, real-time disaster alerts, and clinical air quality analytics through our enterprise geospatial engine.
          </p>
          <div className="flex gap-4">
            <div className="glass-card p-4 rounded-xl border border-white/40 shadow-sm w-[160px]">
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">PRECISION</div>
              <div className="font-headline-sm text-headline-sm text-on-surface leading-tight">0.5m<br />Resolution</div>
            </div>
            <div className="glass-card p-4 rounded-xl border border-white/40 shadow-sm w-[160px]">
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">UPDATE RATE</div>
              <div className="font-headline-sm text-headline-sm text-on-surface leading-tight">Real-time<br />Feed</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-8 md:p-10 border border-outline-variant/30 relative">
            <h3 className="font-headline-lg text-headline-lg text-on-surface mb-2">Sign In</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-8">Access your environmental command center</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors text-label-md font-medium text-on-surface">
                <GoogleIcon /> Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors text-label-md font-medium text-on-surface">
                Microsoft
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-[1px] flex-1 bg-outline-variant/60" />
              <span className="text-[11px] font-bold text-outline uppercase tracking-wider">OR EMAIL</span>
              <div className="h-[1px] flex-1 bg-outline-variant/60" />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-1.5">Email Address</label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md"
                  placeholder="name@company.com" type="email" name="email" value={values.email} onChange={handleChange} required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-label-sm text-label-sm text-on-surface">Password</label>
                  <a className="text-[12px] font-semibold text-primary hover:underline" href="#">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    className="w-full px-4 pr-10 py-2.5 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md tracking-widest"
                    placeholder="********" type={inputType} name="password" value={values.password} onChange={handleChange} required
                  />
                  <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" onClick={toggleVisibility}>
                    <span className="material-symbols-outlined text-[20px]">{iconName}</span>
                  </button>
                </div>
              </div>

              {error && <p className="text-[13px] text-error font-medium">{error}</p>}

              <button type="submit" disabled={isLoading} className="w-full py-3 mt-2 bg-primary text-white font-label-md text-[15px] font-semibold rounded-lg hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-60">
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center font-body-sm text-[13px] text-on-surface-variant mt-6">
              Don't have an account? <Link className="text-primary font-semibold hover:underline" to="/register">Sign Up</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 w-full px-6 lg:px-16 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] font-medium text-on-surface-variant/80 bg-surface-container-lowest/30 backdrop-blur-sm border-t border-white/20">
        <div className="flex items-center gap-6">
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim shadow-[0_0_8px_rgba(78,222,163,0.6)]" />
          <span>All Systems Operational</span>
        </div>
        <div>© 2024 EcoWatch Intelligence v2.4.0</div>
      </footer>
    </div>
  );
}
