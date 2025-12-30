import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

export interface InvoiceCounter {
  total: number;
  paid: number;
  unpaid: number;
  overdue: number;
  partial: number;
}

export const getInvoiceCounter = async (): Promise<InvoiceCounter> => {
  // get status from invoices database
  const snapshot = await getDocs(collection(db, "invoices"));

  const counter: InvoiceCounter = {
    total: snapshot.size, // ✅ ALL invoices
    paid: 0,
    unpaid: 0,
    overdue: 0,
    partial: 0,
  };

  snapshot.forEach((doc) => {
    const data = doc.data();
    const status = String(data.status || "").toLowerCase(); // change status data into lowercase

    switch (status) {
      case "paid":
        counter.paid++;
        break;
      case "unpaid":
        counter.unpaid++;
        break;
      case "overdue":
        counter.overdue++;
        break;
      case "partial":
        counter.partial++;
        break;
    }
  });

  return counter;
};
