/**
 * EcoLabel X — Single Application Root Entry
 * Route: /
 * Automatically redirects to the unified dashboard application.
 */
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard");
}
