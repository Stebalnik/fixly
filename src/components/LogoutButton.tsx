"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      window.location.href = "/";
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="button button-secondary"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}