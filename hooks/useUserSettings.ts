import { useQuery } from "@tanstack/react-query";
import { UserSettings } from "@/lib/generated/prisma/client";

export function useUserSettings() {
  return useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const res = await fetch("/api/user-settings");
      if (!res.ok) throw new Error("Failed to fetch user settings");
      return res.json() as Promise<UserSettings>;
    },
  });
}
