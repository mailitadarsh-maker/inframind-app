"use client";
import ClientOnboardingForm from "@/components/ClientOnboardingForm";
export default function OnboardingPage() {
  return (
    <ClientOnboardingForm
      onSubmit={async (profile: any) => {
        const res = await fetch('/api/admin/create-client', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
      }}
    />
  );
}
