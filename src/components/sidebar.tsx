"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface SideBar {
  children: ReactNode;
}

export default function SideBarLayout({ children }: SideBar) {
  const pathname = usePathname();

  return (
    <div className="flex">
      {/* SIDEBAR */}
      <aside className="w-30 lg:w-64 bg-white p-4">
        <div className="flex justify-center py-6">
          <Image
            src="/fyzy-full-logo.svg"
            alt="fyzy-logo"
            width={140}
            height={140}
            className="hidden lg:block"
          />
          <Image
            src="/icons/fyzy-icon.svg"
            alt="fyzy-logo"
            width={50}
            height={50}
            className="block lg:hidden"
          />
        </div>

        {/* NAVIGATION */}
        <nav className="mt-6 space-y-2.5 flex flex-col">
          <Link href="/dashboard">
            <div
              className={`
                flex px-4 py-3 rounded-lg cursor-pointer transition-all items-center flex-col space-y-1 space-x-0 lg:space-y-0 lg:flex-row lg:space-x-4
                ${pathname === "/dashboard"
                  ? "bg-[#F0F4EF]" /* active */
                  : " hover:bg-[#F0F4EF]"}`} /* hovering */
            > 
              <div className="w-6 h-6 flex justify-center ">
                <Image
                  src="/icons/nav-dashboard-icon.svg"
                  width={19}
                  height={19}
                  alt="Dashboard"
                />
              </div>
              <div>
                <span className="font-opensans text-[#191413] text-sm lg:text-[15px]">
                  Dashboard
                </span>
              </div>
            </div>
          </Link>
          <Link href="/invoice">
            <div
              className={`
                flex px-4 py-3 rounded-lg cursor-pointer transition-all items-center flex-col space-y-1 space-x-0 lg:space-y-0 lg:flex-row lg:space-x-4
                ${pathname === "/invoice"
                  ? "bg-[#F0F4EF]" /* active */
                  : " hover:bg-[#F0F4EF]"}`} /* hovering */
            >
              <div className="w-6 h-6 flex justify-center">
                <Image
                  src="/icons/nav-invoice-icon.svg"
                  width={16}
                  height={16}
                  alt="Invoice"
                />
              </div>
              <div className="">
                <span className="font-opensans text-[#191413] text-sm lg:text-[15px]">
                  Invoice
                </span>
              </div>
            </div>
          </Link>
          <Link href="/customers">
            <div
              className={`
                flex px-4 py-3 rounded-lg cursor-pointer transition-all items-center flex-col space-y-1 space-x-0 lg:space-y-0 lg:flex-row lg:space-x-4
                ${pathname === "/customers"
                  ? "bg-[#F0F4EF]" /* active */
                  : " hover:bg-[#F0F4EF]"}`} /* hovering */
            > 
              <div className="w-6 h-6 flex justify-center ">
                <Image
                  src="/icons/nav-clients-icon.svg"
                  width={22}
                  height={22}
                  alt="clients-icon"
                />
              </div>
              <div>
                <span className="font-opensans text-[#191413] text-sm lg:text-[15px]">
                  Customers
                </span>
              </div>
            </div>
          </Link>
          <Link href="/products" className="pointer-events-none">
            <div
              className={`
                flex px-4 py-3 rounded-lg cursor-pointer transition-all items-center flex-col space-y-1 space-x-0 lg:space-y-0 lg:flex-row lg:space-x-4
                ${pathname === "/products"
                  ? "bg-[#F0F4EF]" /* active */
                  : " hover:bg-[#F0F4EF]"}`} /* hovering */
            > 
              <div className="w-6 h-6 flex justify-center ">
                <Image
                  src="/icons/nav-products-icon.svg"
                  width={17}
                  height={17}
                  alt="products-icon"
                />
              </div>
              <div>
                <span className="font-opensans text-[#191413] text-sm lg:text-[15px]">
                  Products
                </span>
              </div>
            </div>
          </Link>
          <Link href="/earnings">
            <div
              className={`
                flex px-4 py-3 rounded-lg cursor-pointer transition-all items-center flex-col space-y-1 space-x-0 lg:space-y-0 lg:flex-row lg:space-x-4
                ${pathname === "/earnings"
                  ? "bg-[#F0F4EF]" /* active */
                  : " hover:bg-[#F0F4EF]"}`} /* hovering */
            > 
              <div className="w-6 h-6 flex justify-center ">
                <Image
                  src="/icons/nav-earnings-icon.svg"
                  width={19}
                  height={19}
                  alt="earnings-icon"
                />
              </div>
              <div>
                <span className="font-opensans text-[#191413] text-sm lg:text-[15px]">
                  Earnings
                </span>
              </div>
            </div>
          </Link>
          <Link href="/settings" className="pointer-events-none">
            <div
              className={`
                flex px-4 py-3 rounded-lg cursor-pointer transition-all items-center flex-col space-y-1 space-x-0 lg:space-y-0 lg:flex-row lg:space-x-4
                ${pathname === "/settings"
                  ? "bg-[#F0F4EF]" /* active */
                  : " hover:bg-[#F0F4EF]"}`} /* hovering */
            > 
              <div className="w-6 h-6 flex justify-center ">
                <Image
                  src="/icons/nav-settings-icon.svg"
                  width={19}
                  height={19}
                  alt="settings-icon"
                />
              </div>
              <div>
                <span className="font-opensans text-[#191413] text-sm lg:text-[15px]">
                  Settings
                </span>
              </div>
            </div>
          </Link>
        </nav>
      </aside>
      
      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-x-auto min-h-screen min-w-lg bg-white overflow-y-hidden pt-6">
        <div className="bg-[#97A597] h-full rounded-tl-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
