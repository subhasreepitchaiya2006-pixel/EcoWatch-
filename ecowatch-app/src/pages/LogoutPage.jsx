import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LogoutPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="bg-background min-h-screen w-full relative overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/AP1WRLtvGmjuYEZZaeHqiTZTYlAdIdUszyrxs2yT57Tm7Zi0AfZcD0FXyLQ2juekSyJN4cQ6pkJ-pZdsJBMuszsy3OeShvqw3nmxqrmlny_pEVxbrGXWsws7MWXQv5Ekybt1AxLjQHjB8r-eGo7qp6Y_WCqD0sd9T__UXGd5UyF_n7lZpfnS3SenIlBATBFPKjR-tBs2U0rWy3oWNP7DwIWnrGtqxBKWfty8_8idPmSzskp4wFWNjlvgqQy-ouI')" }}
      />
      <div className="absolute inset-0 w-full h-full bg-surface/85 backdrop-blur-md" />

      <main className="relative z-10 w-full min-h-screen flex flex-col justify-center items-center px-4">
        <div className="bg-surface-container-lowest rounded-xl shadow-modal w-full max-w-[480px] p-8 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <div className="mb-8 flex items-center gap-2">
            <div className="font-headline-md text-headline-md text-primary tracking-tight font-bold">EcoWatch Platform</div>
          </div>
          <h1 className="font-headline-sm text-headline-sm text-on-surface mb-3">Sign Out of EcoWatch Intelligence</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-10 max-w-[360px] mx-auto">
            You are about to be signed out of your environmental command center. All active satellite monitoring sessions will be securely saved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              className="flex-1 h-11 px-6 rounded-lg border border-outline-variant bg-transparent font-label-md text-primary hover:bg-surface-container-low transition-colors"
              type="button"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              className="flex-1 h-11 px-6 rounded-lg bg-primary font-label-md text-on-primary hover:bg-primary-container transition-all shadow-sm"
              type="button"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        </div>

        <footer className="absolute bottom-8 left-0 right-0 text-center flex flex-col items-center gap-2">
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 EcoWatch Intelligence Platform</p>
        </footer>
      </main>
    </div>
  );
}
