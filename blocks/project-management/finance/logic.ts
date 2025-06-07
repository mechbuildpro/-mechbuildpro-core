import React from 'react';

interface FinanceData {
  activeTab: 'budget' | 'costs' | 'payments' | 'reports';
  budget?: {
    plans: Array<{
      id: string;
      name: string;
      amount: number;
      category: string;
      startDate: string;
      endDate: string;
    }>;
    revisions: Array<{
      id: string;
      planId: string;
      amount: number;
      reason: string;
      date: string;
    }>;
  };
  costs?: {
    expenses: Array<{
      id: string;
      name: string;
      amount: number;
      category: string;
      date: string;
      status: string;
    }>;
    centers: Array<{
      id: string;
      name: string;
      budget: number;
      spent: number;
      remaining: number;
    }>;
  };
  payments?: {
    schedule: Array<{
      id: string;
      name: string;
      amount: number;
      dueDate: string;
      status: string;
    }>;
    transactions: Array<{
      id: string;
      paymentId: string;
      amount: number;
      date: string;
      type: string;
    }>;
  };
  reports?: {
    income: Array<{
      id: string;
      name: string;
      amount: number;
      date: string;
      category: string;
    }>;
    expenses: Array<{
      id: string;
      name: string;
      amount: number;
      date: string;
      category: string;
    }>;
    cashflow: Array<{
      id: string;
      date: string;
      income: number;
      expense: number;
      balance: number;
    }>;
  };
}

interface FinanceManagementState {
  financeData: FinanceData;
}

export const useFinanceManagement = (projectId: string) => {
  const [state, setState] = React.useState<FinanceManagementState>({
    financeData: {
      activeTab: 'budget',
      budget: {
        plans: [],
        revisions: []
      },
      costs: {
        expenses: [],
        centers: []
      },
      payments: {
        schedule: [],
        transactions: []
      },
      reports: {
        income: [],
        expenses: [],
        cashflow: []
      }
    }
  });

  const updateFinance = (updates: Partial<FinanceData>) => {
    setState(prev => ({
      ...prev,
      financeData: {
        ...prev.financeData,
        ...updates
      }
    }));
  };

  return {
    financeData: state.financeData,
    updateFinance
  };
}; 