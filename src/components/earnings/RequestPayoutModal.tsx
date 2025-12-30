"use client";

import { Modal, Dropdown } from "antd";
import { useState } from "react";
import Image from "next/image";

import { createPayout } from "@/lib/createPayout";

interface RequestPayoutModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  onSuccess: () => void;
}

export default function RequestPayoutModal({
  open,
  onClose,
  balance,
  onSuccess
}: RequestPayoutModalProps) {

  // form state
  const [amount, setAmount] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [method, setMethod] = useState<string>("Select payment");
  const [loading, setLoading] = useState(false);
  // amount logic
  const numericAmount = Number(amount) || 0;
  const previewBalance = balance - numericAmount;

  // dropdown items
  const methodDropdown = [
    { key: "PayPal Holdings, Inc.", label: "PayPal Holdings, Inc." },
    { key: "Payoneer Global Inc.", label: "Payoneer Global Inc." },
    { key: "Hyperwallet Systems Inc.", label: "Hyperwallet Systems Inc." },
  ];

  // dropdown click
  const onMethodClick = ({ key }: { key: string }) => {
    setMethod(key);
  };

  // validation
  const isInvalid =
    numericAmount <= 0 ||
    numericAmount > balance ||
    !email ||
    method === "Select payment method";

  // handle submit create system
  const handleSubmit = async () => {
    if (isInvalid) return;

    setLoading(true);

    try {
      await createPayout({
        method,
        email,
        amount: numericAmount,
      });

      // reset form
      setAmount("");
      setEmail("");
      setMethod("Select payment");

      onSuccess();

      onClose();
    } catch (error) {
      console.error("Failed to request payout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
    open={open} 
    onCancel={onClose} 
    footer={null}
    >
      <div className="flex flex-col p-6 gap-y-4">

        <div className="">
          <p className="font-bold text-lg text-[#9B9E9A]">
            Your balance:{" "}
          </p>
          <span
            className={` font-bold text-2xl text-[#191413] ${ 
              previewBalance < 0
                ? "text-red-500 font-semibold"
                : "font-semibold"
            }`}
          >
            ${previewBalance.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col gap-y-2 text-md text-[#191413]">
          <p>
            Your payment method:
          </p>
          <Dropdown
            menu={{ items: methodDropdown, onClick: onMethodClick }}
            trigger={["click"]}
          >
            <button 
            type="button" 
            className="flex justify-between border border-[#5B5B5B] focus:outline-[#637A54] px-3 py-2 rounded-md w-full"
            >
              <span>{method}</span>
              <Image
                src="/dropdown-icon-2.svg"
                alt="dropdown"
                width={10}
                height={10}
              />
            </button>
          </Dropdown>
        </div>
        <div className="flex flex-col gap-y-2 text-md text-[#191413]">
          <p>
            Enter your email:
          </p>
          <input
            placeholder="Payment email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex justify-between border border-[#5B5B5B] focus:outline-[#637A54] px-3 py-2 rounded-md w-full"
          />
        </div>
        <div className="flex flex-row items-center gap-x-2">
          <p>
            Enter your amount:
          </p>
          <div className="relative my-3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
            <input
              placeholder="0.00"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-[#5B5B5B] focus:outline-[#637A54] pl-7 px-3 py-2 rounded-md w-full"
            />
          </div>
        </div>

        <button
          className="bg-[#637A54] text-white py-2 px-4 rounded-md hover:bg-[#798C69] transition-colors duration-200 text-xl disabled:opacity-50 disabled:pointer-events-none"
          disabled={isInvalid || loading}
          onClick={handleSubmit}
        >
          {loading ? "Processing..." : "Request Payout"}
        </button>

      </div>
    </Modal>
  );
}
