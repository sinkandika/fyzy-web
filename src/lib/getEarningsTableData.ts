import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { EarningsTableData } from "@/types/EarningsTableData";
import {
  FirestoreInvoice,
  FirestorePayout,
  FirestoreCustomer,
} from "@/types/FirestoreDatabase";

export const getEarningsTableData = async (): Promise<EarningsTableData[]> => {
  const results: EarningsTableData[] = [];

  //  Fetch customers and build lookup map
  const customerSnap = await getDocs(collection(db, "customers"));
  const customerMap: Record<string, string> = {};

  customerSnap.forEach((doc) => {
    const data = doc.data() as FirestoreCustomer;
    customerMap[doc.id] = data.custName;
  });

  //  Fetch invoices (INCOME)
  const invoiceSnap = await getDocs(collection(db, "invoices"));

  invoiceSnap.forEach((doc) => {
    const data = doc.data() as FirestoreInvoice;
    const paidAmount = Number(data.costAmountPaid);

    if (paidAmount > 0) {
      const customerName = customerMap[data.custID] ?? "Unknown Customer";

      results.push({
        id: doc.id,
        description: `${customerName} — ${data.invNumber}`, //combine custName and invNumber
        date: data.lastPaymentAt?.toDate() ?? data.invDate.toDate(), //be a last payment or invoice data date
        amount: paidAmount,
      });
    }
  });

  //  Fetch payouts (WITHDRAW)
  const payoutSnap = await getDocs(collection(db, "payouts"));

  payoutSnap.forEach((doc) => {
    const data = doc.data() as FirestorePayout;

    results.push({
      id: doc.id,
      description: data.method,
      date: data.createAt.toDate(),
      amount: -data.amount, // negative
    });
  });

  // Sort by date (newest first)
  return results.sort((a, b) => b.date.getTime() - a.date.getTime());
};
