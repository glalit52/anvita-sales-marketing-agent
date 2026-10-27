"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Theme = "light" | "dark" | "system";

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

/** Inline script that applies the saved theme before paint (no flash). */
export const themeInitScript = `try{var t=localStorage.getItem("anvita-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("anvita-theme") as Theme | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from storage after hydration
      if (saved) setTheme(saved);
    } catch {}
  }, []);

  const choose = (next: Theme) => {
    setTheme(next);
    apply(next);
    try {
      localStorage.setItem("anvita-theme", next);
    } catch {}
  };

  const options: { value: Theme; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  return (
    <div className={cn("inline-flex rounded-lg bg-surface-2 p-0.5", className)}>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => choose(value)}
          aria-label={`${label} theme`}
          aria-pressed={theme === value}
          className={cn("rounded-md p-1.5", theme === value ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg")}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
