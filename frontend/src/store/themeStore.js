// src/store/themeStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set) => ({
      mode: "light",
      toggleTheme: () =>
        set((state) => ({
          mode: state.mode === "light" ? "dark" : "light",
        })),
    }),
    {
      name: "theme-mode", // localStorage key
      getStorage: () => localStorage, // optional, but explicit
    }
  )
);

export default useThemeStore;
