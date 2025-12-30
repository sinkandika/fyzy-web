import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

import { InvoiceViewData } from "@/types/InvoiceViewData";

//adjust same with firestore include the data type
//make interface to avoid "any" error
interface FirestoreInvoiceItem {
  itemDescription: string;
  itemQuantity: string; 
  itemRate: string;
  itemAmount?: number;
}

interface FirestoreInvoice {
  invNumber: string;
  invPO: string;
  invDate: Timestamp;
  payDue: Timestamp | null;
  payTerms: string;
  status: string;
  notes: string;

  items: FirestoreInvoiceItem[];

  costSubTotal: number;
  costDiscount: string;
  costTax: string;
  costShipping: string;
  costGrandTotal: number;
  costAmountPaid: string;
  costBalanceDue: number;

  custID: string;
  userID: string;
}

interface FirestoreCustomer {
  custName: string;
  custEmail: string;
  custNumber: string;
  custAddress: string;
}

interface FirestoreUser {
  userName: string;
  userEmail: string;
  userPhone: number;
  userAddress: string;
}

/* ----------------------------------------
   Main function
---------------------------------------- */

export const getInvoiceViewData = async (
  invoiceId: string
): Promise<InvoiceViewData> => {

  //  Fetch invoice
  const invoiceRef = doc(db, "invoices", invoiceId);
  const invoiceSnap = await getDoc(invoiceRef);

  if (!invoiceSnap.exists()) {
    throw new Error("Invoice not found");
  }

  const invoice = invoiceSnap.data() as FirestoreInvoice;

  //  Fetch customer
  const customerRef = doc(db, "customers", invoice.custID);
  const customerSnap = await getDoc(customerRef);

  if (!customerSnap.exists()) {
    throw new Error("Customer not found");
  }

  const customer = customerSnap.data() as FirestoreCustomer;

  //  Fetch user
  const userRef = doc(db, "users", invoice.userID);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found");
  }

  const user = userSnap.data() as FirestoreUser;

  //  Map items (NO any and convert data type to number)
  const items: InvoiceViewData["items"] = invoice.items.map((item) => {
    const quantity = Number(item.itemQuantity) || 0;
    const rate = Number(item.itemRate) || 0;

    return {
      description: item.itemDescription,
      quantity,
      rate,
      amount: quantity * rate,
    };
  });

  // 5️⃣ Return FINAL view model
  return {
    invoice: {
      id: invoiceId,
      number: invoice.invNumber,
      poNumber: invoice.invPO,
      issueDate: invoice.invDate.toDate(),
      dueDate: invoice.payDue ? invoice.payDue.toDate() : null,
      paymentTerms: invoice.payTerms,
      status: invoice.status,
      notes: invoice.notes,
    },

    user: {
      name: user.userName,
      email: user.userEmail,
      phone: user.userPhone,
      address: user.userAddress,
    },

    customer: {
      name: customer.custName,
      email: customer.custEmail,
      phone: customer.custNumber,
      address: customer.custAddress,
    },

    items,

    totals: {
      subTotal: Number(invoice.costSubTotal) || 0,
      discount: Number(invoice.costDiscount) || 0,
      tax: Number(invoice.costTax) || 0,
      shipping: Number(invoice.costShipping) || 0,
      grandTotal: Number(invoice.costGrandTotal) || 0,
      amountPaid: Number(invoice.costAmountPaid) || 0,
      balanceDue: Number(invoice.costBalanceDue) || 0,
    },
  };
};
