import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GOOGLE_SCRIPT_ID = "google-identity-services";

export default function GoogleSignInButton({ label = "Google", fullWidth = false }) {
  const buttonRef = useRef(null);
  const initializedRef = useRef(false);
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !buttonRef.current) return undefined;

    const initializeGoogle = () => {
      if (initializedRef.current || !window.google?.accounts?.id || !buttonRef.current) return;
      initializedRef.current = true;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          const signedIn = await loginWithGoogle({ idToken: credential });
          if (signedIn) navigate("/dashboard");
          else setError("Google sign-in could not be completed.");
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

  if (!clientId) {
    return (
      <div className="w-full">
        <button
          type="button"
          disabled
          title="Google sign-in is not configured"
          className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-outline-variant bg-white px-4 py-3 text-label-md font-medium text-on-surface opacity-60"
        >
          <span className="font-bold text-[#4285f4]">G</span>
          <span>{label}</span>
        </button>
        <p className="mt-1 text-center text-[11px] text-on-surface-variant">Google sign-in is not configured.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex min-h-11 w-full justify-center" ref={buttonRef} aria-label={label} />
      {error && <p className="mt-2 text-center text-body-sm text-error" role="alert">{error}</p>}
    </div>
  );
}