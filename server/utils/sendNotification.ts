// server/sendNotification.ts (Node.js environment, not Next.js SSR)
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export async function sendNotificationToToken(token: string) {
  try {
    const message = {
      notification: {
        title: "Hello from Server",
        body: "This is a test push notification",
      },
      token: token,
    };

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
