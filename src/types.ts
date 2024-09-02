// File: types.ts

export interface Item {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Person {
  id: string;
  name: string;
  items: Item[];
  tipPercentage: number;
  tipAmount: number;
  usesGroupTip: boolean;
}

export interface Currency {
  code: string;
  name: string;
  rate: number;
}

export interface Fee {
  id: string;
  name: string;
  amount: number;
  isPercentage: boolean;
}
