"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link href={href} className={`sidebar-nav-link${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
      {icon}
      {children}
    </Link>
  );
}
