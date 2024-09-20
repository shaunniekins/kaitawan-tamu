import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ReduxProviders } from "./redux_providers";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Kaitawan Tamu",
  description:
    "E-Markethub Platform with Bidding System for Sustainable Item Exchange and Waste Reduction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground select-none">
        <main className="min-h-[100svh] flex flex-col items-center">
          <ReduxProviders>{children}</ReduxProviders>
        </main>
      </body>
    </html>
  );
}
