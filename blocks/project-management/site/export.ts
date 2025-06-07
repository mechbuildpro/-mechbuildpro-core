import { SiteData } from './logic';
import { generatePDF, generateExcel } from '../../utils/export';
import Component from './Component';
import Form from './Form';
export { useSiteManagement } from './logic';

export { Component, Form };

interface SiteReport {
  siteInfo: {
    name: string;
    location: string;
    area: number;
    startDate: Date;
    endDate: Date;
  };
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
  };
  health: {
    inspections: number;
    violations: number;
    trainings: number;
  };
}

// Özel export fonksiyonları
export const exportSiteReport = async (data: SiteData): Promise<void> => {
  try {
    const report: SiteReport = {
      siteInfo: {
        name: data.name,
        location: data.location,
        area: data.area,
        startDate: data.startDate,
        endDate: data.endDate
      },
      progress: {
        completed: data.progress.completed,
        inProgress: data.progress.inProgress,
        pending: data.progress.pending,
        total: data.progress.total
      },
      resources: {
        personnel: data.resources.personnel,
        equipment: data.resources.equipment,
        materials: data.resources.materials
      },
      safety: {
        incidents: data.safety.incidents,
        inspections: data.safety.inspections,
        violations: data.safety.violations
      },
      health: {
        inspections: data.health.inspections,
        violations: data.health.violations,
        trainings: data.health.trainings
      }
    };

    await generatePDF([report], 'site-report');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error(`Site report export error: ${errorMessage}`, error);
    throw error;
  }
};

export const exportSafetyReport = async (data: SiteData): Promise<void> => {
  try {
    const report = {
      siteInfo: {
        name: data.name,
        location: data.location
      },
      safety: {
        incidents: data.safety.incidents,
        inspections: data.safety.inspections,
        violations: data.safety.violations,
        details: data.safety.details
      }
    };

    await generatePDF([report], 'safety-report');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error(`Safety report export error: ${errorMessage}`, error);
    throw error;
  }
};

export const exportHealthReport = async (data: SiteData): Promise<void> => {
  try {
    const report = {
      siteInfo: {
        name: data.name,
        location: data.location
      },
      health: {
        inspections: data.health.inspections,
        violations: data.health.violations,
        trainings: data.health.trainings,
        details: data.health.details
      }
    };

    await generatePDF([report], 'health-report');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error(`Health report export error: ${errorMessage}`, error);
    throw error;
  }
};

export const exportAllReports = async (data: SiteData, format: 'pdf' | 'excel'): Promise<void> => {
  try {
    const reports = [
      {
        type: 'site',
        data: {
          siteInfo: {
            name: data.name,
            location: data.location,
            area: data.area,
            startDate: data.startDate,
            endDate: data.endDate
          },
          progress: data.progress,
          resources: data.resources
        }
      },
      {
        type: 'safety',
        data: {
          siteInfo: {
            name: data.name,
            location: data.location
          },
          safety: data.safety
        }
      },
      {
        type: 'health',
        data: {
          siteInfo: {
            name: data.name,
            location: data.location
          },
          health: data.health
        }
      }
    ];

    if (format === 'pdf') {
      await generatePDF(reports, 'site-all-reports');
    } else {
      await generateExcel(reports);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    console.error(`Export error: ${errorMessage}`, error);
    throw error;
  }
};