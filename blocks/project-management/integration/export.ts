import Component from './Component';
import Form from './Form';
import { useIntegrationManagement, IntegrationData, BaseItem, SystemDependency, IntegrationTest, CommissioningPlan, SystemTransition } from './logic';
import * as ExportUtils from '../../utils/export';
import { createTable, formatReportData, formatDate } from './utils';

// Sistemler Arası Koordinasyon Raporları
export const exportCoordinationReport = (data: { items: SystemDependency[] }) => {
  const report = {
    title: 'Sistemler Arası Koordinasyon Raporu',
    date: new Date().toISOString(),
    summary: {
      total: data.items.length,
      byStatus: {
        notStarted: data.items.filter(item => item.status === 'not_started').length,
        inProgress: data.items.filter(item => item.status === 'in_progress').length,
        completed: data.items.filter(item => item.status === 'completed').length,
        blocked: data.items.filter(item => item.status === 'blocked').length,
        delayed: data.items.filter(item => item.status === 'delayed').length
      },
      byPriority: {
        low: data.items.filter(item => item.priority === 'low').length,
        medium: data.items.filter(item => item.priority === 'medium').length,
        high: data.items.filter(item => item.priority === 'high').length,
        critical: data.items.filter(item => item.priority === 'critical').length
      }
    },
    items: data.items.map(item => ({
      id: item.id,
      sourceSystem: item.sourceSystem,
      targetSystem: item.targetSystem,
      dependencyType: item.dependencyType,
      impact: item.impact,
      type: item.type,
      status: item.status,
      priority: item.priority,
      description: item.description,
      startDate: item.startDate,
      endDate: item.endDate
    }))
  };
  return report;
};

export const exportSystemDependencyReport = (data: { items: SystemDependency[] }) => {
  const report = {
    title: 'Sistem Bağımlılıkları Raporu',
    date: new Date().toISOString(),
    summary: {
      total: data.items.length,
      byType: {
        data: data.items.filter(item => item.dependencyType === 'data').length,
        control: data.items.filter(item => item.dependencyType === 'control').length,
        power: data.items.filter(item => item.dependencyType === 'power').length,
        communication: data.items.filter(item => item.dependencyType === 'communication').length
      }
    },
    dependencies: data.items.map(item => ({
      id: item.id,
      sourceSystem: item.sourceSystem,
      targetSystem: item.targetSystem,
      type: item.type,
      status: item.status,
      priority: item.priority,
      description: item.description,
      dependencyType: item.dependencyType,
      impact: item.impact
    }))
  };

  return report;
};

export const exportInterfaceReport = (data: { items: SystemDependency[] }) => {
  const report = {
    title: 'Sistem Arayüzleri Raporu',
    date: new Date().toISOString(),
    summary: {
      total: data.items.length,
      bySystem: {
        hvac: data.items.filter(item => item.sourceSystem === 'hvac' || item.targetSystem === 'hvac').length,
        electrical: data.items.filter(item => item.sourceSystem === 'electrical' || item.targetSystem === 'electrical').length,
        plumbing: data.items.filter(item => item.sourceSystem === 'plumbing' || item.targetSystem === 'plumbing').length,
        fire: data.items.filter(item => item.sourceSystem === 'fire' || item.targetSystem === 'fire').length,
        security: data.items.filter(item => item.sourceSystem === 'security' || item.targetSystem === 'security').length
      }
    },
    interfaces: data.items.map(item => ({
      id: item.id,
      sourceSystem: item.sourceSystem,
      targetSystem: item.targetSystem,
      type: item.type,
      status: item.status,
      description: item.description,
      dependencyType: item.dependencyType,
      impact: item.impact
    }))
  };

  return report;
};

export const exportDataFlowReport = (data: { items: SystemDependency[] }) => {
  const report = {
    title: 'Veri Akış Raporu',
    date: new Date().toISOString(),
    summary: {
      total: data.items.length,
      bySystem: {
        hvac: data.items.filter(item => item.sourceSystem === 'hvac' || item.targetSystem === 'hvac').length,
        electrical: data.items.filter(item => item.sourceSystem === 'electrical' || item.targetSystem === 'electrical').length,
        plumbing: data.items.filter(item => item.sourceSystem === 'plumbing' || item.targetSystem === 'plumbing').length,
        fire: data.items.filter(item => item.sourceSystem === 'fire' || item.targetSystem === 'fire').length,
        security: data.items.filter(item => item.sourceSystem === 'security' || item.targetSystem === 'security').length
      }
    },
    dataFlows: data.items.map(item => ({
      id: item.id,
      sourceSystem: item.sourceSystem,
      targetSystem: item.targetSystem,
      type: item.type,
      status: item.status,
      description: item.description,
      dependencyType: item.dependencyType,
      impact: item.impact
    }))
  };

  return report;
};

// Entegrasyon Test Raporları
export const exportTestReport = (data: { items: IntegrationTest[] }) => {
  const report = {
    title: 'Entegrasyon Test Raporu',
    date: new Date().toISOString(),
    summary: {
      total: data.items.length,
      byTestType: {
        unit: data.items.filter(item => item.testType === 'unit').length,
        integration: data.items.filter(item => item.testType === 'integration').length,
        system: data.items.filter(item => item.testType === 'system').length,
        acceptance: data.items.filter(item => item.testType === 'acceptance').length
      },
      byStatus: {
        notStarted: data.items.filter(item => item.status === 'not_started').length,
        inProgress: data.items.filter(item => item.status === 'in_progress').length,
        completed: data.items.filter(item => item.status === 'completed').length,
        blocked: data.items.filter(item => item.status === 'blocked').length,
        delayed: data.items.filter(item => item.status === 'delayed').length
      }
    },
    items: data.items.map(item => ({
      id: item.id,
      name: item.name,
      testType: item.testType,
      type: item.type,
      status: item.status,
      priority: item.priority,
      description: item.description,
      systems: item.systems,
      startDate: item.startDate,
      endDate: item.endDate,
      testCases: item.testCases
    }))
  };
  return report;
};

export const exportTestResultReport = (data: { items: IntegrationTest[] }) => {
  const report = {
    title: 'Test Sonuçları Raporu',
    date: new Date().toISOString(),
    summary: {
      total: data.items.filter(item => item.testCases.some(tc => tc.status === 'passed')).length,
      passed: data.items.filter(item => item.testCases.some(tc => tc.status === 'passed')).length,
      failed: data.items.filter(item => item.testCases.some(tc => tc.status === 'failed')).length,
      pending: data.items.filter(item => item.testCases.some(tc => tc.status === 'pending')).length,
      inProgress: data.items.filter(item => item.status === 'in_progress').length
    },
    results: data.items.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      status: item.status,
      systems: item.systems,
      testCases: item.testCases
    }))
  };

  return report;
};

export const exportTestIssueReport = (data: { items: IntegrationTest[] }) => {
  const report = {
    title: 'Test Sorunları Raporu',
    date: new Date().toISOString(),
    summary: {
      total: data.items.filter(item => item.testCases.some(tc => tc.status === 'failed')).length,
      byType: {
        unit: data.items.filter(item => item.testType === 'unit' && item.testCases.some(tc => tc.status === 'failed')).length,
        integration: data.items.filter(item => item.testType === 'integration' && item.testCases.some(tc => tc.status === 'failed')).length,
        system: data.items.filter(item => item.testType === 'system' && item.testCases.some(tc => tc.status === 'failed')).length,
        acceptance: data.items.filter(item => item.testType === 'acceptance' && item.testCases.some(tc => tc.status === 'failed')).length
      }
    },
    issues: data.items
      .filter(item => item.testCases.some(tc => tc.status === 'failed'))
      .map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        systems: item.systems,
        testCases: item.testCases.filter(tc => tc.status === 'failed')
      }))
  };

  return report;
};

// Devreye Alma Raporları
export const exportCommissioningReport = (data: { items: CommissioningPlan[] }) => {
  const report = {
    title: 'Devreye Alma Raporu',
    date: new Date().toISOString(),
    summary: {
      total: data.items.length,
      byStatus: {
        notStarted: data.items.filter(item => item.status === 'not_started').length,
        inProgress: data.items.filter(item => item.status === 'in_progress').length,
        completed: data.items.filter(item => item.status === 'completed').length,
        blocked: data.items.filter(item => item.status === 'blocked').length,
        delayed: data.items.filter(item => item.status === 'delayed').length
      },
      byPlanType: {
        mechanical: data.items.filter(item => item.planType === 'mechanical').length,
        electrical: data.items.filter(item => item.planType === 'electrical').length,
        control: data.items.filter(item => item.planType === 'control').length,
        system: data.items.filter(item => item.planType === 'system').length
      }
    },
    items: data.items.map(item => ({
      id: item.id,
      name: item.name,
      planType: item.planType,
      type: item.type,
      status: item.status,
      priority: item.priority,
      description: item.description,
      systems: item.systems,
      startDate: item.startDate,
      endDate: item.endDate,
      steps: item.steps
    }))
  };
  return report;
};

export const exportResourceReport = (data: { items: CommissioningPlan[] }) => {
  const report = {
    title: 'Kaynak Kullanım Raporu',
    date: new Date().toISOString(),
    summary: {
      // Kaynak kullanım özeti
    },
    details: [
      // Kaynak kullanım detayları
    ]
  };
  return report;
};

export const exportRiskReport = (data: { items: CommissioningPlan[] }) => {
  const report = {
    title: 'Risk Değerlendirme Raporu',
    date: new Date().toISOString(),
    summary: {
      // Risk özeti
    },
    risks: [
      // Risk detayları
    ]
  };
  return report;
};

export const exportBackupReport = (data: { items: CommissioningPlan[] }) => {
  const report = {
    title: 'Yedekleme Raporu',
    date: new Date().toISOString(),
    summary: {
      // Yedekleme özeti
    },
    details: [
      // Yedekleme detayları
    ]
  };
  return report;
};

export const exportRollbackReport = (data: { items: CommissioningPlan[] }) => {
  const report = {
    title: 'Geri Alma Planı Raporu',
    date: new Date().toISOString(),
    summary: {
      // Geri alma planı özeti
    },
    details: [
      // Geri alma planı detayları
    ]
  };
  return report;
};

// Sistem Geçiş Raporları
export const exportTransitionReport = (data: { items: SystemTransition[] }) => {
  const report = {
    title: 'Sistem Geçiş Raporu',
    date: new Date().toISOString(),
    summary: {
      total: data.items.length,
      byTransitionType: {
        upgrade: data.items.filter(item => item.transitionType === 'upgrade').length,
        migration: data.items.filter(item => item.transitionType === 'migration').length,
        replacement: data.items.filter(item => item.transitionType === 'replacement').length
      }
    },
    items: data.items.map(item => ({
      id: item.id,
      name: item.name,
      transitionType: item.transitionType,
      type: item.type,
      status: item.status,
      priority: item.priority,
      description: item.description,
      systems: item.systems,
      startDate: item.startDate,
      endDate: item.endDate,
      currentSystem: item.currentSystem,
      targetSystem: item.targetSystem,
      migrationSteps: item.migrationSteps
    }))
  };
  return report;
};

export const exportMigrationReport = (data: { items: SystemTransition[] }) => {
  const report = {
    title: 'Migrasyon Raporu',
    date: new Date().toISOString(),
    summary: {
      // Migrasyon özeti
    },
    details: [
      // Migrasyon detayları
    ]
  };
  return report;
};

export const exportTrainingReport = (data: { items: SystemTransition[] }) => {
  const report = {
    title: 'Eğitim Raporu',
    date: new Date().toISOString(),
    summary: {
      // Eğitim özeti
    },
    details: [
      // Eğitim detayları
    ]
  };
  return report;
};

export const exportSupportReport = (data: { items: SystemTransition[] }) => {
  const report = {
    title: 'Destek Raporu',
    date: new Date().toISOString(),
    summary: {
      // Destek özeti
    },
    details: [
      // Destek detayları
    ]
  };
  return report;
};

export const exportMonitoringReport = (data: { items: SystemTransition[] }) => {
  const report = {
    title: 'İzleme Raporu',
    date: new Date().toISOString(),
    summary: {
      // İzleme özeti
    },
    details: [
      // İzleme detayları
    ]
  };
  return report;
};

export const exportToPDF = async (report: any) => {
  // Placeholder implementation
  console.log('Exporting to PDF:', report);
};

export const exportToExcel = async (report: any) => {
   // Placeholder implementation
  console.log('Exporting to Excel:', report);
};

interface ExportData {
  coordination: {
    items: SystemDependency[];
  };
  testing: {
    items: IntegrationTest[];
  };
  commissioning: {
    items: CommissioningPlan[];
  };
  transition: {
    items: SystemTransition[];
  };
}

const formatDataForExport = (data: IntegrationData): ExportData => {
  return {
    coordination: { items: data.items.filter(item => item.type === 'coordination') as SystemDependency[] },
    testing: { items: data.items.filter(item => item.type === 'testing') as IntegrationTest[] },
    commissioning: { items: data.items.filter(item => item.type === 'commissioning') as CommissioningPlan[] },
    transition: { items: data.items.filter(item => item.type === 'transition') as SystemTransition[] },
  };
};

// Helper to format IntegrationData into ReportData[] for blocks/utils/export.ts
const formatIntegrationDataForReport = (data: IntegrationData): ExportUtils.ReportData[] => {
  // Bu fonksiyon IntegrationData tipindeki veriyi alıp,
  // blocks/utils/export.ts'deki generatePDF/generateExcel fonksiyonlarının beklediği
  // ReportData[] formatına dönüştürecek.
  // Bu dönüşüm mantığı, hangi entegrasyon verilerinin hangi rapor bölümlerine (siteInfo, progress, vb.)
  // karşılık geldiğine bağlı olacaktır.
  // Şimdilik sadece placeholder bir dönüşüm yapalım:

  // Örnek: Koordinasyon öğelerini temel bir rapor listesi olarak dönüştürme
  const coordinationReportItems = data.items
    .filter(item => item.type === 'coordination')
    .map(item => ({
      type: item.type,
      data: { /* item verisinden uygun alanları buraya yerleştirin */ }
    }));

  // Diğer entegrasyon tipleri için benzer dönüşümler yapılabilir ve hepsi birleştirilebilir.

  return coordinationReportItems as ExportUtils.ReportData[]; // Tip dönüşümü gerekebilir
};

export const exportAllReports = async (data: IntegrationData, format: 'pdf' | 'excel' | 'csv' | 'json'): Promise<void> => {
  // Use the new formatting function
  const reportData = formatIntegrationDataForReport(data);

  if (format === 'pdf') {
    console.log('Exporting all reports to PDF:', data);
    // Pass the formatted data to generatePDF
    // generatePDF birden çok rapor datasını işleyebiliyor, bu yüzden formatlanmış diziyi gönderiyoruz.
    await ExportUtils.generatePDF(reportData, 'all-integration-reports');

  } else if (format === 'excel') {
    console.log('Exporting all reports to Excel:', data);
    // Pass the formatted data to generateExcel
    await generateExcel(reportData);

  } else if (format === 'csv') {
    console.log('Exporting all reports to CSV:', data);
    // TODO: Implement CSV export logic using blocks/utils/export.ts (needs generateCSV function)
    throw new Error('CSV export not implemented yet.');

  } else if (format === 'json') {
    console.log('Exporting all reports to JSON:', data);
    // JSON export logic
    const jsonString = JSON.stringify(data, null, 2); // Export raw IntegrationData as JSON
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-integration-reports.json';
    a.click();
    URL.revokeObjectURL(url);
    // No throw needed for JSON if implemented this way
  }
};

// Helper function to format data for export (if needed)
// export const formatDataForExport = (data: IntegrationData) => { ... };

// Modül dışına aktarılacak diğer öğeler
export { Component, Form, useIntegrationManagement, generatePDF, generateExcel, createTable, formatReportData, formatDate };
export type { SystemDependency, IntegrationTest, CommissioningPlan, SystemTransition, IntegrationData, BaseItem }; 