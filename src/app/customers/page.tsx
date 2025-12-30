"use client";

import { CSSProperties, useEffect, useState } from "react";
import { Dropdown, Table, } from "antd";
import type { ColumnsType } from "antd/es/table";
import SideBarLayout from "../../components/sidebar";
import Image from "next/image";
import { auth } from "../../firebase/config"; //firebase is in src/app/firebase/config.ts
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import useDebounce from "../../hooks/useDebaunce"; //refresh method

import { getCustomerTable } from "@/lib/getCustomerTableData";
import { CustomerTableData } from "@/types/CustomerTableData";
import AuthGuard from "@/components/AuthGuard";

export default function CustomersPage() {
  
  const [tableData, setTableData] = useState<CustomerTableData[]>([]);

  // logout
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    }catch (error) {
      console.error("Logout failed", error);
    }
  }
  
  //get username
  const [getUsername, setGetUsername] = useState (" ");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      Promise.resolve().then(() => {
        setGetUsername((user.displayName || "User").split(" ")[0]);
      });
    }
  }, []);


  // fetch customer data from getCustomerTable n CustomerTable
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchCustomers() {
      if (!isMounted) return;

      setLoading(true);

      try {
        const res = await getCustomerTable();
        if (isMounted) setTableData(res);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const columns: ColumnsType<CustomerTableData> = [
    { 
      title: "Name", 
      dataIndex: "custName", 
      key: "custName",
      onHeaderCell: () : { style: CSSProperties} => ({ /* CSSProperties to make css enlist appear */
        style: {
          backgroundColor : "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
          letterSpacing: "0.5px",
          borderRadius: "0",
          padding: "0px 30px",
          fontSize: "14px",
          width: "30%",
        },
      }),
      onCell: (): { style: CSSProperties} => ({
        style: {
          fontFamily: "Open Sauce Sans",
          fontSize: "13px",
          padding: "0px 30px", //padding for all table data
          borderBottom: "2px solid #EDEDED",
        },
      }),
    },
    { 
      title: "Email", 
      dataIndex: "custEmail", 
      key: "custEmail",
      onHeaderCell: () : { style: CSSProperties} => ({ /* CSSProperties to make css enlist appear */
        style: {
          backgroundColor : "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
          borderRadius: "0",
          fontSize: "14px",
          width: "25%",
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
      title: "Address", 
      dataIndex: "custAddress", 
      key: "custAddress",
      onHeaderCell: () : { style: CSSProperties} => ({ /* CSSProperties to make css enlist appear */
        style: {
          backgroundColor : "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
          borderRadius: "0",
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
      title: "Phone Number", 
      dataIndex: "custNumber", 
      key: "custNumber",
      onHeaderCell: () : { style: CSSProperties} => ({ /* CSSProperties to make css enlist appear */
        style: {
          backgroundColor : "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
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

  //antd dropdown method
  const onDropdownSession = ({ key }: { key: string}) => {
    switch (key) {

      case "logout":
        handleLogout();
        break;

      default:
        break;
    }
  };

  //search system
  const [searchSystem, setSearchSystem] = useState("");
  const debounceSearch = useDebounce(searchSystem, 300);

  const searchCustomers = debounceSearch.trim() === ""
    ? tableData
    : tableData.filter((customer) => {                        //((customer) is new variable
        const keyword = debounceSearch.toLowerCase();

        return (
          String(customer.custName).toLowerCase().includes(keyword) || //use string to avoid error
          String(customer.custEmail).toLowerCase().includes(keyword) ||
          String(customer.custAddress).toLowerCase().includes(keyword) ||
          String(customer.custNumber).toLowerCase().includes(keyword)
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
                CUSTOMERS
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
                  <button
                  type="button"
                  className="bg-[#637A54] hover:bg-[#798C69] transition-colors duration-200 flex justify-center items-center space-x-2 px-3 py-2 font-opensans text-[white] rounded-md text-sm cursor-not-allowed"
                  disabled
                  >
                    <p>New Customer</p>
                    <Image
                    src="/dropdown-icon.svg"
                    alt="add"
                    width={12}
                    height={12}
                    className="mt-0.5"
                    />
                  </button>
                </div>
              </div>
              <div className="bg-white">
                <Table
                  rowKey="id"
                  columns={columns}
                  dataSource={searchCustomers}
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: "max-content"}}
                />
              </div>
            </div>
          </div>
      
        </div>
      </SideBarLayout>
    </AuthGuard>
  );
}
