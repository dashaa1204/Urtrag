import type { Metadata } from "next";
import DisclaimerView from "@/views/disclaimer/disclaimer-view";

export const metadata: Metadata = { title: "Хариуцлагын тайлбар" };

export default function DisclaimerPage() {
  return <DisclaimerView />;
}
