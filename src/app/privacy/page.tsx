import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <article className="mx-auto max-w-2xl space-y-4 px-4 py-10 leading-relaxed">
      <h1 className="text-2xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="text-clay">This is a student project (a capstone). This policy is a placeholder and is not legal advice; replace it before any real launch.</p>
      <h2 className="pt-2 text-lg font-bold">What we store</h2>
      <p>Your name, email address, phone number and a hashed password. If you send an inquiry, we store your name, phone number and message and share them with the landlord or agent of that listing.</p>
      <h2 className="pt-2 text-lg font-bold">What we do not do</h2>
      <p>We do not sell your data, and we do not show your phone number to other renters. Agents&rsquo; phone numbers are shown on their listings so renters can contact them.</p>
    </article>
  );
}
