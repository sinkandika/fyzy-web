import { db } from "@/firebase/config"
import { FirestoreInvoice } from "@/types/FirestoreDatabase";
import { collection, getDocs } from "firebase/firestore"


export const getTotalIncome = async (): Promise<number> => {

  // make total income fetch all costAMountPaid data
  const snapshot = await getDocs(collection(db, "invoices"));

  let totalIncome = 0;

  snapshot.forEach((doc) => {
    const data = doc.data() as FirestoreInvoice;
    const paid = Number(data.costAmountPaid); //get constAMountPaid and convert to number

    if (!isNaN(paid) && paid > 0) { // total income calculate here
      totalIncome += paid;
    }
  });

  return totalIncome;
};
