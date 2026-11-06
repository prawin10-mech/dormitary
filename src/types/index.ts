// Client-safe shapes (no mongoose). Mirror the server models in src/server/models.
export interface IAdmin {
  _id: string;
  name: string;
  email: string;
  fcmToken?: string[];
  profileImage?: string;
  role: "ADMIN" | "USER" | "AGENT";
  createdAt?: string;
  updatedAt?: string;
}

export interface ICustomer {
  _id: string;
  name?: string;
  email?: string;
  number: string;
  age?: number;
  photo: string;
  aadharFront: string;
  aadharBack: string;
  bed: any;
  createdAt?: string;
  updatedAt?: string;
  checkOutAt?: string;
  period?: "Day" | "Month";
  purpose?: string;
  paymentType?: "UPI" | "Cash" | "Not Paid";
}

export interface Bed {
  _id: string;
  bed: string;
  type: string;
  isOccupied: boolean;
  createdAt: string;
  updatedAt: string;
  occupiedDate: string;
}

export interface HistoryRecord {
  bed: Bed;
  name: string;
  phone: string;
  createdAt: string;
  checkout: string;
  aadharFront?: string;
  aadharBack?: string;
  photo?: string;
  email?: string;
  number?: string;
  age?: string;
  period?: string;
  purpose?: string;
}

export interface Day {
  [day: number]: HistoryRecord[];
}

export interface Month {
  [month: number]: Day;
}

export interface HistoryResponse {
  [year: number]: Month;
}
