"use client";

import { CSSProperties, useEffect, useState } from "react";
import { Dropdown, Table, Tag, Modal, message } from "antd";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/config";
import SideBarLayout from "../../components/sidebar";
import { useRouter } from "next/navigation";
import '@fontsource/open-sauce-sans'; //just for CSS on the ant table
import Image from "next/image";
import useDebounce from "../../hooks/useDebaunce"; //refresh method
import { auth } from "../../firebase/config"; //firebase is in src/app/firebase/config.ts
import { signOut } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";

import ViewInvoiceModal from "@/components/invoice/ViewInvoiceModal";
import EditInvoiceModal from "@/components/invoice/EditInvoiceModal";
import AuthGuard from "@/components/AuthGuard";

// invoice page table 
interface CustomerData {
  custName: string;
}

interface InvoiceData {
  key: string;
  invoiceNumber: string;
  customerName: string;
  dueDate: Date | null;       
  amount: number;
  amountDue: number;
  status: string;
}

export default function InvoicePage() {
  
  //get structure from interface InvoiceData
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  //router
  const router = useRouter();
  //view Invoice
  const [viewInvoice, setViewInvoice] = useState<string | null>(null);
  // edit Invoice
  const [openEdit, setOpenEdit] = useState(false);
  const [editInvoice, setEditInvoice] = useState<string | null>(null);
  // get username
  const [getUsername, setGetUsername] = useState (" ");
  
  // logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    }catch (error) {
      console.error("Logout failed", error);
    }
  }

  // delete invoice 
  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      await deleteDoc(doc(db, "invoices", invoiceId));

      // Remove from UI immediately
      setInvoices((prev) =>
        prev.filter((invoice) => invoice.key !== invoiceId)
      );

      message.success("Invoice deleted successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to delete invoice");
    }
  };

  // delete modal design
  const deleteModal = (invoiceId: string) => {
    Modal.confirm({
      title: "Delete Invoice",
      content: "Are you sure you want to delete this invoice?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => handleDeleteInvoice(invoiceId),
    });
  };

  //get username
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      Promise.resolve().then(() => {
        setGetUsername((user.displayName || "User").split(" ")[0]);
      });
    }
  }, []);

  // dropdown create new invoice
  const dropdownItems = [
    {
      key: "standard invoice",
      label: (
        <span 
        >
          Standard Invoice
        </span>
      ),
    },
    {
      key: "proforma invoice",
      label: (
      <span>Proforma Invoice</span>
      ),
      disabled: true,
    },
  ];

  //dropdown account 
  const dropdownProfile = [
    {
      key: "acount",
      label: (
        <span>Acount</span>
      ),
      disabled: true,
    },
    {
      key: "settings",
      label: (
        <span>Settings</span>
      ),
      disabled: true,
    },
    {
      key: "logout",
      label: (
        <span>Logout</span>
      ),
    },
  ];

  // dropdown action
  const dropdownAction = (record: InvoiceData) => ({
    items: [
      {
        key: "view invoice",
        label: (
        <span>View Invoice</span>
        ),
      },
      {
        key: "edit invoice",
        label: (
        <span> Edit Invoice </span>
        ),
      },
      {
        key: "delete invoice",
        label: (
        <span
          style={{ color: "red" }}
        >
          Delete Invoice
        </span>
        ),
      },
    ],
    onClick: ({ key }: { key: string }) => onDropdownFeature(key, record),
  });

  //antd 2 dropdown case
  const onDropdownFeature = (key: string, record: InvoiceData) => {
    switch (key) {

      case "view invoice":
        setViewInvoice(record.key);
        break;
      
      case "edit invoice":
        setEditInvoice(record.key);
        setOpenEdit(true);
        break;

      case "delete invoice":
        deleteModal(record.key);
        break;

      default:
        break;
    }
  };

  const onDropdownSession = ({ key }: { key: string}) => {
    switch (key) {
      case "standard invoice":
        router.push("/invoice/standard-invoice");
        break;

      case "logout":
        handleLogout();
        break;

      default:
        break;
    }
  };

  // get view invoices and customers database for invoice table
  const fetchInvoices = async () => {
    const invoiceSnap = await getDocs(collection(db, "invoices"));
    const customerSnap = await getDocs(collection(db, "customers"));

    const customerMap: Record<string, string> = {};
    customerSnap.docs.forEach((doc) => {
      const data = doc.data() as CustomerData;
      customerMap[doc.id] = data.custName;
    });

    const list: InvoiceData[] = invoiceSnap.docs.map((doc) => {
      const data = doc.data() as {
        invNumber: string;
        custID: string;
        payDue: Timestamp;
        costGrandTotal: number;
        costBalanceDue: number;
        status: string;
      };

      return {
        key: doc.id,
        invoiceNumber: data.invNumber || "",
        customerName: customerMap[data.custID || ""] || "Unknown Customer",
        dueDate:
          data.payDue instanceof Timestamp
            ? data.payDue.toDate()
            : data.payDue
            ? new Date(data.payDue)
            : null,
        amount: data.costGrandTotal ?? 0,
        amountDue: data.costBalanceDue ?? 0,
        status: data.status || "Unpaid",
      };
    });

    setInvoices(list);
  };

  useEffect(() => {
    (async () => {
      await fetchInvoices();
    })();
  }, [])

  //invoice page table
  const columns = [
    { 
      title: "Invoice Number", 
      dataIndex: "invoiceNumber", 
      key: "invoiceNumber",
      onHeaderCell: () : { style: CSSProperties} => ({ /* CSSProperties to make css enlist appear */
        style: {
          backgroundColor : "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
          letterSpacing: "0.5px",
          borderRadius: "0",
          padding: "0px 30px", //padding for all table title data
          fontSize: "14px",
          width: "30%",
        },
      }),
      onCell: (): { style: CSSProperties} => ({
        style: {
          fontFamily: "Open Sauce Sans",
          fontSize: "13px",
          padding: "0px 30px", //padding for all table row data
          borderBottom: "2px solid #EDEDED",
        },
      }),
    },
    { 
      title: "Customer", 
      dataIndex: "customerName", 
      key: "customerName",
      onHeaderCell: () : { style: CSSProperties} => ({
        style: {
          backgroundColor : "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
          letterSpacing: "0.5px",
          borderRadius: "0",
          padding: "0px 15px", 
          fontSize: "14px",
          width: "30%",
        },
      }),
      onCell: (): { style: CSSProperties} => ({
        style: {
          fontFamily: "Open Sauce Sans",
          fontSize: "13px",
          borderBottom: "2px solid #EDEDED",
        },
      }),
    },
    { 
      title: "Due Date", 
      dataIndex: "dueDate", 
      key: "dueDate",
      render: (date: Date | null) =>
        date ? date.toLocaleDateString("en-US") : "-",
      onHeaderCell: () : { style: CSSProperties} => ({
        style: {
          backgroundColor : "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
          letterSpacing: "0.5px",
          borderRadius: "0",
          fontSize: "14px",
          width: "10%",
        },
      }),
      onCell: (): { style: CSSProperties} => ({
        style: {
          fontFamily: "Open Sauce Sans",
          fontSize: "13px",
          borderBottom: "2px solid #EDEDED",
        },
      }),
    },
    { 
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      onHeaderCell: () : { style: CSSProperties} => ({
        style: {
          backgroundColor : "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
          letterSpacing: "0.5px",
          borderRadius: "0",
          fontSize: "14px",
          width: "10%%",
        },
      }),
      onCell: (): { style: CSSProperties} => ({
        style: {
          fontFamily: "Open Sauce Sans",
          fontSize: "13px",
          borderBottom: "2px solid #EDEDED",
        },
      }),
      render: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
    },
    { 
      title: "Amount Due",
      dataIndex: "amountDue",
      key: "amountDue",
      onHeaderCell: () : { style: CSSProperties} => ({
        style: {
          backgroundColor : "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
          letterSpacing: "0.5px",
          borderRadius: "0",
          fontSize: "14px",
          width: "10%%",
        },
      }),
      onCell: (): { style: CSSProperties} => ({
        style: {
          fontFamily: "Open Sauce Sans",
          fontSize: "13px",
          borderBottom: "2px solid #EDEDED",
        },
      }),
      render: (value: number) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value),
    },
    { 
      title: "Status",
      dataIndex: "status",
      key: "status",
      onHeaderCell: () : { style: CSSProperties} => ({
        style: {
          backgroundColor : "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
          letterSpacing: "0.5px",
          borderRadius: "0",
          fontSize: "14px",
          width: "10%%",
        },
      }),
      render: (status: string) => {
        let color = "";
        if (status === "Paid") color = "#3FAA47";
        else if (status === "Unpaid") color = "#9B9E9A";
        else if (status === "Partial") color = "#378BD1";
        else if (status == "Overdue") color = "#E84538";
        else if (status == "Overpaid") color = "#E89A0F";

        return <Tag color={color}>{status.toUpperCase()}</Tag>
      }
    },
    { 
      title: "Action",
      key: "action",
      onHeaderCell: () : { style: CSSProperties} => ({
        style: {
          backgroundColor : "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
          letterSpacing: "0.5px",
          borderRadius: "0",
          fontSize: "14px",
          width: "100px"
        },
      }),
      render: (_: unknown, record: InvoiceData ) => ( /* (_: unknown, record: InvoiceData) to detect table data in every different row */
        <Dropdown menu={dropdownAction(record)} trigger={["click"]}>
          <button
          onClick={(e) => e.stopPropagation()}
          className="p-4" // this padding affect table data padding
          >
            <Image 
              src="/action-icon.svg" 
              alt="action"
              width={15}
              height={15}
              objectFit="cover"
              />
          </button>
        </Dropdown>
      )
    }
  ];

  //search system
  const [searchSystem, setSearchSystem] = useState("");
  const debounceSearch = useDebounce(searchSystem, 300);

  const searchInvoice = invoices.filter((search) => { //((search) is new variable
    return (
      search.invoiceNumber.toLowerCase().includes(debounceSearch.toLocaleLowerCase()) || 
      search.customerName.toLowerCase().includes(debounceSearch.toLocaleLowerCase())
    );
  });

  return (
    <AuthGuard>
      <SideBarLayout>
      
        <div className="flex flex-col space-y-6 p-6">
          <div className="bg-white p-5 rounded-2xl flex justify-end space-x-1">
            <Image
              src="/profile-icon.svg"
              alt="profile-icon"
              width={30}
              height={30}
              />
            <Dropdown
            menu={{ items: dropdownProfile, onClick: onDropdownSession }}
            trigger={["click"]}
            >
              <button className="flex space-x-2 font-opensans items-center p-2">
                <p>Hello, {getUsername}</p>
                <Image
                src="/dropdown-icon-2.svg"
                alt="dropdown-icon"
                width={10}
                height={10}
                className="mt-0.5"
                />
              </button>
            </Dropdown>
          </div>
          <div className="flex flex-row justify-center">
            <div className="px-15 py-6 bg-white rounded-2xl space-y-5 w-full">
              <div className="font-opensans font-bold text-3xl">
                INVOICES
              </div>
              <div className="flex flex-col-reverse lg:flex-row">
                <div className="border rounded-md flex-1 flex justify-baseline border-[#5B5B5B] mt-5 lg:mt-0 py-0 lg:py-2">
                  <Image
                  src="/search-icon.svg"
                  alt="search-icon"
                  width={15}
                  height={15}
                  className="ml-4"
                  />
                  <input
                  value={searchSystem}
                  onChange={(e) => setSearchSystem(e.target.value)}
                  type="text"
                  placeholder="Search"
                  className="w-full rounded-md px-5 py-2 lg:py-0 outline-none font-opensans text-sm text-[#191413]"
                  />
                </div>
                <div className="flex-3 flex justify-end">
                  <Dropdown
                  menu={{ items: dropdownItems, onClick: onDropdownSession }}
                  trigger={["click"]}
                  >
                    <button
                    type="button"
                    className="bg-[#637A54] hover:bg-[#798C69] transition-colors duration-200 flex justify-center items-center space-x-2 px-3 py-2 font-opensans text-[white] rounded-md text-sm"
                    >
                      <p>New Invoice</p>
                      <Image
                      src="/dropdown-icon.svg"
                      alt="add"
                      width={12}
                      height={12}
                      className="mt-0.5"
                      />
                    </button>
                  </Dropdown>
                </div>
              </div>
              <div className="">
                <Table
                  columns={columns}
                  dataSource={searchInvoice}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: "max-content"}}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Invoice View Modal */}
        {viewInvoice && (
          <ViewInvoiceModal
            open={!!viewInvoice}
            invoiceId={viewInvoice}
            onClose={() => setViewInvoice(null)}
          />
        )}
        {/*Invoice Edit Modal */}
        {editInvoice && (
          <EditInvoiceModal
            open={openEdit}
            invoiceId={editInvoice}
            onClose={() => {
              setOpenEdit(false);
              setEditInvoice(null);
            }}
            onRefresh={fetchInvoices}
          />
        )}
      </SideBarLayout>
    </AuthGuard>
  );
}