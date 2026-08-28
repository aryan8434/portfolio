import { doc, runTransaction, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export const getOrIncrementFirestoreVisitorCount = async (baseCount = 345, metadata = {}) => {
  if (!db) return null;

  try {
    const visitorDocRef = doc(db, "metrics", "visitors");
    let newCount = null;

    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(visitorDocRef);
      if (!docSnap.exists()) {
        newCount = baseCount + 1;
        transaction.set(visitorDocRef, {
          count: newCount,
          lastVisited: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        });
      } else {
        const currentCount = docSnap.data().count || baseCount;
        newCount = Math.max(currentCount, baseCount) + 1;
        transaction.update(visitorDocRef, {
          count: newCount,
          lastVisited: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        });
      }
    });

    if (newCount !== null) {
      window.localStorage.setItem("pf_visit_count", String(newCount));
      window.localStorage.setItem("pf_visitor_no", String(newCount));

      // Also log detailed visitor record into visitor_logs collection
      try {
        await addDoc(collection(db, "visitor_logs"), {
          visitorNo: newCount,
          timestamp: serverTimestamp(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
          language: typeof navigator !== "undefined" ? navigator.language : "Unknown",
          screen: typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "Unknown",
          referrer: typeof document !== "undefined" ? (document.referrer || "direct") : "direct",
          pagePath: typeof window !== "undefined" ? (window.location.pathname + window.location.search) : "/",
          ...metadata,
        });
      } catch (logErr) {
        console.warn("Visitor log entry not recorded:", logErr?.message || logErr);
      }
    }

    return newCount;
  } catch (error) {
    console.warn("Failed to get/update visitor count in Firestore:", error);
    return null;
  }
};
