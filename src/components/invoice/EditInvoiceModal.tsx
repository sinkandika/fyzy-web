"use client";

import { CSSProperties, useEffect, useState } from "react";
import { Modal, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { doc, Timestamp, setDoc, writeBatch } from "firebase/firestore";
import { db } from "@/firebase/config";

import { getInvoiceEditData } from "@/lib/getInvoiceEditData";
import { InvoiceEditData } from "@/types/InvoiceEditData";
import type { FirestoreInvoice } from "@/types/FirestoreDatabase";

interface EditInvoiceModalProps {
  open: boolean;
  invoiceId: string;
  onClose: () => void;
  onRefresh: () => Promise<void>
}

//edit table data in modal
export interface EditTableInvoice {
  key: string;
  description: string;
  quantity: string; // input
  rate: string;     // input
  amount: number;   // calculated
}

export default function EditInvoiceModal({
  open,
  invoiceId, 
  onClose,
  onRefresh
}: EditInvoiceModalProps) {
  
  const [data, setData] = useState<InvoiceEditData | null>(null);
  const [firestoreInvoice, setFirestoreInvoice] = useState<FirestoreInvoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //get invoice data
  useEffect(() => {
    if (!open) return;
    const loadInvoice = async () => {
      try {
        setLoading(true);
        const result = await getInvoiceEditData(invoiceId);
        setData(result.editData);
        setFirestoreInvoice(result.firestoreInvoice);


      } catch (err) {
        setError("Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [open, invoiceId]);

  //invoice table edit + blank row modal
  const editTableData: EditTableInvoice[] =
    data?.items.map((item, index) => ({
      key: index.toString(),
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
    })) || [];

  const editTableColumns: ColumnsType<EditTableInvoice> = [
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      onHeaderCell: (): { style: CSSProperties } => ({
        style: { 
          backgroundColor: "#597F40",
          color: "white",
          fontFamily: "Open Sauce Sans",
          fontWeight: "normal",
          border: "none",
          borderRadius: "0",
          padding: "10px 15px",
          fontSize: "12px",
          width: "50%",
        },
      }),
      render: (_, record, index) => (
        <input
          value={record.description} //get items->description
          onChange={(e) => {
            if (!data) return;

            const items = [...data.items];
            items[index].description = e.target.value;

            setData({ ...data, items });
          }}
          className="border px-2 py-1 w-full focus:outline-[#597F40]"
        />
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      onHeaderCell: (): { style: CSSProperties } => ({
        style: { 
          backgroundColor: "#597F40",
          color: "white",
          fontFamily: "Open Sauce Sans",
          fontWeight: "normal",
          border: "none",
          borderRadius: "0",
          padding: "0px 15px",
          fontSize: "12px",
          width: "10%",
        },
      }),
      render: (_, record, index) => (
        <input
          type="number"
          value={record.quantity}
          onChange={(e) => {
            if (!data) return;

            const items = [...data.items];
            items[index].quantity = e.target.value;

            const qty = Number(items[index].quantity) || 0;
            const rate = Number(items[index].rate) || 0;
            items[index].amount = qty * rate;

            setData({ ...data, items });
          }}
          className="border px-2 py-1 w-full text-center focus:outline-[#597F40]"
        />
      ),
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      align: "right",
      onHeaderCell: (): { style: CSSProperties } => ({
        style: { 
          backgroundColor: "#597F40",
          color: "white",
          fontFamily: "Open Sauce Sans",
          fontWeight: "normal",
          border: "none",
          borderRadius: "0",
          padding: "0px 15px",
          fontSize: "12px",
          width: "15%",
        },
      }),
      render: (_, record, index) => (
        <div>
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#191413] bg-white">
            $
          </span>
          <input
            type="number"
            value={record.rate}
            onChange={(e) => {
              if (!data) return;
              const items = [...data.items];
              items[index].rate = e.target.value;
              const qty = Number(items[index].quantity) || 0;
              const rate = Number(items[index].rate) || 0;
              items[index].amount = qty * rate;
              setData({ ...data, items });
            }}
            className="border px-2 py-1 w-full text-right focus:outline-[#597F40]"
          />
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      onHeaderCell: (): { style: CSSProperties } => ({
        style: { 
          backgroundColor: "#597F40",
          color: "white",
          fontFamily: "Open Sauce Sans",
          fontWeight: "normal",
          border: "none",
          borderRadius: "0",
          padding: "0px 15px",
          fontSize: "12px",
          width: "20%",
        },
      }),
      render: (value) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
    },
  ];

  //new row system
  const handleAddNewRow = () => {
    if (!data) return;

    const newItem = {
      description: "",
      quantity: "1",
      rate: "",
      amount: 0,
    };

    setData({
      ...data,
      items: [...data.items, newItem],
    });
  };

  //calculating totals
  const calculateTotals = (items: InvoiceEditData["items"], totals: InvoiceEditData["totals"]) => {
    const subTotal = items.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    const discount = Number(totals.discount) || 0;
    const tax = Number(totals.tax) || 0;
    const shipping = Number(totals.shipping) || 0;
    const amountPaid = Number(totals.amountPaid) || 0;

    const grandTotal = subTotal - discount + tax + shipping;
    const balanceDue = grandTotal - amountPaid;

    return {
      ...totals,
      subTotal,
      grandTotal,
      balanceDue,
    };
  };

  useEffect(() => {
    if (!data) return;
    const updatedTotals = calculateTotals(data.items, data.totals);
    setData((prev) =>
      prev
        ? {
            ...prev,
            totals: updatedTotals,
          }
        : prev
    );
  }, [data?.items]);

  //update all database and send to firestore
  const handleApplyChanges = async () => {
    if (!data || !firestoreInvoice) return;

    try {
      const finalTotals = calculateTotals(data.items, data.totals);

      // PAID / PARTIAL / UNPAID / OVERDUE LOGIC
      const paid = Number(finalTotals.amountPaid) || 0;
      const total = Number(finalTotals.grandTotal.toFixed(2)) || 0;

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

      // OVERDUE
      const today = new Date();
      const dueDate = data.invoice.dueDate
        ? new Date(data.invoice.dueDate)
        : null;

      if (
        invoiceStatus !== "Paid" &&
        invoiceStatus !== "Overpaid" &&
        dueDate &&
        today > dueDate
      ) {
        invoiceStatus = "Overdue";
      }

      // new date update or earnings table
      const prevPaid = Number(firestoreInvoice.costAmountPaid || 0);
      const newPaid = Number(finalTotals.amountPaid || 0);
      const paymentChanged = prevPaid !== newPaid;

      const paymentTimestamp = paymentChanged
        ? Timestamp.now()
        : firestoreInvoice.lastPaymentAt ?? null;

        const batch = writeBatch(db);

      // Invoice update
      batch.update(doc(db, "invoices", invoiceId), {
        invNumber: data.invoice.number,
        invPO: data.invoice.poNumber,
        invDate: Timestamp.fromDate(new Date(data.invoice.issueDate)),
        payDue: data.invoice.dueDate
          ? Timestamp.fromDate(new Date(data.invoice.dueDate))
          : null,
        payTerms: data.invoice.paymentTerms,
        notes: data.invoice.notes,

        status: invoiceStatus,

        items: data.items.map((item) => ({
          itemDescription: item.description,
          itemQuantity: String(item.quantity),
          itemRate: String(item.rate),
          itemAmount: Number(item.amount) || 0,
        })),

        costSubTotal: finalTotals.subTotal,
        costDiscount: finalTotals.discount,
        costTax: finalTotals.tax,
        costShipping: finalTotals.shipping,
        costGrandTotal: finalTotals.grandTotal,
        costAmountPaid: finalTotals.amountPaid,
        costBalanceDue: finalTotals.balanceDue,
        
        // new date update or earnings table
        lastPaymentAt: paymentTimestamp,

      });

      // Customer update
      batch.update(doc(db, "customers", firestoreInvoice.custID), {
        custName: data.customer.name,
        custEmail: data.customer.email,
        custAddress: data.customer.address,
        custNumber: data.customer.phone,
      });

      // User update
      batch.update(doc(db, "users", firestoreInvoice.userID), {
        userName: data.user.name,
        userEmail: data.user.email,
        userAddress: data.user.address,
        userPhone: data.user.phone,
      });

      await batch.commit();
      await onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update invoice");
    }
  };

  return (
    <Modal
      key={invoiceId}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="auto"
      maskClosable={false}
      style={{
          padding: 2,
      }}
    >
      {/* loading edit */}
      {loading && (
        <div className="flex justify-center items-center p-10">
          <Spin />
        </div>
      )}

      {/* error load edit */}
      {!loading && error && (
        <p className="text-red-500">{error}</p>
      )}
      
      {/* content inside modal */}
      {!loading && data && (

        <div className=" overflow-x-auto p-6 space-y-2">

          <div className="invoice-A4-paper font-opensans space-y-8">

            <div className="flex flex-col space-y-0.5 py-2">
              <span className="text-4xl font-medium text-[#191413]">EDIT INVOICE</span>
              <input
                value={data.invoice.number ?? ""} // show the current data using ?? "" for safe
                onChange={(e) => {                //track data change
                  setData({... data, invoice:
                    {
                      ...data.invoice, number: e.target.value,
                    }
                  })
                }}
              className="text-md text-[#5B5B5B] ml-1"/>
            </div>

            <div className="flex flex-row space-x-25">
              <div className="flex-1 text-sm space-y-10">
                <div className="flex flex-col">
                  <span className="px-2">To:</span>
                  <div className="flex flex-col font-bold">
                    <input
                    value={data.customer.name ?? ""}
                    onChange={(e) => {
                      setData({ ...data, customer:
                        {
                          ...data.customer, name: e.target.value,
                        },
                      })
                    }}
                    className="px-2"
                    />
                    <input
                    value={data.customer.email ?? ""}
                    onChange={(e) => {
                      setData({ ...data, customer:
                        {
                          ...data.customer, email: e.target.value,
                        },
                      })
                    }}
                    className="px-2"
                    />
                    <input
                    value={data.customer.address ?? ""}
                    onChange={(e) => {
                      setData({ ...data, customer:
                        {
                          ...data.customer, address: e.target.value,
                        },
                      })
                    }}
                    className="px-2"
                    />
                    <input
                    value={data.customer.phone ?? ""}
                    onChange={(e) => {
                      setData({ ...data, customer:
                        {
                          ...data.customer, phone: e.target.value,
                        },
                      })
                    }}
                    className="px-2"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="px-2">From:</span>
                  <div className="flex flex-col font-bold">
                    <input
                    value={data.user.name ?? ""}
                    onChange={(e) => {
                      setData({ ...data, user:
                        {
                          ...data.user, name: e.target.value,
                        }
                      })
                    }}
                    className="px-2"
                     />
                     <input
                      value={data.user.email ?? ""}
                      onChange={(e) => {
                        setData({ ...data, user:
                          {
                            ...data.user, email: e.target.value,
                          }
                        })
                      }}
                      className="px-2"
                     />
                     <input
                      value={data.user.address ?? ""}
                      onChange={(e) => {
                        setData({ ...data, user:
                          {
                            ...data.user, address: e.target.value,
                          }
                        })
                      }}
                      className="px-2"
                     />
                     <input
                      value={data.user.phone ?? ""}
                      onChange={(e) => {
                        setData({ ...data, user:
                          {
                            ...data.user, phone: e.target.value,
                          }
                        })
                      }}
                      className="px-2"
                     />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex-col text-sm space-y-1">
                <div className="flex justify-between py-1 px-2">
                  <span>Invoice Date:</span>
                  <input
                    type="date"
                    value={data.invoice.issueDate ?? ""}
                    onChange={(e) => {
                    setData({...data, invoice:
                      {
                        ...data.invoice, issueDate: e.target.value,
                      }
                    })
                    }}
                    className="px-2 font-bold"
                    />
                </div>
                <div className="flex justify-between py-1 px-2">
                  <span className="">PO Number:</span>
                  <input 
                  value={data.invoice.poNumber ?? ""}
                  onChange={(e) => {
                    setData({...data, invoice:
                      {
                        ...data.invoice, poNumber: e.target.value,
                      }
                    })
                  }}
                  className="w-30 px-2 font-bold"
                  />
                </div>
                  <div className="flex  justify-between py-1 px-2">
                    <span>Payment Terms:</span>
                    <input 
                    value={data.invoice.paymentTerms ?? ""}
                    onChange={(e) => {
                      setData({...data, invoice:
                        {
                          ...data.invoice, paymentTerms: e.target.value,
                        }
                      })
                    }}
                    className="w-30 px-2 font-bold"
                    />
                  </div>
                  <div className="flex justify-between py-1 px-2">
                    <span>Due Date:</span>
                    <input
                    type="date"
                    value={data.invoice.dueDate ?? ""}
                    onChange={(e) => {
                      setData({...data, invoice:
                        {
                          ...data.invoice, dueDate: e.target.value,
                        }
                      })
                    }}
                    className="px-2 font-bold"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Table
                columns={editTableColumns}
                dataSource={editTableData}
                pagination={false}
                size="small"
                />
                <button 
                  type="button"
                  className="bg-[#597F40] space-x-1 flex text-white py-1.5 px-3 hover:bg-[#466B2D] transition-colors duration-200 mt-2"
                  onClick={handleAddNewRow}
                  >
                    <p>Add new item</p>
                  </button>
              </div>

              <div className="flex flex-row space-x-25">
                <div className="flex-2 flex-col text-sm">
                  <span>Notes:</span>
                  <textarea
                  value={data.invoice.notes ?? ""}
                  onChange={(e) => {
                    setData({...data, invoice:
                      {
                        ...data.invoice, notes: e.target.value,
                      }
                    })
                  }}
                  className="border w-full min-h-20 px-2 py-1 focus:outline-[#597F40] mt-2 font-bold"
                  />
                </div>

                <div className="flex-1 flex flex-col space-y-1 text-sm">
                  <div className="flex relative items-center justify-between py-1 px-2">
                    <span>Subtotal:</span>
                    <span className="absolute right-19 font-bold">$</span>
                    <input
                      value= {`${data.totals.subTotal.toFixed(2) ?? ""}`}
                      disabled
                      placeholder="$0.00"
                      onChange={(e) =>
                        setData({
                          ...data,
                          totals: calculateTotals(data.items, {
                            ...data.totals,
                            subTotal: parseFloat(e.target.value) || 0, // convert to number
                          }),
                        })
                      }
                      className="w-20 text-right font-bold pl-3"
                    />
                  </div>
                  <div className="flex relative items-center justify-between py-1 px-2">
                    <span className="">Tax:</span>
                    <input
                      type="number"
                      value={data.totals.tax ?? ""}
                      placeholder="0"
                      onChange={(e) =>
                        setData({
                          ...data,
                          totals: calculateTotals(data.items, {
                            ...data.totals,
                            tax: e.target.value, // keep string (see InvoiceEditData )
                          }),
                        })
                      }
                      className="w-20 text-right font-bold flex pr-5"
                    />
                    <span className="absolute right-3 font-bold">%</span>
                  </div>
                  <div className="flex relative items-center justify-between py-1 px-2">
                    <span>Discount:</span>

                    <input
                      type="number"
                      value={data.totals.discount ?? ""}
                      placeholder="0"
                      onChange={(e) =>
                        setData({
                          ...data,
                          totals: calculateTotals(data.items, {
                            ...data.totals,
                            discount: e.target.value, // keep string (see InvoiceEditData )
                          }),
                        })
                      }
                      className="w-20 text-right font-bold flex pr-5"
                    />
                    <span className="absolute right-3 font-bold">%</span>
                  </div>
                  <div className="flex relative items-center justify-between py-1 px-2">
                    <span>Shipping:</span>
                    <span className="absolute right-19 font-bold">$</span>
                    <input
                      type="number"
                      value={data.totals.shipping ?? ""}
                      onChange={(e) =>
                        setData({
                          ...data,
                          totals: calculateTotals(data.items, {
                            ...data.totals,
                            shipping: e.target.value, // keep string (see InvoiceEditData )
                          }),
                        })
                      }
                      className="w-20 text-right font-bold"
                    />
                  </div>
                  <div className="flex relative items-center justify-between py-1 px-2">
                    <span>Grand Total:</span>
                    <span className="absolute right-19 font-bold">$</span>
                    <input
                      value= {`${data.totals.grandTotal.toFixed(2) ?? ""}`}
                      disabled
                      placeholder="$0.00"
                      onChange={(e) =>
                        setData({
                          ...data,
                          totals: calculateTotals(data.items, {
                            ...data.totals,
                            grandTotal: parseFloat(e.target.value) || 0, // convert to number
                          }),
                        })
                      }
                      className="w-20 text-right font-bold pl-3"
                    />
                  </div>
                  <div className="flex relative items-center justify-between py-1 px-2">
                    <span>Amount Paid:</span>
                    <span className="absolute right-19 font-bold">$</span>
                    <input
                      type="number"
                      value={data.totals.amountPaid ?? ""}
                      placeholder="0"
                      onChange={(e) =>
                        setData({
                          ...data,
                          totals: calculateTotals(data.items, {
                            ...data.totals,
                            amountPaid: e.target.value, // keep string (see InvoiceEditData )
                          }),
                        })
                      }
                      className="w-20 text-right font-bold"
                    />
                  </div>
                  <div className="flex relative items-center justify-between py-1 px-2">
                    <span>Balance Due:</span>
                    <span className="absolute right-19 font-bold">$</span>
                    <input
                      value={`${data.totals.balanceDue.toFixed(2) ?? ""}`}
                      disabled
                      onChange={(e) =>
                        setData({
                          ...data,
                          totals: calculateTotals(data.items, {
                            ...data.totals,
                            balanceDue: parseFloat(e.target.value) || 0, // convert to number
                          }),
                        })
                      }
                      className="w-20 text-right font-bold pl-3"
                    />
                  </div>
                </div>
              </div>

          </div>

          <div className="mt-5 w-full flex justify-end-safe ">
              <button
              onClick={handleApplyChanges}
              className="bg-[#597F40] text-white py-2 px-4 rounded-md hover:bg-[#466B2D] transition-colors duration-200 font-opensans text-lg"
              >
                Apply Changes
              </button>
            </div>

        </div>
      )}
    </Modal>

  );
}
