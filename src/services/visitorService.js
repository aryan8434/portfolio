import { doc, runTransaction } from "firebase/firestore";
import { db } from "../config/firebase";

export const getOrIncrementFirestoreVisitorCount = async (baseCount) => {
  if (!db) return null;

  try {
    // Prevent counting the same visitor multiple times
    const mine = window.localStorage.getItem("pf_firestore_visitor_no");
    if (mine && Number.isFinite(Number(mine))) return Number(mine);

    const visitorDocRef = doc(db, "metrics", "visitors");
    let newCount = null;

    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(visitorDocRef);
      if (!docSnap.exists()) {
        newCount = baseCount + 1;
        transaction.set(visitorDocRef, { count: newCount });
      } else {
        const currentCount = docSnap.data().count || baseCount;
        newCount = Math.max(currentCount, baseCount) + 1;
        transaction.update(visitorDocRef, { count: newCount });
      }
    });

    if (newCount !== null) {
      window.localStorage.setItem("pf_firestore_visitor_no", String(newCount));
    }
    return newCount;
  } catch (error) {
    console.warn("Failed to get/update visitor count in Firestore:", error);
    return null;
  }
};
