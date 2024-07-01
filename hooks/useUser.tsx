import { getUser } from "@/utils/supabase-functions/userFetch";
import { useState, useEffect } from "react";

export const useUser = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  return user;
};
