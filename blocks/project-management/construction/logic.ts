import { useState } from 'react';

interface Schedule {
  id: string;
  name: string;
  category: 'foundation' | 'structure' | 'mechanical' | 'electrical' | 'finishing';
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  startDate: Date;
  endDate: Date;
  progress: number;
  dependencies?: string[];
  assignedTo?: string;
  description?: string;
  notes?: string;
}

interface Progress {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  date: Date;
  status: 'on_time' | 'delayed' | 'completed';
  completedTasks: number;
  totalTasks: number;
  issues?: string[];
  photos?: string[];
  report?: string;
  submittedBy: string;
  approvedBy?: string;
  approvalDate?: Date;
  comments?: string;
}

interface Quality {
  id: string;
  type: 'inspection' | 'test' | 'verification';
  status: 'passed' | 'failed' | 'pending';
  date: Date;
  location: string;
  inspector: string;
  findings?: string[];
  photos?: string[];
  report?: string;
  correctiveActions?: string[];
  followUpDate?: Date;
  notes?: string;
}

interface Safety {
  id: string;
  type: 'inspection' | 'risk' | 'accident' | 'training';
  status: 'passed' | 'failed' | 'pending';
  date: Date;
  location: string;
  inspector: string;
  findings?: string[];
  photos?: string[];
  report?: string;
  correctiveActions?: string[];
  followUpDate?: Date;
  notes?: string;
}

interface WorkOrder {
  id: string;
  type: 'construction' | 'maintenance' | 'repair' | 'inspection';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdDate: Date;
  dueDate: Date;
  assignedTo: string;
  location: string;
  description: string;
  materials?: string[];
  labor?: string[];
  equipment?: string[];
  photos?: string[];
  completionDate?: Date;
  notes?: string;
}

export interface ConstructionData {
  schedule: {
    items: Schedule[];
    categories: {
      foundation: Schedule[];
      structure: Schedule[];
      mechanical: Schedule[];
      electrical: Schedule[];
      finishing: Schedule[];
    };
    statistics: {
      total: number;
      notStarted: number;
      inProgress: number;
      completed: number;
      delayed: number;
    };
  };
  progress: {
    items: Progress[];
    categories: {
      daily: Progress[];
      weekly: Progress[];
      monthly: Progress[];
    };
    statistics: {
      total: number;
      onTime: number;
      delayed: number;
      completed: number;
    };
  };
  quality: {
    items: Quality[];
    categories: {
      inspection: Quality[];
      test: Quality[];
      verification: Quality[];
    };
    statistics: {
      total: number;
      passed: number;
      failed: number;
      pending: number;
    };
  };
  safety: {
    items: Safety[];
    categories: {
      inspection: Safety[];
      risk: Safety[];
      accident: Safety[];
      training: Safety[];
    };
    statistics: {
      total: number;
      passed: number;
      failed: number;
      pending: number;
    };
  };
  workOrders: {
    items: WorkOrder[];
    categories: {
      construction: WorkOrder[];
      maintenance: WorkOrder[];
      repair: WorkOrder[];
      inspection: WorkOrder[];
    };
    statistics: {
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
      cancelled: number;
    };
  };
  activeTab: 'schedule' | 'progress' | 'quality' | 'safety' | 'workorders';
}

interface ConstructionManagementState {
  constructionData: ConstructionData;
  updateConstruction: (updates: Partial<ConstructionData>) => void;
}

export const useConstructionManagement = (projectId: string): ConstructionManagementState => {
  const [constructionData, setConstructionData] = useState<ConstructionData>({
    schedule: {
      items: [],
      categories: {
        foundation: [],
        structure: [],
        mechanical: [],
        electrical: [],
        finishing: []
      },
      statistics: {
        total: 0,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        delayed: 0
      }
    },
    progress: {
      items: [],
      categories: {
        daily: [],
        weekly: [],
        monthly: []
      },
      statistics: {
        total: 0,
        onTime: 0,
        delayed: 0,
        completed: 0
      }
    },
    quality: {
      items: [],
      categories: {
        inspection: [],
        test: [],
        verification: []
      },
      statistics: {
        total: 0,
        passed: 0,
        failed: 0,
        pending: 0
      }
    },
    safety: {
      items: [],
      categories: {
        inspection: [],
        risk: [],
        accident: [],
        training: []
      },
      statistics: {
        total: 0,
        passed: 0,
        failed: 0,
        pending: 0
      }
    },
    workOrders: {
      items: [],
      categories: {
        construction: [],
        maintenance: [],
        repair: [],
        inspection: []
      },
      statistics: {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0
      }
    },
    activeTab: 'schedule'
  });

  const updateConstruction = (updates: Partial<ConstructionData>) => {
    setConstructionData(prev => ({
      ...prev,
      ...updates
    }));
  };

  return {
    constructionData,
    updateConstruction
  };
}; 