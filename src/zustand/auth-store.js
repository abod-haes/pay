import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuth = create(
  persist(
    (set) => ({
      token: "",
      email: "",
      addUserEmail: (token) => {
        set({ token: token });
      },
      removeUserEmail: () => set({ token: "" }),
      addUserNewEmail: (email) => set({ email: email.toLowerCase() }),
      removeNewEmail: () => set({ email: "" }),
    }),
    {
      name: "rehab-auth", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
