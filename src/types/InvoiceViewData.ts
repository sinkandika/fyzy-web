//this structure just for view system (read-only)
export interface InvoiceViewData {
  invoice: {
    id: string;
    number: string;
    poNumber: string;
    issueDate: Date; //use Date only for view/read system
    dueDate?: Date | null;
    paymentTerms: string;
    status: string;
    notes: string;
  };

  user: {
    name: string;
    email: string;
    phone: number;
    address: string;
  };

  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };

  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];

  totals: {
    subTotal: number;
    discount: number;
    tax: number;
    shipping: number;
    grandTotal: number;
    amountPaid: number;
    balanceDue: number;
  };
}