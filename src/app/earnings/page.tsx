"use client";

import { CSSProperties, useEffect, useState } from "react";
import SideBarLayout from "../../components/sidebar";
import { Dropdown, Table } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase/config"; //firebase is in src/app/firebase/config.ts
import { signOut } from "firebase/auth";

import { getTotalIncome } from "@/lib/getTotalIncome";
import { getTotalWithdraw } from "@/lib/getTotalWithdraw";

import RequestPayoutModal from "@/components/earnings/RequestPayoutModal";
import { EarningsTableData } from "@/types/EarningsTableData";
import { getEarningsTableData } from "@/lib/getEarningsTableData";
import AuthGuard from "@/components/AuthGuard";

export default function EarningsPage () {

  //total income
  const [totalIncome, setTotalIncome] = useState(0);
  //total withdraw
  const [totalWithdraw, setTotalWithdraw] = useState(0);
  //open request payout modal
  const [openPayout, setOpenPayout] = useState(false);
  //table
  const [tableData, setTableData] = useState<EarningsTableData[]>([]);

  // logout
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    }catch (error) {
      console.error("Logout failed", error);
    }
  };

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

  //get total income, balance and withdraw
  useEffect(() => {
    const loadEarnings = async () => {
      const income = await getTotalIncome();
      const withdraw = await getTotalWithdraw();

      setTotalIncome(income);
      setTotalWithdraw(withdraw);
    };

    loadEarnings();
  }, []);

  const totalBalance = totalIncome - totalWithdraw;
  // refresh after create
  const fetchEarnings = async () => {
    const income = await getTotalIncome();
    const withdraw = await getTotalWithdraw();
    const table = await getEarningsTableData();

    setTotalIncome(income);
    setTotalWithdraw(withdraw);
    setTableData(table);
  };
  //this refresh avoid typescript error
  useEffect(() => {
    (async () => {
      await fetchEarnings();
    })();
  }, [])

  //table
  useEffect(() => {
    getEarningsTableData().then(setTableData);
  }, []);

  //table design
  const columns = [
    { 
      title: "Description", 
      dataIndex: "description", 
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
          width: "50%",
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
      title: "Date", 
      dataIndex: "date", 
      onHeaderCell: () : { style: CSSProperties} => ({ /* CSSProperties to make css enlist appear */
        style: {
          backgroundColor : "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
          borderRadius: "0",
          fontSize: "14px",
          width: "35%",
        },
      }),
      onCell: (): { style: CSSProperties} => ({
        style: {
          fontFamily: "Open Sauce Sans",
          fontSize: "13px",
          borderBottom: "2px solid #EDEDED",
        },
      }),
      render: (date: Date) => date.toLocaleDateString(),
    },
    {
      title: "Amount",
      dataIndex: "amount",

      onHeaderCell: (): { style: CSSProperties } => ({
        style: {
          backgroundColor: "#EDEDED",
          fontFamily: "Open Sauce Sans",
          fontWeight: "bold",
          color: "#191413",
          border: "none",
          borderRadius: "0",
          fontSize: "14px",
          width: "15%",
        },
      }),

      onCell: (): { style: CSSProperties } => ({
        style: {
          fontFamily: "Open Sauce Sans",
          fontSize: "13px",
          borderBottom: "2px solid #EDEDED",
        },
      }),

      render: (amount: number) => {
        const isPositive = amount > 0;

        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Math.abs(amount));

        return (
          <span
            style={{
              color: isPositive ? "#3FAA47" : "#EA5444",
            }}
          >
            {isPositive ? "+" : "-"}
            {formatted}
          </span>
        );
      },
    },
  ];

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
                      <p>
                        EARNINGS
                      </p>
                    </div>
                    <div className="flex flex-col lg:flex-row space-y-5 lg:space-y-0" >
                      <div className="flex-1 flex-col text-center space-y-2 lg:space-y-3">
                        <p className="font-bold text-md text-[#9B9E9A]">
                          Total Income
                        </p>
                        <p className="font-bold text-3xl text-[#191413]">
                          ${totalIncome}
                        </p>
                      </div>
                      <div className="flex-1 flex-col text-center space-y-2 lg:space-y-3">
                        <p className="font-bold text-md text-[#9B9E9A]">
                          Total Balance
                        </p>
                        <p className="font-bold text-3xl text-[#191413]">
                          ${totalBalance}
                        </p>
                      </div>
                      <div className="flex-1 flex-col text-center space-y-2 lg:space-y-3">
                        <p className="font-bold text-md text-[#9B9E9A]">
                          Total Withdraw
                        </p>
                        <p className="font-bold text-3xl text-[#191413]">
                          ${totalWithdraw}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-5 ">
                      <div className="flex justify-end">
                        <button
                        onClick={() => setOpenPayout(true)}
                        className="bg-[#637A54] hover:bg-[#798C69] transition-colors duration-200 flex justify-center items-center space-x-2 px-3 py-2 font-opensans text-[white] rounded-md text-sm"
                        >
                          Request Payout
                        </button>
                      </div>
                      <div>
                        <Table
                        dataSource={tableData}
                        columns={columns}
                        pagination={{ pageSize: 15 }}
                        scroll={{ x: "max-content"}}
                        rowKey="id"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <RequestPayoutModal
                open={openPayout}
                onClose={() => setOpenPayout(false)}
                balance={totalBalance}
                onSuccess={fetchEarnings}
              />
          </SideBarLayout>
        </AuthGuard>
    );
}