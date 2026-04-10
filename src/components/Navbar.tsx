"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, BookOpen, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "새 아이디어", icon: TrendingUp },
    { href: "/ideas", label: "아이디어 목록", icon: BookOpen },
    { href: "/graph", label: "키워드 그래프", icon: Network },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-blue-600">
          <TrendingUp className="h-5 w-5" />
          <span>투자 아이디어</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="w-64">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
