import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Timestamp } from "firebase/firestore";

import { InvoiceEditData } from "@/types/InvoiceEditData";
import type {
  FirestoreInvoice,
  FirestoreCustomer,
  FirestoreUser,
} from "@/types/FirestoreDatabase";

//get data from firebase for edit system
export const getInvoiceEditData = async (
  invoiceId: string
): Promise<{
  editData: InvoiceEditData;
  firestoreInvoice: FirestoreInvoice;
}> => {

  // Invoices database
  const invoiceRef = doc(db, "invoices", invoiceId);
  const invoiceSnap = await getDoc(invoiceRef);

  if (!invoiceSnap.exists()) {
    throw new Error("Invoice not found");
  }
  const invoice = invoiceSnap.data() as FirestoreInvoice;

  // Customers database
  const customerRef = doc(db, "customers", invoice.custID);
  const customerSnap = await getDoc(customerRef);

  if (!customerSnap.exists()) {
    throw new Error("Customer not found");
  }
  const customer = customerSnap.data() as FirestoreCustomer;

  // Users database
  const userRef = doc(db, "users", invoice.userID);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User not found");
  }
  const user = userSnap.data() as FirestoreUser;

  // items convert
  const items: InvoiceEditData["items"] = invoice.items.map((item) => {
    const quantity = Number(item.itemQuantity) || 0;
    const rate = Number(item.itemRate) || 0;
    return {
      description: item.itemDescription,
      quantity: item.itemQuantity,
      rate: item.itemRate,
      amount: quantity * rate,
    };
  });

  //convert timestamp to string
  const toDateInput = (ts: Timestamp | null) =>
    ts ? ts.toDate().toISOString().split("T")[0] : "";

  return {
    editData: {
      invoice: {
        id: invoiceId,
        number: invoice.invNumber,
        poNumber: invoice.invPO,
        issueDate: toDateInput(invoice.invDate),
        dueDate: toDateInput(invoice.payDue),
        paymentTerms: invoice.payTerms,
        status: invoice.status,
        notes: invoice.notes,
      },

      customer: {
        id: invoice.custID,
        name: customer.custName || "",
        email: customer.custEmail || "",
        phone: customer.custNumber || "",
        address: customer.custAddress || "",
      },

      user: {
        id: invoice.userID,
        name: user.userName,
        email: user.userEmail,
        phone: user.userPhone,
        address: user.userAddress,
      },

      items,

      totals: {
        subTotal: Number(invoice.costSubTotal) || 0, //convert to number
        discount: invoice.costDiscount,
        tax: invoice.costTax,
        shipping: invoice.costShipping,
        grandTotal: Number(invoice.costGrandTotal) || 0,
        amountPaid: invoice.costAmountPaid,
        balanceDue: Number(invoice.costBalanceDue) || 0,
      },
    },

    firestoreInvoice: invoice,
  };

};

