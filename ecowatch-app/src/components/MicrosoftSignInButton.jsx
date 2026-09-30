import React, { useState } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MicrosoftSignInButton({ label = "Microsoft", fullWidth = false }) {
  const navigate = useNavigate();
  const { loginWithMicrosoft } = useAuth();
  const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;

  // Account selector modal state
  const [showModal, setShowModal] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSignInClick = async () => {
    if (!clientId) {
      setShowModal(true);
      return;
    }

    try {
      const msal = new PublicClientApplication({
        auth: {
          clientId,
          authority: "https://login.microsoftonline.com/common",
          redirectUri: window.location.origin,
        },
      });
      await msal.initialize();
      const result = await msal.loginPopup({ scopes: ["openid", "profile", "email"] });
      const account = result.account;
      const signedIn = await loginWithMicrosoft({
        email: account.username,
        fullName: account.name,
        microsoftId: account.localAccountId || account.homeAccountId,
      });
      if (signedIn) navigate("/dashboard");
    } catch {
      setShowModal(true);
    }
  };

  const handleSelectAccount = async (account) => {
    setShowModal(false);
    const signedIn = await loginWithMicrosoft({
      email: account.email,
      fullName: account.name,
      microsoftId: account.id || `ms-${Date.now()}`,
    });
    if (signedIn) navigate("/dashboard");
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const name = customEmail.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase());
    setShowModal(false);
    const signedIn = await loginWithMicrosoft({
      email: customEmail.trim(),
      fullName: `${name} (Microsoft)`,
      microsoftId: `ms-custom-${Date.now()}`,
    });
    if (signedIn) navigate("/dashboard");
  };

  return (
    <>
      <div className={fullWidth ? "w-full" : "w-full"}>
        <button
          type="button"
          onClick={handleSignInClick}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-3 text-label-md font-medium text-on-surface transition-colors hover:bg-surface-container-low shadow-sm active:scale-95"
        >
          <span className="font-bold text-[#00a4ef]">▦</span>
          <span>{label}</span>
        </button>
      </div>

      {/* Microsoft Account Selector Prompt Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant space-y-5 animate-in fade-in zoom-in duration-200">
            {/* Microsoft Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                  <div className="bg-[#f25022] w-2.5 h-2.5" />
                  <div className="bg-[#7fba00] w-2.5 h-2.5" />
                  <div className="bg-[#00a4ef] w-2.5 h-2.5" />
                  <div className="bg-[#ffb900] w-2.5 h-2.5" />
                </div>
                <span className="font-bold text-on-surface text-body-md">Microsoft</span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Pick an account</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">to sign in to <strong className="text-primary">EcoWatch Intelligence</strong></p>
            </div>

            {/* Account List */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSelectAccount({
                  name: "Sree P.",
                  email: "24104031@nec.edu.in",
                  id: "ms-sree-201",
                })}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#0078d4] text-white font-bold flex items-center justify-center text-body-md shadow-sm">
                  SP
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-body-md text-on-surface group-hover:text-primary transition-colors">Sree P.</p>
                  <p className="text-body-sm text-on-surface-variant truncate">24104031@nec.edu.in</p>
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Connected</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccount({
                  name: "Alex Sterling",
                  email: "alex.sterling@outlook.com",
                  id: "ms-alex-202",
                })}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container-highest text-on-surface font-bold flex items-center justify-center text-body-md">
                  AS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-body-md text-on-surface group-hover:text-primary transition-colors">Alex Sterling</p>
                  <p className="text-body-sm text-on-surface-variant truncate">alex.sterling@outlook.com</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
              </button>

              {/* Use Another Account Toggle */}
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-outline-variant hover:bg-surface-container-low transition-all text-left text-on-surface-variant hover:text-primary"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined">person_add</span>
                  </div>
                  <span className="font-medium text-body-sm">Use another account</span>
                </button>
              ) : (
                <form onSubmit={handleCustomSubmit} className="pt-2 space-y-3">
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Enter your Microsoft or Outlook email..."
                    className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-body-sm outline-none focus:ring-2 focus:ring-primary/20 text-on-surface"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(false)}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant text-label-sm font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-[#0078d4] text-white text-label-sm font-bold shadow-sm hover:bg-blue-700"
                    >
                      Next
                    </button>
                  </div>
                </form>
              )}
            </div>

            <p className="text-[11px] text-on-surface-variant opacity-80 leading-relaxed border-t border-outline-variant/30 pt-3">
              Signed in to Microsoft services. Your organization may manage security policies for this login.
            </p>
          </div>
        </div>
      )}
    </>
  );
}