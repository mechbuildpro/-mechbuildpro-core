'use client'

import ReportComponent from '@/blocks/reporting/analytics/Component'
import { ExportComponent } from '@/blocks/reporting/exports/Component'

export default function ReportingPage() {
  const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'json') => {
    console.log(`Exporting report in ${format} format`);
    // Add export logic here
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reporting</h1>
      <ExportComponent onExport={handleExport} className="mb-4"/>
      <ReportComponent />
    </div>
  )
} 