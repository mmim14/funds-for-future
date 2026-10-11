import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Student profile | Fund For Future", description: "Discover scholarships that fit your goals." };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
