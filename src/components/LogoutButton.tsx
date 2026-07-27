"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { LoadingButton } from "@/components/LoadingButton";
import { toast } from "@/components/ui/toast";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
      toast.add({ title: "Signed out", description: "See you soon." });
    } catch {
      // A failed logout leaves you signed in, which is exactly the case where
      // silence is dangerous — say so rather than letting the click evaporate.
      toast.add({
        type: "error",
        title: "Could not sign you out",
        description: "Check your connection and try again.",
      });
      setLoading(false);
    }
  }

  return (
    <LoadingButton
      variant="ghost"
      size="sm"
      // Icon-only on phones, where the header has no room for the word; the
      // aria-label carries the name either way.
      aria-label="Log out"
      className="gap-1.5 px-2 text-muted-foreground hover:text-foreground lg:px-3"
      loading={loading}
      onClick={logout}
    >
      {!loading && <LogOut aria-hidden="true" />}
      <span className="hidden whitespace-nowrap lg:inline">Logout</span>
    </LoadingButton>
  );
}
