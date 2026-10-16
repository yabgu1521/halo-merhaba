"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const path = usePathname();
  return (
    <Link
      href={href}
      aria-current={
        path === href || path.startsWith(href + "/") ? "page" : undefined
      }
    >
      {children}
    </Link>
  );
}
