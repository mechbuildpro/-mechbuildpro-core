import React from 'react';

export interface SiteData {
  name: string;
  location: string;
  area: number;
  startDate: Date;
  endDate: Date;
  progress: {
    completed: number;
    inProgress: number;
    pending: number;
    total: number;
  };
  resources: {
    personnel: number;
    equipment: number;
    materials: number;
  };
  safety: {
    incidents: number;
    inspections: number;
    violations: number;
    details: {
      date: Date;
      type: string;
      description: string;
      status: 'open' | 'closed' | 'pending';
    }[];
  };
  health: {
    inspections: number;
    violations: number;
    trainings: number;
    details: {
      date: Date;
      type: string;
      description: string;
      status: 'open' | 'closed' | 'pending';
    }[];
  };
}

export interface SiteManagementState {
  siteData: SiteData;
  loading: boolean;
  error: string | null;
}

export const useSiteManagement = () => {
  const [state, setState] = React.useState<SiteManagementState>({
    siteData: {
      name: '',
      location: '',
      area: 0,
      startDate: new Date(),
      endDate: new Date(),
      progress: {
        completed: 0,
        inProgress: 0,
        pending: 0,
        total: 0
      },
      resources: {
        personnel: 0,
        equipment: 0,
        materials: 0
      },
      safety: {
        incidents: 0,
        inspections: 0,
        violations: 0,
        details: []
      },
      health: {
        inspections: 0,
        violations: 0,
        trainings: 0,
        details: []
      }
    },
    loading: false,
    error: null
  });

  const updateSiteData = (data: Partial<SiteData>) => {
    setState(prev => ({
      ...prev,
      siteData: {
        ...prev.siteData,
        ...data
      }
    }));
  };

  const updateProgress = (progress: Partial<SiteData['progress']>) => {
    setState(prev => ({
      ...prev,
      siteData: {
        ...prev.siteData,
        progress: {
          ...prev.siteData.progress,
          ...progress
        }
      }
    }));
  };

  const updateResources = (resources: Partial<SiteData['resources']>) => {
    setState(prev => ({
      ...prev,
      siteData: {
        ...prev.siteData,
        resources: {
          ...prev.siteData.resources,
          ...resources
        }
      }
    }));
  };

  const addSafetyIncident = (incident: SiteData['safety']['details'][0]) => {
    setState(prev => ({
      ...prev,
      siteData: {
        ...prev.siteData,
        safety: {
          ...prev.siteData.safety,
          incidents: prev.siteData.safety.incidents + 1,
          details: [...prev.siteData.safety.details, incident]
        }
      }
    }));
  };

  const addHealthInspection = (inspection: SiteData['health']['details'][0]) => {
    setState(prev => ({
      ...prev,
      siteData: {
        ...prev.siteData,
        health: {
          ...prev.siteData.health,
          inspections: prev.siteData.health.inspections + 1,
          details: [...prev.siteData.health.details, inspection]
        }
      }
    }));
  };

  return {
    siteData: state.siteData,
    loading: state.loading,
    error: state.error,
    updateSiteData,
    updateProgress,
    updateResources,
    addSafetyIncident,
    addHealthInspection
  };
}; 