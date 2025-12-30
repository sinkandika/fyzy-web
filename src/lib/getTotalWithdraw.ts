import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { FirestorePayout } from "@/types/FirestoreDatabase";

export const getTotalWithdraw = async (): Promise<number> => {

  //fetch payouts database and call amount
  const snapshot = await getDocs(collection(db, "payouts"));

  let totalWithdraw = 0;

  snapshot.forEach((doc) => {
    const data = doc.data() as FirestorePayout;
    const amount = Number(data.amount);

    if (!isNaN(amount) && amount > 0) { // total withdraw calculate here
      totalWithdraw += amount;
    }
  });

  return totalWithdraw;
};
