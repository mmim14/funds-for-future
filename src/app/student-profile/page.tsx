import type { Metadata } from "next";
import ProfileScreen from "@/components/profile-screen";
export const metadata: Metadata = { title: "Enhance your profile | Fund For Future" };
export default function StudentProfilePage() { return <ProfileScreen profileOnly />; }
