import React, { useRef, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "../hooks/useForm";
import { usePasswordToggle } from "../hooks/usePasswordToggle";
import { useAuth } from "../context/AuthContext";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const { values, handleChange } = useForm({ fullName: "", email: "", mobile: "", password: "", confirmPassword: "" });
  const password = usePasswordToggle();
  const confirmPassword = usePasswordToggle();
  const { login, isLoading } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [formError, setFormError] = useState(null);

  // useRef + useEffect: parallax on the background satellite map image.
  const mapRef = useRef(null);
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 50;
      const y = (e.clientY - window.innerHeight / 2) / 50;
      if (mapRef.current) {
        mapRef.current.style.transform = `scale(1.05) translate(${x}px, ${y}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (values.password !== values.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setFormError("Please agree to the Terms & Conditions to continue.");
      return;
    }
    setFormError(null);
    const ok = await login(values);
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img
          ref={mapRef}
          alt="Satellite Environmental Intelligence Visualization"
          className="w-full h-full object-cover opacity-80 scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgzwjZ-B0gC3H4EeTZzGdOzx3aQmWu80Xa3N0GMOyrSjr1nl8EPNIuD1Dx0d5AOMtCIZBwnOaAD6_w-gtQFaxOTzjv53gVAnS4HUq1iEOI5rCby77QO458Ma1jyQJP8YU4pnjY9sAC0uevo6LEPXljEMoTzwsDnYSTa_qO4BzYfdyy3lX7UYpGa4VVWL8jvhOQOUIHIbfnf0Cy58ZQaSBYogpU-4OcJlVyCzxCCOMPC36yS4nj1Tm2ZQ"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-surface/40 to-transparent" />
      </div>

      <header className="fixed top-0 w-full h-[64px] z-50 flex justify-between items-center px-container_padding bg-surface/80 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-stack_sm">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>satellite_alt</span>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">EcoWatch Intelligence</h1>
        </div>
        <nav className="flex items-center gap-stack_lg">
          <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" to="/home">Home</Link>
          <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" to="/signin">Login</Link>
        </nav>
      </header>

      <main className="relative z-10 min-h-screen flex items-center justify-center pt-[64px] px-stack_md py-stack_lg">
        <div className="glass-panel w-full max-w-[480px] p-8 md:p-10 rounded-xl shadow-modal border border-white/50">
          <div className="mb-stack_lg">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-stack_sm">Create Your Account</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Access real-time environmental intelligence and global satellite monitoring assets.</p>
          </div>

          <form className="space-y-stack_md" onSubmit={handleSubmit}>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1">Full Name</label>
              <input className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="John Doe" type="text" name="fullName" value={values.fullName} onChange={handleChange} required />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1">Email Address</label>
              <input className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="john@enterprise.com" type="email" name="email" value={values.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1">Mobile Number</label>
              <input className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="+1 (555) 000-0000" type="tel" name="mobile" value={values.mobile} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack_md">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1">Password</label>
                <div className="relative">
                  <input className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="********" type={password.inputType} name="password" value={values.password} onChange={handleChange} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" onClick={password.toggleVisibility}>
                    <span className="material-symbols-outlined">{password.iconName}</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1">Confirm Password</label>
                <div className="relative">
                  <input className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="********" type={confirmPassword.inputType} name="confirmPassword" value={values.confirmPassword} onChange={handleChange} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" onClick={confirmPassword.toggleVisibility}>
                    <span className="material-symbols-outlined">{confirmPassword.iconName}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input className="mt-1 w-4 h-4 text-primary border-outline-variant rounded" id="terms" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <label className="font-body-sm text-body-sm text-on-surface-variant" htmlFor="terms">
                I agree to the <a className="text-primary font-medium hover:underline" href="#">Terms &amp; Conditions</a> and <a className="text-primary font-medium hover:underline" href="#">Privacy Policy</a> regarding data handling and satellite monitoring usage.
              </label>
            </div>

            {formError && <p className="text-[13px] text-error font-medium">{formError}</p>}

            <button className="w-full py-4 bg-primary text-white font-label-md text-label-md font-bold rounded-lg shadow-lg hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 uppercase tracking-widest" type="submit" disabled={isLoading}>
              <span>{isLoading ? "Creating..." : "Register"}</span>
              <span className="material-symbols-outlined text-body-md">arrow_forward</span>
            </button>

            <div className="flex items-center gap-3 my-stack_md">
              <div className="h-[1px] flex-1 bg-outline-variant" />
              <span className="text-label-sm text-outline uppercase tracking-widest">OR</span>
              <div className="h-[1px] flex-1 bg-outline-variant" />
            </div>

            <button className="w-full py-3 bg-white border border-outline-variant text-on-surface font-label-md text-label-md font-medium rounded-lg hover:bg-surface-container-low transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]" type="button">
              <GoogleIcon /><span>Continue with Google</span>
            </button>

            <p className="text-center font-body-sm text-body-sm text-on-surface-variant mt-stack_lg">
              Already have an account? <Link className="text-primary font-bold hover:underline" to="/signin">Login</Link>
            </p>
          </form>
        </div>

        <div className="absolute bottom-8 left-0 w-full flex flex-col md:flex-row justify-between px-container_padding text-[10px] uppercase tracking-[0.2em] text-outline opacity-60">
          <div>Global Node Status: <span className="text-secondary-fixed-dim font-bold">Operational</span></div>
          <div className="mt-2 md:mt-0">© 2024 EcoWatch Intelligence | Enterprise-Grade Geospatial Systems</div>
        </div>
      </main>
    </div>
  );
}
