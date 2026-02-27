export interface Transaction {
    id: number;
    date: string;
    type: "Ingreso" | "Egreso";
    category: string;
    amount: number;
    paymentMethod: string;
    invoice?: string;
    description: string;
}

export interface Shift {
    id: number;
    name: string;
    timeLabel: string;
    responsible: string;
    openingCash: number;
    systemIncome: number;
    systemExpense: number;
    realCash: number | null;
    difference: number | null;
    status: "No Iniciado" | "Abierta" | "Cerrada";
    notes?: string;
    openedAt?: number;
    closedAt?: number;
    startingStock?: { name: string; quantity: number }[];
    stockSnapshot?: { name: string; quantity: number }[];
}

export interface ArchivedDay {
    date: string;
    shifts: Shift[];
    totalBalance: number;
    movements?: { [key: string]: { income: number; expense: number } };
}

export interface StaffRoster {
    [key: string]: {
        morning: string;
        afternoon: string;
    };
}

export interface Account {
    id: number;
    name: string;
    type: "Ingreso" | "Egreso" | "Mixto";
    balance: number;
    color: string;
}
