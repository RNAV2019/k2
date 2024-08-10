"use client";
import { Button } from "../ui/button";
import { Sun } from "~/icons/Sun";
import { Moon } from "~/icons/Moon";
import { useTheme } from "next-themes";

export default function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      className="fixed bottom-6 right-6 z-50 shadow-md"
      size={"icon"}
      onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
