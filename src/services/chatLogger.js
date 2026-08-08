import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Fire-and-forget transcript logging for the Nova assistant.
 *
 * Logging must never sit between the visitor and a reply. Callers deliberately
 * do not await this: a Firestore write can stall indefinitely — an unreachable
 * project, an offline visitor, or an ad blocker filtering
 * firestore.googleapis.com — and awaiting one used to strand the whole chat
 * before the message was even rendered. Failures are reported and dropped.
 */
export const logChatMessage = (deviceId, entry) => {
  if (!db || !deviceId) return;

  try {
    addDoc(collection(db, "chat_sessions", deviceId, "messages"), {
      ...entry,
      timestamp: serverTimestamp(),
    }).catch((error) => {
      console.warn("Chat transcript not saved:", error?.message || error);
    });
  } catch (error) {
    console.warn("Chat transcript not saved:", error?.message || error);
  }
};
