import React from 'react';

export interface PlanData {
  activeTab: 'wbs' | 'resources' | 'cost' | 'schedule';
  wbs?: {
    tasks: Array<{
      id: string;
      name: string;
      parentId?: string;
      duration: number;
      dependencies: string[];
    }>;
  };
  resources?: {
    labor: Array<{
      id: string;
      type: string;
      quantity: number;
      cost: number;
    }>;
    equipment: Array<{
      id: string;
      type: string;
      quantity: number;
      cost: number;
    }>;
    materials: Array<{
      id: string;
      type: string;
      quantity: number;
      cost: number;
    }>;
  };
  cost?: {
    budget: number;
    expenses: Array<{
      id: string;
      type: string;
      amount: number;
      date: string;
    }>;
  };
  schedule?: {
    startDate: string;
    endDate: string;
    milestones: Array<{
      id: string;
      name: string;
      date: string;
    }>;
  };
}

interface ProjectPlanningState {
  planData: PlanData;
}

export const useProjectPlanning = (projectId: string) => {
  const [state, setState] = React.useState<ProjectPlanningState>({
    planData: {
      activeTab: 'wbs',
      wbs: {
        tasks: []
      },
      resources: {
        labor: [],
        equipment: [],
        materials: []
      },
      cost: {
        budget: 0,
        expenses: []
      },
      schedule: {
        startDate: '',
        endDate: '',
        milestones: []
      }
    }
  });

  const updatePlan = (updates: Partial<PlanData>) => {
    setState(prev => ({
      ...prev,
      planData: {
        ...prev.planData,
        ...updates
      }
    }));
  };

  return {
    planData: state.planData,
    updatePlan
  };
}; 