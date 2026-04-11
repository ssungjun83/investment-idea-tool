"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, BookOpen, Network, Building2, MessageCircle, BarChart3, FileText, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "새 아이디어", icon: TrendingUp },
    { href: "/ideas", label: "아이디어", icon: BookOpen },
    { href: "/chat", label: "AI 채팅", icon: MessageCircle },
    { href: "/companies", label: "기업", icon: Building2 },
    { href: "/reports", label: "레포트", icon: FileText },
    { href: "/trends", label: "트렌드", icon: BarChart3 },
    { href: "/graph", label: "그래프", icon: Network },
    { href: "/indicators", label: "핵심지표", icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-blue-600 shrink-0">
          <TrendingUp className="h-5 w-5" />
          <span className="hidden sm:inline">투자 아이디어</span>
        </Link>

        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                pathname === href
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="w-48 shrink-0 hidden md:block">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
