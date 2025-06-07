'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const reportSchema = z.object({
  reportTitle: z.string().min(1, 'Rapor başlığı gereklidir'),
  reportType: z.enum(['technical', 'commercial', 'summary', 'detailed']),
  modules: z.array(z.enum(['hvac', 'fire-pump', 'zoning', 'boq', 'sozlesme'])).min(1, 'En az bir modül seçilmelidir'),
  dateRange: z.object({
    startDate: z.string(),
    endDate: z.string()
  }),
  includeCalculations: z.boolean(),
  includeGraphs: z.boolean(),
  includeCosts: z.boolean(),
  includeRecommendations: z.boolean(),
  language: z.enum(['tr', 'en']),
  format: z.enum(['pdf', 'excel', 'word']),
  notes: z.string().optional()
});

type ReportFormData = z.infer<typeof reportSchema>;

export default function ReportForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      includeCalculations: true,
      includeGraphs: true,
      includeCosts: true,
      includeRecommendations: true,
      language: 'tr',
      format: 'pdf'
    }
  });

  const onSubmit = async (data: ReportFormData) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Rapor oluşturma başarısız: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.reportTitle}.${data.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
      console.error(`Rapor oluşturma hatası: ${errorMessage}`, error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-primary-700">Rapor Oluşturma</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Rapor Başlığı</label>
          <input
            type="text"
            {...register('reportTitle')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.reportTitle && <p className="text-red-500 text-sm">{errors.reportTitle.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rapor Tipi</label>
          <select {...register('reportType')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="technical">Teknik Rapor</option>
            <option value="commercial">Ticari Rapor</option>
            <option value="summary">Özet Rapor</option>
            <option value="detailed">Detaylı Rapor</option>
          </select>
          {errors.reportType && <p className="text-red-500 text-sm">{errors.reportType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Modüller</label>
          <div className="mt-2 space-y-2">
            {['hvac', 'fire-pump', 'zoning', 'boq', 'sozlesme'].map((module) => (
              <label key={module} className="inline-flex items-center mr-4">
                <input
                  type="checkbox"
                  value={module}
                  {...register('modules')}
                  className="rounded border-gray-300 text-primary-600 shadow-sm"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {module === 'hvac' && 'HVAC'}
                  {module === 'fire-pump' && 'Yangın Pompası'}
                  {module === 'zoning' && 'Zonlama'}
                  {module === 'boq' && 'BOQ'}
                  {module === 'sozlesme' && 'Sözleşme'}
                </span>
              </label>
            ))}
          </div>
          {errors.modules && <p className="text-red-500 text-sm">{errors.modules.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
            <input
              type="date"
              {...register('dateRange.startDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
            <input
              type="date"
              {...register('dateRange.endDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register('includeCalculations')}
              className="rounded border-gray-300 text-primary-600 shadow-sm"
            />
            <span className="ml-2 text-sm text-gray-700">Hesaplamaları Dahil Et</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register('includeGraphs')}
              className="rounded border-gray-300 text-primary-600 shadow-sm"
            />
            <span className="ml-2 text-sm text-gray-700">Grafikleri Dahil Et</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register('includeCosts')}
              className="rounded border-gray-300 text-primary-600 shadow-sm"
            />
            <span className="ml-2 text-sm text-gray-700">Maliyetleri Dahil Et</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register('includeRecommendations')}
              className="rounded border-gray-300 text-primary-600 shadow-sm"
            />
            <span className="ml-2 text-sm text-gray-700">Önerileri Dahil Et</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dil</label>
          <select {...register('language')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Format</label>
          <select {...register('format')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="word">Word</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notlar</label>
          <textarea
            {...register('notes')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isGenerating ? 'Rapor Oluşturuluyor...' : 'Rapor Oluştur'}
        </button>
      </form>
    </div>
  );
} 