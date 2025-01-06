/* eslint-disable no-restricted-globals */
/* global self, firebase */

// Import the Firebase scripts needed for messaging in service workers
importScripts(
  "https://www.gstatic.com/firebasejs/9.17.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.17.2/firebase-messaging-compat.js"
);

// Replace with your firebase config if needed
firebase.initializeApp({
  apiKey: "AIzaSyB9FwcG6oOY_8aK653dtxlo8HoWwTGbygg",
  authDomain: "dormitary-a0682.firebaseapp.com",
  projectId: "dormitary-a0682",
  storageBucket: "dormitary-a0682.firebasestorage.app",
  messagingSenderId: "309910095641",
  appId: "1:309910095641:web:e9fa90bee4679ebeb1a788",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const { title, body } = payload.notification ?? {};
  const notificationTitle = title ?? "Background Notification";
  const notificationOptions = {
    body: body ?? "No body data",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
