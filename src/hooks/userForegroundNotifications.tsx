// hooks/useForegroundNotifications.ts
import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "../lib/firebase";

const useForegroundNotifications = () => {
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Message received in the foreground:", payload);
      // Optionally display a custom UI here
    });

    return () => unsubscribe();
  }, []);

  return null;
};

export default useForegroundNotifications;
