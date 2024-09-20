import Navigation from "@/components/member/Navigation";

export const metadata = {
  title: "Kaitawan Tamu",
  description:
    "E-Markethub Platform with Bidding System for Sustainable Item Exchange and Waste Reduction",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Navigation>{children}</Navigation>;
}
