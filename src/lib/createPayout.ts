import { addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import { FirestorePayout } from "@/types/FirestoreDatabase";

export const createPayout = async (
  data: Omit<FirestorePayout, "createAt">
) => {
  await addDoc(collection(db, "payouts"), {
    ...data,
    createAt: Timestamp.now(),
  });
};
