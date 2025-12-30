"use client";

import SideBarLayout from "../../components/sidebar";

import { useEffect, useState } from "react";
import { Dropdown,} from "antd";
import Image from "next/image";
import { auth } from "../../firebase/config"; //firebase is in src/app/firebase/config.ts
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

import { getTotalIncome } from "@/lib/getTotalIncome";
import { getTotalWithdraw } from "@/lib/getTotalWithdraw";

import MonthlyRevenueChart from "@/components/dashboard/MothlyRevenueChart";
import { getInvoiceCounter, InvoiceCounter } from "@/services/invoiceCounter";
import { EarningsTableData } from "@/types/EarningsTableData";
import { getEarningsTableData } from "@/lib/getEarningsTableData";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardPage () {

  // track total paid etc
  const [counter, setCounter] = useState<InvoiceCounter>({
    total: 0,
    paid: 0, // not used in UI
    unpaid: 0,
    overdue: 0,
    partial: 0, // not used in UI
  });

  useEffect(() => {
    const loadCounter = async () => {
      const result = await getInvoiceCounter();
      console.log("Invoice Counter:", result);
      setCounter(result);
    };

    loadCounter();
  }, []);

  // for total balance
  const [ totalIncome, setTotalIncome ] = useState(0);
  const [ totalWithdraw, setTotalWithdraw ] = useState(0);

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

  const totalBalance = totalIncome - totalWithdraw; // total balance calculate here (don't need getTotalBalance)
  // refresh after create
  const fetchEarnings = async () => {
    const income = await getTotalIncome();
    const withdraw = await getTotalWithdraw();

    setTotalIncome(income);
    setTotalWithdraw(withdraw);
  };

  //this refresh avoid typescript error
  useEffect(() => {
    (async () => {
      await fetchEarnings();
    })();
  }, [])

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

  // recent flow
  const [ recentFlow, setRecentFLow ] =useState<EarningsTableData[]>([]);

  useEffect(() => {
    const loadRecentFlow = async () => {
      const data = await getEarningsTableData();

      const sorted = [...data]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0,10);

      setRecentFLow(sorted);
    };
    loadRecentFlow();
  }, []);

  return (
      <AuthGuard>
        <SideBarLayout>
            <div className="flex flex-col gap-6 p-6">
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
              <div className="flex flex-col bg-white rounded-2xl py-8 pb-15 gap-8 overflow-x-auto">
                <p className="font-bold text-2xl text-[#191413] px-15">
                  Welcome to Fyzy, {getUsername}
                </p>
                <div className="text-start md:text-center flex flex-col lg:flex-row pl-10 md:pl-0 ">
                  <div className="flex flex-1 flex-col font-bold text-md text-[#9B9E9A] border-r-0 lg:border-r-2 border-[#637A54] px-5 py-5 gap-2">
                    <p>Total Balance</p>
                    <p className="font-bold text-3xl text-[#191413]">${totalBalance}</p>
                  </div>
                  <div className="flex flex-2 flex-col md:flex-row">
                    <div className="flex flex-1 flex-col font-bold text-md text-[#9B9E9A] border-r-0 lg:border-r-2 border-[#637A54] px-5 py-5 gap-2">
                      <p>Total Invoice</p>
                      <p className="font-bold text-3xl text-[#191413]">{counter.total}</p>
                    </div>
                    <div className="flex flex-1 flex-col font-bold text-md text-[#9B9E9A] border-r-0 lg:border-r-2 border-[#637A54] px-5 py-5 gap-2">
                      <p>Unpaid Invoice</p>
                      <p className="font-bold text-3xl text-[#191413]">{counter.unpaid}</p>
                    </div>
                  </div>
                  <div className="flex flex-2 flex-col md:flex-row">
                    <div className="flex flex-1 flex-col font-bold text-md text-[#9B9E9A] border-r-0 lg:border-r-2 border-[#637A54] px-5 py-5 gap-2">
                      <p>Overdue invoice</p>
                      <p className="font-bold text-3xl text-[#191413]">{counter.overdue}</p>
                    </div>
                    <div className="flex flex-1 flex-col font-bold text-md text-[#9B9E9A]  border-[#637A54] px-5 py-5 gap-2">
                      <p>Total Product</p>
                      <p className="font-bold text-3xl text-[#191413]">15</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row items-center h-250 lg:h-130 gap-6">
                <div className="bg-white flex-1 lg:flex-2 h-full w-full rounded-2xl py-5 px-10">
                  <p className="font-bold text-2xl">
                    Monthly Revenue
                  </p>
                  <MonthlyRevenueChart />
                </div>
                <div className="bg-white flex-1 h-full w-full overflow-y-auto rounded-2xl py-5 px-10">
                  <p className="font-bold text-2xl pb-4">
                    Recent Flow
                  </p>
                  {recentFlow.map((item) => {
                    const isPositive = item.amount > 0;
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between border-b-2 border-[#9B9E9A] py-5"
                      >
                        <div className="flex flex-col">
                          <p className="  font-semibold text-md text-[#191413]">
                            {item.description} {/* from EarnignsTableData.ts */}
                          </p>
                          <p className="text-sm text-[#9B9E9A]">
                            {item.date.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`f font-semibold ${
                              isPositive ? "text-[#3FAA47]" : "text-[#EA5444]"
                            }`}
                          >
                            {isPositive ? "+" : "-"}
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                            }).format(Math.abs(item.amount))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
        
              <div className="bg-white rounded-2xl flex flex-col justify-center items-center text-center p-10 gap-3">
                <p className="font-medium text-2xl text-[#191413]">
                  Custom Your Plan
                </p>
                <div className="max-w-100 flex justify-center">
                  <p>
                    Upgrade your plan to customize and create personality in you dashboard
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                  type="button"
                  className=" bg-[#637A54] hover:bg-[#798C69] transition-colors duration-200 flex justify-center items-center space-x-2 px-5 py-2 text-[white] rounded-md text-sm"
                  >
                    <p>Custom Plan</p>
                  </button>
                </div>
              </div>
            </div>
        </SideBarLayout>
      </AuthGuard>
  );
}