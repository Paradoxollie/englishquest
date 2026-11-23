import type { Metadata } from "next";
import { PageHead } from "@/components/comic/page-head";
import { GuestConversation } from "./guest-conversation";

export const metadata: Metadata = {
  title: "Mon échange privé · English Quest",
  robots: { index: false, follow: false }, referrer: "no-referrer",
};

export default function ContactTrackingPage() {
  return <div>
    <PageHead caption="Contact" title="Mon échange privé" />
    <div className="eq-container eq-section"><GuestConversation /></div>
  </div>;
}
