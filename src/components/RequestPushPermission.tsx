// components/RequestPushPermission.tsx
import React, { useState } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "../lib/firebase";

const RequestPushPermission: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  const requestPermission = async () => {
    try {
      const permissionResult = await Notification.requestPermission();
      if (permissionResult === "granted" && messaging) {
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        if (currentToken) {
          setToken(currentToken);
          console.log("FCM Token:", currentToken);
          // TODO: Send this token to your server to send notifications later
        } else {
          console.log(
            "No registration token found. Request permission to generate one."
          );
        }
      } else {
        console.warn("Notification permission not granted.");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  return (
    <div>
      <button onClick={requestPermission}>Enable Push Notifications</button>
      {token && <p>Your token: {token}</p>}
    </div>
  );
};

export default RequestPushPermission;
