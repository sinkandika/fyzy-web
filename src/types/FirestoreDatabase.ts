import { Timestamp } from "firebase/firestore";

// this not connect to firestore yet
// write excatly same with firestore data type

// Item inside invoice database
export interface FirestoreInvoiceItem {
  itemDescription: string;
  itemQuantity: string;
  itemRate: string;
  itemAmount?: number;
}

// Invoice database
export interface FirestoreInvoice {
  invNumber: string;
  invPO: string;
  invDate: Timestamp;
  payDue: Timestamp | null;
  payTerms: string;
  status: string; // invoice status paid, unpaid, etc (declare in standard invoice page.tsx)
  notes: string;

  items: FirestoreInvoiceItem[];

  costSubTotal: number;
  costDiscount: string;
  costTax: string;
  costShipping: string;
  costGrandTotal: number;
  costAmountPaid: string;
  costBalanceDue: number;

  custID: string; // customer generated Id
  userID: string; // user generated Id

  // new date update for earnings table
  lastPaymentAt: Timestamp | null;

}

// Customer database
export interface FirestoreCustomer {
  custName: string;
  custEmail: string;
  custAddress: string;
  custNumber: string;
}

// User database
export interface FirestoreUser {
  userName: string;
  userEmail: string;
  userPhone: string;
  userAddress: string;
}

// withdrawals database
export interface FirestorePayout {
  amount: number;
  method: string;
  email: string;
  createAt: Timestamp;
}

