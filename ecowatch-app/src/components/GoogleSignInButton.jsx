import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GOOGLE_SCRIPT_ID = "google-identity-services";

function decodeCredential(credential) {
  const payload = credential.split(".")[1];
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = decodeURIComponent(
    window.atob(normalized).split("").map((character) => `%${(`00${character.charCodeAt(0).toString(16)}`).slice(-2)}`).join("")
  );
  return JSON.parse(decoded);
}

export default function GoogleSignInButton({ label = "Google", fullWidth = false }) {
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const [clientId, setClientId] = useState(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem("ecowatch-google-client-id") || "";
  });

  // Account selector modal & OAuth config state
  const [showModal, setShowModal] = useState(false);
  const [showConfigInput, setShowConfigInput] = useState(false);
  const [inputClientId, setInputClientId] = useState("");
  const [configSuccess, setConfigSuccess] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  useEffect(() => {
    if (!clientId || !buttonRef.current) return undefined;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            try {
              const profile = decodeCredential(credential);
              const signedIn = await loginWithGoogle({
                email: profile.email,
                fullName: profile.name,
                googleId: profile.sub,
                picture: profile.picture,
              });
              if (signedIn) navigate("/dashboard");
            } catch (authErr) {
              console.error("Google authentication error:", authErr);
              setShowModal(true);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        buttonRef.current.replaceChildren();
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: fullWidth ? 380 : 220,
          logo_alignment: "left",
        });

        // Trigger real-time Google One Tap prompt
        window.google.accounts.id.prompt();
      } catch (err) {
        console.warn("Could not initialize Google Identity Services:", err);
      }
    };

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      if (window.google?.accounts?.id) initializeGoogle();
      else existingScript.addEventListener("load", initializeGoogle, { once: true });
      return () => existingScript.removeEventListener("load", initializeGoogle);
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", initializeGoogle, { once: true });
    document.head.appendChild(script);
    return () => script.removeEventListener("load", initializeGoogle);
  }, [clientId, fullWidth, loginWithGoogle, navigate]);

  const handleSaveClientId = (e) => {
    e.preventDefault();
    const cleanId = inputClientId.trim();
    if (!cleanId) return;
    localStorage.setItem("ecowatch-google-client-id", cleanId);
    setClientId(cleanId);
    setConfigSuccess(true);
    setTimeout(() => {
      setConfigSuccess(false);
      setShowConfigInput(false);
      setShowModal(false);
    }, 1000);
  };

  const handleClearClientId = () => {
    localStorage.removeItem("ecowatch-google-client-id");
    setClientId("");
    setShowModal(true);
    setShowConfigInput(true);
  };

  const handleSelectAccount = async (account) => {
    setShowModal(false);
    const signedIn = await loginWithGoogle({
      email: account.email,
      fullName: account.name,
      googleId: account.id || `google-${Date.now()}`,
      picture: account.picture,
    });
    if (signedIn) navigate("/dashboard");
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const name = customEmail.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    setShowModal(false);
    const signedIn = await loginWithGoogle({
      email: customEmail.trim(),
      fullName: `${name} (Google)`,
      googleId: `google-custom-${Date.now()}`,
    });
    if (signedIn) navigate("/dashboard");
  };

  return (
    <>
      {!clientId ? (
        <div className="w-full">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-outline-variant bg-white px-4 py-3 font-label-md text-label-md font-medium text-on-surface transition-all hover:bg-surface-container-low shadow-sm active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>{label}</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="flex min-h-11 w-full justify-center" ref={buttonRef} aria-label="Continue with Google" />
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-[11px] text-on-surface-variant hover:text-primary transition-colors py-0.5 underline"
          >
            Switch to Mock / Change Client ID
          </button>
        </div>
      )}

      {/* Official Dark Mode Google Account Selector Modal (matching user's uploaded design) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#131314] text-[#e3e3e3] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#2e2e30] space-y-6 animate-in fade-in zoom-in duration-200">
            {/* Google Header */}
            <div className="flex items-center justify-between border-b border-[#2e2e30] pb-4">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-semibold text-[15px] text-[#e3e3e3]">Sign in with Google</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-[#9aa0a6] hover:text-[#e3e3e3] p-1 rounded-full hover:bg-[#28292a] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Headline matching user screenshot */}
            <div className="space-y-1">
              <h3 className="text-3xl font-semibold tracking-tight text-[#e3e3e3]">Choose an account</h3>
              <p className="text-[14px] text-[#9aa0a6] font-normal pt-1">
                to continue to <span className="text-[#8ab4f8] font-semibold">EcoWatch Intelligence</span>
              </p>
            </div>

            {/* Real-Time Google OAuth 2.0 Activation Box */}
            <div className="rounded-xl border border-[#4285F4]/40 bg-[#4285F4]/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8ab4f8] text-[20px]">verified_user</span>
                  <h4 className="font-semibold text-[14px] text-[#e3e3e3]">Real Google OAuth 2.0</h4>
                </div>
                {clientId && (
                  <button
                    type="button"
                    onClick={handleClearClientId}
                    className="text-[11px] text-red-400 hover:underline"
                  >
                    Disconnect
                  </button>
                )}
              </div>
              <p className="text-[12px] text-[#c4c7c5] leading-relaxed">
                Connect your Google Cloud Client ID to activate <strong>real-time Google Sign-In &amp; Registration</strong> via Google Identity Services (GSI).
              </p>

              {!showConfigInput && !clientId ? (
                <button
                  type="button"
                  onClick={() => setShowConfigInput(true)}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#8ab4f8] text-[#131314] font-semibold text-[13px] hover:bg-[#a8c7fa] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  Connect Real Google Client ID
                </button>
              ) : (
                <form onSubmit={handleSaveClientId} className="space-y-2.5 pt-1">
                  <input
                    type="text"
                    required
                    value={inputClientId}
                    onChange={(e) => setInputClientId(e.target.value)}
                    placeholder="Enter Client ID: xxxx.apps.googleusercontent.com"
                    className="w-full px-3.5 py-2.5 bg-[#1e1f20] border border-[#3c4043] rounded-lg text-[13px] outline-none focus:ring-2 focus:ring-[#8ab4f8]/30 focus:border-[#8ab4f8] text-[#e3e3e3]"
                  />
                  {configSuccess && (
                    <p className="text-[12px] text-[#81c995] font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Real Google OAuth Activated! Reloading button...
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
                    <span className="text-[11px] text-[#9aa0a6]">Origin: <code className="text-[#8ab4f8]">http://localhost:5173</code></span>
                    <div className="flex gap-2 self-end">
                      <button
                        type="button"
                        onClick={() => setShowConfigInput(false)}
                        className="px-3 py-1.5 rounded-lg border border-[#3c4043] text-label-sm text-[#e3e3e3] hover:bg-[#28292a]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#8ab4f8] text-[#131314] text-label-sm font-bold shadow-sm hover:bg-[#a8c7fa]"
                      >
                        Save &amp; Activate
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#2e2e30] w-full" />
              <span className="bg-[#131314] px-2 text-[10px] uppercase tracking-wider text-[#9aa0a6] absolute">or quick demo accounts</span>
            </div>

            {/* Account List */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleSelectAccount({
                  name: "Sree P.",
                  email: "24104031@nec.edu.in",
                  id: "google-sree-101",
                  picture: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHjHDE4YRuGQ3Gfa130nNnH_TrKTN3NpD-zMe9nUedm-m9wXov6zddEGLXzOaU_jpWp2iBmaHRsVNfYCzxyLZPu0OrrLD9e4M7E44bgTKfgtYkbm1BYFCjrLGrCZCi14B9jkwuOTGMd_n9qnXbu-dSz8vDtZ4n-ZAmyjU6fzXD0o3uDeGJLu8lLG6FX6vJPBfmkWUgkKV3LFZTZpe26ug2J2Jm67_95Df_pacqG3E7IS52qKk5vvOCqA",
                })}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-[#2e2e30] bg-[#1e1f20]/50 hover:bg-[#28292a] transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#8ab4f8]/20 text-[#8ab4f8] font-bold flex items-center justify-center text-body-md border border-[#8ab4f8]/30">
                  SP
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px] text-[#e3e3e3] group-hover:text-[#8ab4f8] transition-colors">Sree P.</p>
                  <p className="text-[13px] text-[#9aa0a6] truncate">24104031@nec.edu.in</p>
                </div>
                <span className="material-symbols-outlined text-[#5f6368] group-hover:text-[#8ab4f8] transition-colors text-[20px]">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccount({
                  name: "Alex Sterling",
                  email: "alex.sterling@gmail.com",
                  id: "google-alex-102",
                  picture: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-yu54gfoZYBApgRtTRq8nVgpFFOBQj-2dLh6r3Egc_BzQu7mLJDMk6kqABOVTfo4fJl8MUEbrchTNdHyzjDC_xGRXpjzHtUojXjg02QbOS4x6hI9SaEci6xAFrPeH-6IOELV_qBJ2fdHR6eG0BPPgSGh6SPLP0VgaCIxfYYpG8lvRivrDPRGEIIGJK74NTT6vEuLX9A5eyh111Rsa5uIwA5EDRF0SHo1lzjbGTst4DfbdYka_53vKa_Qt9JKmhruzhKqjo7CZLXoo",
                })}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-[#2e2e30] bg-[#1e1f20]/50 hover:bg-[#28292a] transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#81c995]/20 text-[#81c995] font-bold flex items-center justify-center text-body-md border border-[#81c995]/30">
                  AS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px] text-[#e3e3e3] group-hover:text-[#8ab4f8] transition-colors">Alex Sterling</p>
                  <p className="text-[13px] text-[#9aa0a6] truncate">alex.sterling@gmail.com</p>
                </div>
                <span className="material-symbols-outlined text-[#5f6368] group-hover:text-[#8ab4f8] transition-colors text-[20px]">chevron_right</span>
              </button>

              {/* Use Another Account Toggle */}
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-dashed border-[#3c4043] hover:bg-[#28292a] transition-all text-left text-[#9aa0a6] hover:text-[#8ab4f8]"
                >
                  <div className="w-10 h-10 rounded-full bg-[#28292a] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-[#e3e3e3]">person_add</span>
                  </div>
                  <span className="font-medium text-[14px]">Use another Google account</span>
                </button>
              ) : (
                <form onSubmit={handleCustomSubmit} className="pt-2 space-y-3">
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Enter your Gmail address..."
                    className="w-full px-3.5 py-2.5 bg-[#1e1f20] border border-[#3c4043] rounded-lg text-body-sm outline-none focus:ring-2 focus:ring-[#8ab4f8]/30 focus:border-[#8ab4f8] text-[#e3e3e3]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="px-3.5 py-1.5 rounded-lg border border-[#3c4043] text-label-sm font-medium text-[#e3e3e3] hover:bg-[#28292a]"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#8ab4f8] text-[#131314] text-label-sm font-bold shadow-sm hover:bg-[#a8c7fa]"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              )}
            </div>

            <p className="text-[11px] text-[#9aa0a6] leading-relaxed border-t border-[#2e2e30] pt-3">
              To continue, Google will share your name, email address, language preference, and profile picture with EcoWatch Intelligence.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
