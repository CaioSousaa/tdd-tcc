"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import NotificationCenter from "./NotificationCenter";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show header on login/register pages
  const isAuthPage = pathname === "/" || pathname === "/register";
  if (isAuthPage) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 py-4 px-6 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/tasks" className="text-2xl font-bold text-amber-400">
          TDD Tasks
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-4">
            <Link 
              href="/tasks" 
              className={`text-sm font-medium transition-colors ${pathname === '/tasks' ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              Tarefas
            </Link>
            <Link 
              href="/tags" 
              className={`text-sm font-medium transition-colors ${pathname === '/tags' ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              Tags
            </Link>
          </nav>

          <div className="flex items-center gap-4 border-l border-zinc-800 pl-4">
            <NotificationCenter />
            
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-red-400 transition-colors rounded-full hover:bg-zinc-800"
              title="Sair"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
