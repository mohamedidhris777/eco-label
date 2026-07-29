/**
 * EcoLabel X — User Profile Page
 * Route: /dashboard/profile
 */
"use client";

import { useEffect, useState } from "react";
import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { useApp } from "@/context/AppContext";

export default function ProfilePage() {
  const { userProfile, updateUserProfile } = useApp();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: userProfile.name,
    email: userProfile.email,
    role: userProfile.role,
    organization: userProfile.organization,
  });

  useEffect(() => {
    setForm({
      name: userProfile.name,
      email: userProfile.email,
      role: userProfile.role,
      organization: userProfile.organization,
    });
  }, [userProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <DashboardTopNav
        title="User Profile"
        subtitle="Manage personal account credentials and organization profile."
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {saved && (
          <div className="p-4 rounded-xl bg-[rgba(0,255,170,0.1)] border border-[rgba(0,255,170,0.3)] text-xs text-[#00ffaa] flex items-center gap-2">
             Profile settings successfully updated and saved globally!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
          <div
            className="rounded-2xl p-6 space-y-6"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-4 pb-6 border-b border-white/5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00ffaa] to-[#00c8ff] flex items-center justify-center text-xl font-bold text-[#050a18]">
                {userProfile.initials}
              </div>
              <div>
                <h3 className="text-white font-semibold text-base">{userProfile.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{userProfile.role}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-[#00ffaa] bg-[#00ffaa]/10 border border-[#00ffaa]/20">
                  Enterprise Tier
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00ffaa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00ffaa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Designation</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00ffaa]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Organization</label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#00ffaa]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00ffaa] to-[#00c8ff] text-[#050a18] text-xs font-semibold hover:brightness-110 transition-all"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
