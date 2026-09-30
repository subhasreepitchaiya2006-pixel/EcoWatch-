import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "../hooks/useForm";
import { usePasswordToggle } from "../hooks/usePasswordToggle";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function SignInPage() {
  const navigate = useNavigate();
  const { values, handleChange, getFieldId } = useForm({ email: "", password: "" });
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

            <div className="mb-6">
              <GoogleSignInButton label="Continue with Google" fullWidth />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-[1px] flex-1 bg-outline-variant/60" />
              <span className="text-[11px] font-bold text-outline uppercase tracking-wider">OR EMAIL</span>
              <div className="h-[1px] flex-1 bg-outline-variant/60" />
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-1.5" htmlFor={getFieldId("email")}>Email Address</label>
                <input
                  className="w-full px-4 py-2.5 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md"
                  id={getFieldId("email")} placeholder="name@company.com" type="email" name="email" value={values.email} onChange={handleChange} required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-label-sm text-label-sm text-on-surface" htmlFor={getFieldId("password")}>Password</label>
                  <a className="text-[12px] font-semibold text-primary hover:underline" href="#">Forgot password?</a>
                </div>
                <div className="relative">
                  <input
                    className="w-full px-4 pr-10 py-2.5 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md tracking-widest"
                    id={getFieldId("password")} placeholder="********" type={inputType} name="password" value={values.password} onChange={handleChange} required
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
