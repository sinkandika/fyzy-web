import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

import { CustomerTableData } from "@/types/CustomerTableData";
import { FirestoreCustomer } from "@/types/FirestoreDatabase";

export async function getCustomerTable(): Promise<CustomerTableData[]> {

  //fetch customers database
  const snapshot = await getDocs(collection(db, "customers"));

  const customers: CustomerTableData[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as FirestoreCustomer),
  }));

  // avoid duplicate email shown inside the customer table
  const map = new Map<string, CustomerTableData>();

  customers.forEach((customer) => {
    const key = customer.custEmail.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, customer);
    }
  });

  return Array.from(map.values());

}

