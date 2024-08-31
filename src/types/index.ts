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
  aadharFront?: string;
  aadharBack?: string;
  photo?: string;
  email?: string;
  number?: string;
  age?: string;
  period?: string;
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
