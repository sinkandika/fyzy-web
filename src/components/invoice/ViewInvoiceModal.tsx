import { Modal, Table } from "antd";
import { useEffect, useState, useRef, CSSProperties } from "react";
import { InvoiceViewData } from "@/types/InvoiceViewData";
import { getInvoiceViewData } from "@/lib/getInvoiceViewData";
import { useReactToPrint } from "react-to-print";

interface ViewInvoiceModalProps {
  open: boolean;
  invoiceId: string | null;
  onClose: () => void;
}

//view table data inside modal
//use number only if just for rendering/view system
interface viewTableInvoice {
  key: string;
  description: string;
  rate: number;
  quantity: number;
  amount: number;
}

export default function ViewInvoiceModal({
  open,
  invoiceId,
  onClose,
}: ViewInvoiceModalProps) {

  const [loading, setLoading] = useState(false);
  const [invoiceView, setData] = useState<InvoiceViewData | null>(null);


  useEffect(() => {
    if (!open || !invoiceId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getInvoiceViewData(invoiceId);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, invoiceId]);

  //invoice table view modal
  const viewTableData: viewTableInvoice[] =
    invoiceView?.items.map((item, index) => ({
      key: index.toString(),
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
    })) || [];

  const viewTableColumns = [
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      onHeaderCell: (): { style: CSSProperties } => ({
        style: { 
          backgroundColor: "#5B5B5B",
          color: "white",
          fontFamily: "Open Sauce Sans",
          fontWeight: "normal",
          border: "none",
          borderRadius: "0",
          padding: "5px 15px",
          fontSize: "12px",
          width: "50%",
        },
      }),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const, //write as const to avoice error in columns={viewTableColumns}
      onHeaderCell: (): { style: CSSProperties } => ({
        style: { 
          backgroundColor: "#5B5B5B",
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
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      align: "right" as const,
      onHeaderCell: (): { style: CSSProperties } => ({
        style: { 
          backgroundColor: "#5B5B5B",
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
      render: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right" as const,
      onHeaderCell: (): { style: CSSProperties } => ({
        style: { 
          backgroundColor: "#5B5B5B",
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
      render: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
    },
  ];

  //convert date format system
  const formatDate = (date?: Date | null) => {
    if (!date) return "-";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  //print
  const invoiceRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${invoiceView?.invoice.number ?? "Invoice"}`,
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="auto"
      style={{ padding: 2 }}
    >

      {loading && (
        <p>Loading invoice...</p>
      )}

      {!loading && invoiceView && (
        <div className=" overflow-x-auto p-6 space-y-2">

          <div ref={invoiceRef} className="invoice-A4-paper font-opensans space-y-8"> {/* A4 Paper */}

            <div className="flex flex-col space-y-0.5 py-2">
              <span className="text-4xl font-medium text-[#191413]">INVOICE</span>
              <span className="text-md text-[#5B5B5B] ml-1">{invoiceView.invoice.number}</span>
            </div>
            
            <div className="flex flex-row space-x-25">

              <div className="flex-1 text-sm space-y-10">
                <div className="flex flex-col">
                  <span>To:</span>
                  <div  className="flex flex-col font-bold">
                    <span>{invoiceView.customer.name} </span>
                    <span>{invoiceView.customer.address} </span>
                    <span>{invoiceView.customer.phone}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span>From:</span>
                  <div className="flex flex-col font-bold">
                    <span>{invoiceView.user.name} </span>
                    <span>{invoiceView.user.address} </span>
                    <span>{invoiceView.user.phone} </span>
                  </div>
                </div>
              </div>
          
              <div className="flex-1 flex-col text-sm space-y-1">
                <div className="flex justify-between py-1 px-2">
                  <span>Invoice Date:</span>
                  <div className="font-bold">
                    <span>{""}{formatDate(invoiceView.invoice.issueDate)}</span>
                  </div>
                </div>
                <div className="flex justify-between py-1 px-2">
                  <span>PO Number:</span>
                  <div className="font-bold">
                    <span>{""}{invoiceView.invoice.poNumber}</span>
                  </div>
              </div>
                <div className="flex justify-between py-1 px-2">
                  <span>Payment Terms:</span>
                  <div className="font-bold">
                    <span>{""}{invoiceView.invoice.paymentTerms}</span>
                  </div>
                </div>
                <div className="flex justify-between py-1 px-2">
                  <span>Due Date:</span>
                  <div className="font-bold">
                    <span>{""}{formatDate(invoiceView.invoice.dueDate)}</span>
                  </div>
                </div>
              </div>

            </div>

            <div>
              <Table
              columns={viewTableColumns}
              dataSource={viewTableData}
              pagination={false}
              size="small"
              />
            </div>

            <div className="flex flex-row space-x-25">

              <div className="flex-1 flex-col text-sm">
                <div>
                  <span>Notes:</span>
                </div>
                <div className="font-bold">
                  <span>{""}{invoiceView.invoice.notes}</span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col space-y-1 text-sm">
                <div className="flex justify-between py-1 px-2">
                  <span>Subtotal:</span>
                  <div className="font-bold flex">
                    <span>$</span>
                    <span>{""}{`${invoiceView.totals.subTotal.toFixed(2)}`}</span>
                  </div>
                </div>
                <div className="flex justify-between py-1 px-2">
                  <span>Tax:</span>
                  <div className="font-bold flex">
                    <span>{""}{invoiceView.totals.tax}</span>
                    <span>%</span>
                  </div>
                </div>
                <div className="flex justify-between py-1 px-2">
                  <span>Discount:</span>
                  <div className="font-bold flex">
                    <span>{""}{invoiceView.totals.discount}</span>
                    <span>%</span>
                  </div>
                </div>
                <div className="flex justify-between py-1 px-2">
                  <span>Shipping:</span>
                  <div className="font-bold flex">
                    <span>$</span>
                    <span>{""}{invoiceView.totals.shipping}</span>
                  </div>
                </div>
                <div className="flex justify-between py-1 px-2">
                  <span>GrandTotal:</span>
                  <div className="font-bold flex">
                    <span>$</span>
                    <span>{""}{`${invoiceView.totals.grandTotal.toFixed(2)}`}</span>
                  </div>
                </div>
                <div className="flex justify-between bg-[#E5E5E5] py-1 px-2">
                  <span>Amount Paid:</span>
                  <div className="font-bold flex">
                    <span>$</span>
                    <span>{""}{`${invoiceView.totals.amountPaid.toFixed(2)}`}</span>
                  </div>
                </div>
                <div className="flex justify-between py-1 px-2">
                  <span>Balance Due:</span>
                  <div className="font-bold flex ">
                    <span>$</span>
                    <span>{""}{`${invoiceView.totals.balanceDue.toFixed(2)}`}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-5 w-full flex justify-end-safe ">
            <button
            onClick={handlePrint}
            className="bg-[#597F40] text-white py-2 px-4 rounded-md hover:bg-[#466B2D] transition-colors duration-200 font-opensans text-lg"
            >
              Save as PDF
            </button>
          </div>

        </div>
      )}
    </Modal>
  );
}

