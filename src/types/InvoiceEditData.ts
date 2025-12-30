export interface InvoiceEditItem {
  id?: string; 
  description: string;
  quantity: string;
  rate: string;
  amount: number; 
}

export interface InvoiceEditData {
  invoice: {
    id: string;
    number: string;
    poNumber: string;
    issueDate: string;
    dueDate: string;
    paymentTerms: string;
    status: string;
    notes: string;
  };

  customer: {
    id: string;    
    name: string;
    email: string;
    phone: string;
    address: string;
  };

  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };

  items: InvoiceEditItem[];

  totals: {
    subTotal: number;
    discount: string;
    tax: string;
    shipping: string;
    grandTotal: number;
    amountPaid: string;
    balanceDue: number;
  };
}
