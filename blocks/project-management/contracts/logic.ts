import { useState } from 'react';

interface BOQItem {
  id: string;
  code: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  status: 'active' | 'revised' | 'deleted';
}

interface ProgressPayment {
  id: string;
  period: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  deductions: number;
  netAmount: number;
  status: 'pending' | 'submitted' | 'approved' | 'paid';
  documents: string[];
}

interface RFI {
  id: string;
  number: string;
  subject: string;
  description: string;
  requestedBy: string;
  requestDate: Date;
  dueDate: Date;
  status: 'open' | 'answered' | 'closed';
  response?: string;
  responseDate?: Date;
  attachments: string[];
}

interface ContractChange {
  id: string;
  type: 'variation' | 'extension' | 'claim';
  description: string;
  requestedBy: string;
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  impact: {
    time: number;
    cost: number;
  };
  documents: string[];
}

interface ContractData {
  activeTab: 'boq' | 'progress' | 'rfi' | 'contract';
  boq: {
    items: BOQItem[];
    revisions: {
      date: Date;
      description: string;
      changes: Partial<BOQItem>[];
    }[];
  };
  progress: {
    payments: ProgressPayment[];
    summary: {
      totalContract: number;
      totalPaid: number;
      totalPending: number;
      totalDeductions: number;
    };
  };
  rfi: {
    requests: RFI[];
    statistics: {
      total: number;
      open: number;
      answered: number;
      closed: number;
    };
  };
  contract: {
    changes: ContractChange[];
    summary: {
      originalDuration: number;
      currentDuration: number;
      originalCost: number;
      currentCost: number;
    };
  };
}

interface ContractManagementState {
  contractData: ContractData;
}

export const useContractManagement = (projectId: string) => {
  const [state, setState] = useState<ContractManagementState>({
    contractData: {
      activeTab: 'boq',
      boq: {
        items: [],
        revisions: []
      },
      progress: {
        payments: [],
        summary: {
          totalContract: 0,
          totalPaid: 0,
          totalPending: 0,
          totalDeductions: 0
        }
      },
      rfi: {
        requests: [],
        statistics: {
          total: 0,
          open: 0,
          answered: 0,
          closed: 0
        }
      },
      contract: {
        changes: [],
        summary: {
          originalDuration: 0,
          currentDuration: 0,
          originalCost: 0,
          currentCost: 0
        }
      }
    }
  });

  const updateContract = (updates: Partial<ContractData>) => {
    setState(prevState => ({
      ...prevState,
      contractData: {
        ...prevState.contractData,
        ...updates
      }
    }));
  };

  return {
    contractData: state.contractData,
    updateContract
  };
}; 