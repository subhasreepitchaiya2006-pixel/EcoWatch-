import React from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useForm } from "../hooks/useForm";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const { values, handleChange } = useForm({
    fullName: user?.fullName || "Subhasree Pitchaiya",
    jobTitle: "Lead Environmental Analyst",
    email: user?.email || "alex.rivera@ecowatch.org",
    phone: "+1 (555) 123-4567",
  });

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-stack_lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">User Profile</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage your personal information, security settings, and platform preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-stack_lg">
          <div className="space-y-stack_lg flex flex-col">
            <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-stack_lg flex flex-col items-center text-center relative overflow-hidden">
              <div className="relative w-24 h-24 rounded-full border-4 border-surface-container-lowest overflow-hidden mb-4 mt-6 shadow-sm">
                <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant text-[48px]">person</span>
                </div>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">{values.fullName}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">{values.jobTitle}</p>
              <div className="flex items-center gap-1 mt-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">location_on</span>
                <span className="font-label-sm text-label-sm">Tirunelveli, India</span>
              </div>
              <button className="mt-6 w-full py-2 px-4 rounded-lg bg-surface-container-low border border-outline-variant text-primary font-label-md hover:bg-surface-variant transition-colors">Update Photo</button>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-stack_lg flex-1">
              <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface border-b border-outline-variant pb-3 mb-4">Professional Credentials</h4>
              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-container/10 text-primary border border-primary-fixed">
                  <span className="material-symbols-outlined text-sm">verified</span><span className="font-label-sm">Certified Analyst</span>
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary-container/20 text-on-secondary-container border border-secondary-fixed-dim">
                  <span className="material-symbols-outlined text-sm">satellite_alt</span><span className="font-label-sm">Satellite Data Responder</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-stack_lg">
            <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-stack_lg">
              <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface border-b border-outline-variant pb-3 mb-6">Personal Information</h4>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Full Name</label>
                  <input className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-sm" type="text" name="fullName" value={values.fullName} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Job Title</label>
                  <input className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-sm" type="text" name="jobTitle" value={values.jobTitle} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Email Address</label>
                  <input className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-sm" type="email" name="email" value={values.email} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Phone Number</label>
                  <input className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-body-sm" type="tel" name="phone" value={values.phone} onChange={handleChange} />
                </div>
                <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-outline-variant mt-2">
                  <button className="px-5 py-2 rounded-lg font-label-md text-primary bg-surface-container-low border border-outline-variant hover:bg-surface-variant transition-colors" type="button">Discard</button>
                  <button className="px-5 py-2 rounded-lg font-label-md text-on-primary bg-primary hover:bg-primary/90 transition-colors shadow-sm" type="submit">Save Changes</button>
                </div>
              </form>
            </div>

            <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-stack_lg">
              <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface border-b border-outline-variant pb-3 mb-4">Account Security</h4>
              <div className="flex items-center justify-between">
                <div><p className="font-label-md text-on-surface">Password</p><p className="font-body-sm text-on-surface-variant">Last changed 3 months ago</p></div>
                <button className="text-primary font-label-sm">Change</button>
              </div>
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-outline-variant/50">
                <div><p className="font-label-md text-on-surface">Two-Factor Auth (MFA)</p><span className="text-secondary font-body-sm">Active</span></div>
                <button className="text-primary font-label-sm">Manage</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
