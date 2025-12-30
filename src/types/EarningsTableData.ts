export interface EarningsTableData {
  id: string;
  description: string;
  date: Date;
  amount: number; // + income, - withdraw
}