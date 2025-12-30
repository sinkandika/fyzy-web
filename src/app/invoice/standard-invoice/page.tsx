"use client";

import { Input, Table, message } from "antd";
import { CSSProperties, useState } from "react";
import { db } from "@/firebase/config";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import '@fontsource/open-sauce-sans'; //just for CSS on the ant table
import { useRouter } from "next/navigation";
import Image from "next/image";

//table item 
interface tableList {
    key: string;
    description: string;
    rate: string;
    quantity: string;
    amount: number
}

export default function StandardInvoicePage() {

  const [tax, setTax] = useState("");
  const [discount, setDiscount] = useState("");
  const [shipping, setShipping] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  const [tableItems, setTableItems] = useState<tableList[]>([
    {
        key: "1",
        description: "",
        rate: "",
        quantity: "1",
        amount: 0,
    },
  ]);

  //calculation
  const calcTableItems = (
    key: string,
    field: keyof tableList,
    value: string
  ) => {
    setTableItems(prev =>
      prev.map(item => {
      if (item.key !== key) return item;

      const newItem = { ...item, [field]: value };

      // Recalculate amount only if rate/quantity changed
      if (field === "quantity" || field === "rate") {
          const rate = Number(newItem.rate) || 0;
          const qty = Number(newItem.quantity) || 0;

          // Round to 2 decimals to fix floating point issue
          newItem.amount = Number((rate * qty).toFixed(2));
      }
      return newItem;
      })
    );
  };

  //table title and blank input row
  const tableColumns = [
    {
      title: "Item Description",
      dataIndex: "description",
      onHeaderCell: (): { style: CSSProperties } => ({
        style: { 
          backgroundColor: "#637A54",
          color: "white",
          fontFamily: "Open Sauce Sans",
          fontWeight: "normal",
          border: "none",
          width: "50%",
          borderRadius: "0",
          padding: "9px 15px",
          fontSize: "15px",
        },
      }),
      render: (_: unknown, record: tableList) =>
        <Input
          placeholder="Item description"
          type="text"
          value={record.description}
          onChange={(e) =>
              calcTableItems(record.key, "description", e.target.value)
          }
          style={{
            fontSize: "15px",
            padding: "9px 15px",
            borderColor: "#5B5B5B",
            color: "##191413",
          }}
        />
    },        
    {
      title: "Rate",
      dataIndex: "rate",
      onHeaderCell: (): { style: CSSProperties } => ({
        style: { 
          backgroundColor: "#637A54",
          color: "white",
          fontFamily: "Open Sauce Sans",
          fontWeight: "normal",
          letterSpacing: "0.5px",
          border: "none",
          width: "20%",
          borderRadius: "0",
          padding: "0px 15px", //padding for all title
          fontSize: "15px",
        },
      }),
      render: (_: unknown, record: tableList) => (
        <div className="flex relative items-center justify-between">
          <Input
            placeholder="0.00"
            type="number"
            value={record.rate ?? ""}
            onChange={(e) =>
              calcTableItems(record.key, "rate", e.target.value)
            }
            style={{
              fontSize: "15px",
              padding: "9px 15px",
              borderColor: "#5B5B5B",
              color: "#191413",
              paddingLeft: "18px"
            }}
          />
          <span className="absolute left-2  text-[#191413]">
            $
          </span>
        </div>
      )
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      onHeaderCell: (): { style: CSSProperties } => ({
        style: { 
          backgroundColor: "#637A54",
          color: "white",
          fontFamily: "Open Sauce Sans",
          fontWeight: "normal",
          letterSpacing: "0.5px",
          border: "none",
          width: "13%",
          borderRadius: "0",
          padding: "0px 15px",
          fontSize: "15px",
        },
      }),
      render: (_: unknown, record: tableList) =>
        <Input 
          placeholder="0"
          type="number"
          value={record.quantity ?? ""}
          onChange={(e) =>
              calcTableItems(record.key, "quantity", e.target.value)
          }
          style={{
            fontSize: "15px",
            padding: "9px 15px",
            borderColor: "#5B5B5B",
            color: "##191413",
          }}
        />
    },
    {
      title: "Amount",
      dataIndex: "amount",
      onHeaderCell: (): { style: CSSProperties } => ({
        style: { 
          backgroundColor: "#637A54",
          color: "white",
          fontFamily: "Open Sauce Sans",
          fontWeight: "normal",
          letterSpacing: "0.5px",
          border: "none",
          width: "20%",
          borderRadius: "0",
          padding: "0px 15px",
          fontSize: "15px",
        },
      }),
        render: (_: unknown, record: tableList) =>
          <Input
            disabled
            prefix="$"
            placeholder="$0.00"
            type="number"
            value={record.amount ?? ""}
            onChange={(e) =>
                calcTableItems(record.key, "amount", e.target.value)
            }
            style={{
            fontSize: "15px",
            padding: "9px 15px",
            border: "none",
            pointerEvents: "none",
            color: "#191413",
            backgroundColor: "white",
          }}
          />
    },
  ];

  //make new input row
  const handleAddNewRow = () => {
    const newKey = (tableItems.length + 1).toString();
    setTableItems([
      ...tableItems,
      { key: newKey, 
        description: "", 
        rate: "", 
        quantity: "1", 
        amount: 0 }
    ]);
  };

  const subTotal = tableItems.reduce((sum, item) => {
    return sum + (Number(item.amount) || 0);
  }, 0);

  const taxAmount = (subTotal * Number(tax || 0)) / 100;
  const discountAmount = (subTotal * Number(discount || 0)) / 100;

  const grandTotal = Number(
    (subTotal + taxAmount - discountAmount + Number(shipping || 0)).toFixed(2)
  );

  const balanceDue = Number((grandTotal - Number(amountPaid || 0)).toFixed(2));


  const [customerName, setCustomerName] = useState ("");
  const [customerEmail, setCustomerEmail] = useState ("");
  const [customerAdress, setCustomerAdress] = useState ("");
  const [customerNumber, setCustomerNumber] = useState ("");

  const [myAddress, setMyAddress] = useState ("");
  const [myEmail, setMyEmail] = useState ("");    
  const [myName, setMyName] = useState ("");    
  const [myNumber, setMyNumber] = useState ("");

  //cost amountpaid, balancedue, etc on line 17
  const [invoiceDate, setInvoiceDate] = useState ("");
  const [invoiceNumber, setInvoiceNumber] = useState ("");
  const [invoicePO, setInvoicePO] = useState ("");
  const [invoiceNote, setInvoiceNote] = useState ("");
  const [paymentDue, setPaymentDue] = useState ("");
  const [paymentTerms, setPaymentTerms] = useState ("");
  const [saveLoading, setSaveLoading] = useState(false);
  const router = useRouter();


  //save invoice system
  const saveInvoice = async () => { 
    if (saveLoading) return;
    // 🚫 Prevent saving empty invoice
    if (tableItems.length === 0) {
      message.error("Please add at least one item before saving.");
      return;
    }
    // 🚫 Prevent saving if any row is empty or invalid
    const hasInvalidItem = tableItems.some(item =>
      !item.description.trim() ||
      !item.rate || parseFloat(item.rate) <= 0 ||
      !item.quantity || parseFloat(item.quantity) <= 0
    );
    if (hasInvalidItem) {
      message.error("Please complete item table field before saving.");
      return;
    }
    setSaveLoading(true);

    // get customers database
    try {
    const customersData = {
      custName: customerName,
      custEmail: customerEmail,
      custAddress: customerAdress,
      custNumber: customerNumber,
      createAt: new Date(),
    };
    const customerRef = await addDoc(collection(db, "customers"), customersData);
    const customerId = customerRef.id; //generate customer ID

    //get users database
    const userData = {
      userAddress: myAddress,
      userEmail: myEmail,
      userName: myName,
      userPhone: myNumber,
      createAt: new Date(),
    };
    const userRef = await addDoc(collection(db, "users"), userData);
    const userId = userRef.id; //generate user ID`

    //rename to make same with in firebase
    const invoicesItems = tableItems.map(item => ({
      itemDescription: item.description,
      itemRate: item.rate,            
      itemQuantity: item.quantity,
      itemAmount: item.amount,
    }))

    // paid, unpaid, partial method
    const paid = Number(amountPaid) || 0;
    const total = Number(grandTotal.toFixed(2)) || 0;

    let invoiceStatus:
      | "Overpaid"
      | "Paid"
      | "Partial"
      | "Unpaid"
      | "Overdue" = "Unpaid";

    // OVERPAID
    if (paid > total && total > 0) {
      invoiceStatus = "Overpaid";
    }
    // PAID
    else if (paid === total && total > 0) {
      invoiceStatus = "Paid";
    }
    // PARTIAL
    else if (paid > 0 && paid < total) {
      invoiceStatus = "Partial";
    }

    // OVERDUE CHECK
    const today = new Date();
    const dueDate = paymentDue
      ? new Date(paymentDue)
      : new Date(invoiceDate || Date.now());

    if (
      invoiceStatus !== "Paid" &&
      invoiceStatus !== "Overpaid" &&
      today > dueDate
    ) {
      invoiceStatus = "Overdue";
    }

    //get invoices database
    const invoiceData = {
      userID: userId,
      custID: customerId,

      costAmountPaid: Number(amountPaid),
      costBalanceDue: Number(balanceDue),
      costDiscount: Number(discount),
      costGrandTotal: Number(grandTotal),
      costShipping: Number(shipping),
      costSubTotal: Number(subTotal),
      costTax: Number(tax),

      invDate: invoiceDate
        ? Timestamp.fromDate(new Date(invoiceDate))
        : Timestamp.now(),

      payDue: paymentDue
        ? Timestamp.fromDate(new Date(paymentDue))
        : Timestamp.fromDate(new Date(invoiceDate || Date.now())),

      invNumber: invoiceNumber,
      invPO: invoicePO,
      notes: invoiceNote,
      payTerms: paymentTerms,
      status: invoiceStatus,

      items: invoicesItems,

      createdAt: Timestamp.now(),
      // new date update for earnings table
      lastPayment: Number(amountPaid) > 0 ? Timestamp.now() : null
    };
    await addDoc(collection(db, "invoices"), invoiceData);
    router.push("/invoice")
    } 
    catch (error) {
      console.error("Error saving invoice", error);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex bg-[#97A597] justify-center gap-x-5 p-20 xl:flex-row flex-col gap-y-5 min-w-lg">
      <form className="bg-white px-10 py-8">

        <div className="">
            <h1 className="flex items-center mb-5 text-4xl font-opensans font-bold text-[#191413]">STANDAR INVOICE</h1>
        </div>

        <div className="flex gap-x-8 flex-col lg:flex-row">
          <div className="flex flex-1 flex-col gap-y-5">
            <div className="flex flex-col gap-y-5">
              <div className="font-opensans text-white bg-[#637A54] py-2 text-md">
                <p className="ml-3">Customer Information:</p>
              </div>
              <div className="flex font-opensans justify-between items-center text-[#5B5B5B]">
                <label className="ml-3 w-full">Customer Name</label>
                <input type="text" className="w-full border py-2 px-4 border-[#5B5B5B] focus:outline-[#637A54] rounded-sm" value={customerName} onChange={(e) => setCustomerName(e.target.value)}/>
              </div>
              <div className="flex font-opensans justify-between items-center text-[#5B5B5B]">
                <label className="ml-3 w-full">Customer Email</label>
                <input type="email" className="w-full border py-2 px-4 border-[#5B5B5B] focus:outline-[#637A54] rounded-sm" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)}/>
              </div>
              <div className="flex font-opensans justify-between items-center text-[#5B5B5B]">
                <label className="ml-3 w-full">Customer Phone Number</label>
                <input type="number" className="w-full border py-2 px-4 border-[#5B5B5B] focus:outline-[#637A54] rounded-sm" value={customerNumber} onChange={(e) => setCustomerNumber(e.target.value)}/>
              </div>
              <div className="flex font-opensans justify-between text-[#5B5B5B]">
                <label className="ml-3 w-full">Customer Address</label>
                <textarea className="border w-full py-2 px-4 border-[#5B5B5B] focus:outline-[#637A54] rounded-sm" value={customerAdress} onChange={(e) => setCustomerAdress(e.target.value)}/>
              </div>
            </div>

            <div className="flex flex-col gap-y-5">
              <div className="font-opensans text-white bg-[#637A54] py-2 text-md">
                <p className="ml-3">Your Information:</p>
              </div>
              <div className="flex font-opensans justify-between items-center text-[#5B5B5B]">
                <label className="ml-3 w-full">Name</label>
                <input type="text" className="border w-full py-2 px-4 border-[#5B5B5B] focus:outline-[#637A54] rounded-sm" value={myName} onChange={(e) => setMyName(e.target.value)}/>
              </div>
              <div className="flex font-opensans justify-between items-center text-[#5B5B5B]">
                <label className="ml-3 w-full">Email</label>
                <input type="email" className="border w-full py-2 px-4 border-[#5B5B5B] focus:outline-[#637A54] rounded-sm" value={myEmail} onChange={(e) => setMyEmail(e.target.value)}/>
              </div>
              <div className="flex font-opensans justify-between items-center text-[#5B5B5B]">
                <label className="ml-3 w-full">Phone Number</label>
                <input type="number" className="border w-full py-2 px-4 border-[#5B5B5B] focus:outline-[#637A54] rounded-sm" value={myNumber} onChange={(e) => setMyNumber(e.target.value)}/>
              </div>
              <div className="flex font-opensans justify-between text-[#5B5B5B]">
                <label className="ml-3 w-full">Address</label>
                <textarea className="border w-full py-2 px-4 border-[#5B5B5B] focus:outline-[#637A54] rounded-sm" value={myAddress} onChange={(e) => setMyAddress(e.target.value)}/>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-y-5 lg:mt-0 mt-5">
            <div className="flex flex-col gap-y-5">
              <div className="font-opensans text-white bg-[#637A54] py-2 text-md">
                <p className="ml-3">Invoice Information</p>
              </div>
              <div className="flex font-opensans justify-between items-center text-[#5B5B5B]"> 
                <label className="ml-3 w-full">Invoice Number</label>
                <input type="text" className="border w-full py-2 px-4 border-[#5B5B5B] focus:outline-[#637A54] rounded-sm" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)}/>
              </div>
              <div className="flex font-opensans justify-between items-center text-[#5B5B5B]">
                <label className="ml-3 w-full">Invoice Date</label>
                <input type="date" className="border w-full py-2 px-4 border-[#5B5B5B] focus:outline-[#637A54] rounded-sm" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}/>
              </div>
              <div className="flex font-opensans justify-between items-center text-[#5B5B5B]">
                <label className="ml-3 w-full">P.O Number</label>
                <input type="text" className="border w-full py-2 px-4 border-[#5B5B5B] focus:outline-[#637A54] rounded-sm" value={invoicePO} onChange={(e) => setInvoicePO(e.target.value)}/>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-y-5">
              <div className="font-opensans text-white bg-[#637A54] py-2 text-md">
                <p className="ml-3">Payment Details</p>
              </div>
              <div className="flex font-opensans justify-between items-center text-[#5B5B5B]">
                <label className="ml-3 w-full">Payment terms</label>
                <input type="text" className="border w-full py-2 px-4 rounded-sm" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}/>
              </div>
              <div className="flex font-opensans justify-between items-center text-[#5B5B5B]">
                <label className="ml-3 w-full">Due Date</label>
                <input type="date" className="border w-full py-2 px-4 rounded-sm" value={paymentDue} onChange={(e) => setPaymentDue(e.target.value)}/>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Table
            columns={tableColumns}
            pagination={false}
            dataSource={tableItems}
            scroll={{ x: "max-content"}}
            className="font-opensans"
          />
          <button 
          type="button"
          className="bg-[#637A54] space-x-1 flex text-white py-2.5 px-4 rounded-md hover:bg-[#798C69] transition-colors duration-200 font-opensans text-sm mt-3"
          onClick={handleAddNewRow}
          >
            <p>Add new item</p>
            <Image 
            src="/add-icon.svg" 
            alt="add-icon"
            width={13}
            height={13} 
            className=""
            />
          </button>
        </div>
        <div className="flex gap-x-8 mt-10 font-opensans flex-col lg:flex-row">
          <div className="flex-2 flex flex-col gap-y-2">
              <label>Notes:</label>
              <textarea className="border px-2 rounded-sm border-[#5B5B5B] focus:outline-[#637A54]" 
              value={invoiceNote} onChange={(e) => setInvoiceNote(e.target.value)}/>
          </div>
          <div className="flex-1 flex-col flex gap-y-5 lg:mt-0 mt-5">
            <div className="flex flex-row items-center justify-between">
                <label>Subtotal:</label>
                <input
                  className="px-2 py-2 rounded-sm w-25"
                  disabled
                  placeholder="$0.00"
                  value={`$ ${subTotal.toFixed(2)}`}
                />
            </div>
            <div className="flex relative items-center justify-between ">
              <label>Tax:</label>
              <input
                type="number"
                className="border px-2 py-2 rounded-sm border-[#5B5B5B] focus:outline-[#637A54] w-25"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                placeholder="0"
              />
              <span className="absolute right-2 bg-white">%</span>
            </div>
            <div className="flex relative items-center justify-between">
              <label>Discount:</label>
              <input
                type="number"
                className="border px-2 py-2 rounded-sm border-[#5B5B5B] focus:outline-[#637A54] w-25"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)} 
                placeholder="0" 
              />
              <span className="absolute right-2 bg-white">%</span>
            </div>
            <div className="flex items-center justify-between relative">
              <label className="mr-4">Shipping:</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2">$</span>
                <input
                  type="number"
                  className="border pl-6 py-2 rounded-sm border-[#5B5B5B] focus:outline-[#637A54] w-25"
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex flex-row items-center justify-between">
              <label>Grand Total:</label>
              <input 
                className="px-2 py-2 rounded-sm w-25"
                disabled
                placeholder="$0.00"
                value={`$ ${grandTotal.toFixed(2)}`}
              />
            </div>
            <div className="flex items-center justify-between relative">
              <label>Amount Paid:</label>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2">$</span>
                <input
                  type="number"
                  className="border px-6 py-2 rounded-sm border-[#5B5B5B] focus:outline-[#637A54] w-25"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex flex-row items-center justify-between">
              <label>Balance Due:</label>
              <input 
                className="px-2 py-2 rounded-sm w-25"
                disabled
                placeholder="$0.00"
                value={`$ ${balanceDue.toFixed(2)}`}
              />
            </div>
          </div>
        </div>
      </form>
      <div>
        <div className="bg-white py-5 px-10 rounded-md flex justify-center md:justify-end">
          <button
          className="bg-[#637A54] text-white py-2 px-4 rounded-md hover:bg-[#798C69] transition-colors duration-200 font-opensans text-xl"
          type="button"
          disabled={saveLoading}
          onClick={saveInvoice}
          >
            {saveLoading ? "Saving..." : "Save Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
}