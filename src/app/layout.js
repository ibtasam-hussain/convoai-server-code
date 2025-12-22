import { Poppins } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import SidebarWrapper from "@/Components/sidebar-wrapper"; // ADD THIS
import '@ant-design/v5-patch-for-react-19'; // Fix antd v5 compatibility with React 19

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: {
    default: "ConverAIx",
    template: "%s | ConverAIx",
  },
  description:
    "ConverAIx is an AI-powered voice and chat automation platform for businesses — handle calls, chats, bookings, and support with human-like AI agents.",
  applicationName: "ConverAIx",
  keywords: [
    "ConverAIx",
    "AI Voice Agent",
    "AI Call Automation",
    "AI Chatbot",
    "Voice AI",
    "Conversational AI",
    "Call Center Automation",
    "AI Customer Support",
  ],
  authors: [{ name: "ConverAIx Team" }],
  creator: "ConverAIx",
  publisher: "ConverAIx",
  metadataBase: new URL("https://converaix.hubaix.world"), // 👉 apna domain yahan
  openGraph: {
    title: "ConverAIx",
    description:
      "AI-powered voice and chat agents that answer calls, book appointments, and support customers 24/7.",
    url: "https://converaix.com",
    siteName: "ConverAIx",
    images: [
      {
        url: "/og-image.png", // public/og-image.png
        width: 1200,
        height: 630,
        alt: "ConverAIx – AI Voice & Chat Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConverAIx",
    description:
      "AI-powered voice and chat agents for automated customer conversations.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased bg-[#1E113B]`}>
        <NextTopLoader
          showSpinner={false}
          height={3}
          crawlSpeed={200}
          speed={400}
          zIndex={9999}
        />

        <div className="flex">
          <main className="flex-1">{children}</main>
        </div>

        <div className="bg-wrapper fixed bottom-0 left-0 opacity-[0.35] z-[-1]">
          <img src="/assets/Landing/bg-main.svg" alt="background-image" />
        </div>
      </body>
    </html>
  );
}
