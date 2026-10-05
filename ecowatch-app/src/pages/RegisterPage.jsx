import React, { useRef, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "../hooks/useForm";
import { usePasswordToggle } from "../hooks/usePasswordToggle";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useSatelliteData } from "../context/SatelliteDataContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { values, handleChange, getFieldId } = useForm({ fullName: "", email: "", mobile: "", password: "", confirmPassword: "" });
  const password = usePasswordToggle();
  const confirmPassword = usePasswordToggle();
  const { login, isLoading, error } = useAuth();
  const { currentLocation } = useSatelliteData();
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
    const ok = await login({ ...values, location: currentLocation });
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
        <div className="glass-panel register-panel w-full max-w-[480px] p-8 md:p-10 rounded-xl shadow-modal border border-white/50">
          <div className="mb-stack_lg">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-stack_sm">Create Your Account</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Access real-time environmental intelligence and global satellite monitoring assets.</p>
          </div>

          <form className="space-y-stack_md" onSubmit={handleSubmit}>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1" htmlFor={getFieldId("fullName")}>Full Name</label>
              <input id={getFieldId("fullName")} className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="John Doe" type="text" name="fullName" value={values.fullName} onChange={handleChange} required />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1" htmlFor={getFieldId("email")}>Email Address</label>
              <input id={getFieldId("email")} className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="john@enterprise.com" type="email" name="email" value={values.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1" htmlFor={getFieldId("mobile")}>Mobile Number</label>
              <input id={getFieldId("mobile")} className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="+1 (555) 000-0000" type="tel" name="mobile" value={values.mobile} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack_md">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1" htmlFor={getFieldId("password")}>Password</label>
                <div className="relative">
                  <input id={getFieldId("password")} className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="********" type={password.inputType} name="password" value={values.password} onChange={handleChange} required />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" onClick={password.toggleVisibility}>
                    <span className="material-symbols-outlined">{password.iconName}</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 ml-1" htmlFor={getFieldId("confirmPassword")}>Confirm Password</label>
                <div className="relative">
                  <input id={getFieldId("confirmPassword")} className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" placeholder="********" type={confirmPassword.inputType} name="confirmPassword" value={values.confirmPassword} onChange={handleChange} required />
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
            {error && <p className="text-[13px] text-error font-medium">{error}</p>}

            <button className="w-full py-4 bg-primary text-white font-label-md text-label-md font-bold rounded-lg shadow-lg hover:bg-on-primary-fixed-variant active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 uppercase tracking-widest" type="submit" disabled={isLoading}>
              <span>{isLoading ? "Creating..." : "Register"}</span>
              <span className="material-symbols-outlined text-body-md">arrow_forward</span>
            </button>

            <div className="flex items-center gap-3 my-stack_md">
              <div className="h-[1px] flex-1 bg-outline-variant" />
              <span className="text-label-sm text-outline uppercase tracking-widest">OR</span>
              <div className="h-[1px] flex-1 bg-outline-variant" />
            </div>

            <GoogleSignInButton label="Continue with Google" fullWidth />

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
