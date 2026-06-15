"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

type HeaderAuthState = {
  isLoggedIn: boolean;
  fixaBalance: number | null;
  unreadNotifications: number;
};

type HeaderAuthMenuProps = {
  accountHref?: string;
  balanceHref?: string;
  loginHref?: string;
  notificationsHref?: string;
};

const defaultAuthState: HeaderAuthState = {
  isLoggedIn: false,
  fixaBalance: null,
  unreadNotifications: 0,
};

export default function HeaderAuthMenu({
  accountHref = "/account",
  balanceHref = "/account/fixa",
  loginHref = "/login",
  notificationsHref = "/account/notifications",
}: HeaderAuthMenuProps) {
  const [authState, setAuthState] =
    useState<HeaderAuthState>(defaultAuthState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAuthState() {
      try {
        const response = await fetch("/api/account/header-state", {
          cache: "no-store",
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as HeaderAuthState;

        if (active) {
          setAuthState(data);
        }
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    }

    loadAuthState();

    return () => {
      active = false;
    };
  }, []);

  if (!loaded) {
    return (
      <Link href={loginHref} className="button button-secondary">
        Login
      </Link>
    );
  }

  if (!authState.isLoggedIn) {
    return (
      <Link href={loginHref} className="button button-secondary">
        Login
      </Link>
    );
  }

  const hasUnreadNotifications = authState.unreadNotifications > 0;

  return (
    <>
      <Link
        href={balanceHref}
        className="site-header-balance"
        aria-label={`FIXA balance: ${(authState.fixaBalance ?? 0).toLocaleString()} FIXAs`}
      >
        <Image
          src="/fixacoin.png"
          alt="FIXA"
          width={18}
          height={18}
          className="site-header-balance-icon"
        />
        <span>{(authState.fixaBalance ?? 0).toLocaleString()}</span>
      </Link>

      <Link
        href={hasUnreadNotifications ? notificationsHref : accountHref}
        className="site-header-account-button"
      >
        <span className="site-header-account-label">Account</span>

        {hasUnreadNotifications ? (
          <span className="site-header-notification-badge">
            {authState.unreadNotifications > 99
              ? "99+"
              : authState.unreadNotifications}
          </span>
        ) : null}
      </Link>

      <LogoutButton />
    </>
  );
}
