"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { User, Bell, Settings } from "lucide-react";
import { Button } from "./button";

interface TopbarProps {
  title?: string;
}

// Navigation items - sidebar ile aynı yapı
const navigation = [
  { name: "Kontrol Paneli", href: "/", icon: null },
  { name: "Derslerim", href: "/dashboard/courses", icon: null },
  { name: "Öğrenme Çıktıları", href: "/outcomes", icon: null },
  { name: "Program Çıktıları", href: "/dashboard/program-outcomes", icon: null },
  { name: "Sınavlar", href: "/exams", icon: null },
  { name: "Öğrenciler", href: "/students", icon: null },
  { name: "Raporlar", href: "/reports", icon: null },
];

// Alt sayfalar için özel başlıklar
const pageTitles: Record<string, string> = {
  "/outcomes/new": "Yeni Öğrenme Çıktısı",
  "/students/new": "Yeni Öğrenci",
  "/exams/new": "Yeni Sınav",
  "/dashboard/courses/create": "Yeni Ders Oluştur",
  "/ai": "AI Sınav İşleme",
  "/scores": "Puanlar",
  "/settings": "Ayarlar",
};

function getPageTitle(pathname: string): string {
  // Önce özel sayfa başlıklarını kontrol et
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }

  // Alt sayfalar için (örn: /outcomes/[id], /students/[id])
  if (pathname.startsWith("/outcomes/") && pathname !== "/outcomes/new") {
    return "Öğrenme Çıktısını Düzenle";
  }
  if (pathname.startsWith("/students/") && pathname !== "/students/new") {
    return "Öğrenci Detayları";
  }
  if (pathname.startsWith("/exams/") && pathname !== "/exams/new") {
    if (pathname.includes("/view")) {
      return "Sınav Detayları";
    }
    return "Sınav Düzenle";
  }
  if (pathname.startsWith("/courses/") && pathname !== "/courses/new") {
    return "Ders Detayları";
  }
  if (pathname.startsWith("/reports/")) {
    return "MÜDEK Raporu";
  }
  if (pathname.startsWith("/dashboard/courses/") && !pathname.includes("/create")) {
    return "Ders Detayları";
  }
  if (pathname.startsWith("/dashboard/exams/")) {
    return "Sınav İşlemleri";
  }

  // Navigation items'ı kontrol et
  for (const item of navigation) {
    if (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"))) {
      return item.name;
    }
  }

  // Varsayılan
  return "Kontrol Paneli";
}

export function Topbar({ title }: TopbarProps) {
  const pathname = usePathname();
  const pageTitle = title || getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-6">
        <div>
          <h1 className="text-2xl font-semibold">{pageTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="gap-2">
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">Yönetici</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

