'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const progressSchema = z.object({
  module: z.enum(['hvac', 'fire-pump', 'electrical', 'plumbing', 'other']),
  phase: z.string().min(1, 'Faz adı gereklidir'),
  startDate: z.string().min(1, 'Başlangıç tarihi gereklidir'),
  endDate: z.string().min(1, 'Bitiş tarihi gereklidir'),
  plannedProgress: z.number().min(0).max(100, 'Planlanan ilerleme 0-100 arasında olmalıdır'),
  actualProgress: z.number().min(0).max(100, 'Gerçekleşen ilerleme 0-100 arasında olmalıdır'),
  status: z.enum(['on-track', 'at-risk', 'delayed', 'completed']),
  blockers: z.array(z.string()).optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional()
});

type ProgressFormData = z.infer<typeof progressSchema>;

export default function ProgressForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ProgressFormData>({
    resolver: zodResolver(progressSchema)
  });

  const onSubmit = async (data: ProgressFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('İlerleme kaydetme hatası');
      }

      // Form başarıyla gönderildi
      window.location.reload();
    } catch (error) {
      console.error('İlerleme kaydetme hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-primary-700">İlerleme Güncelle</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Modül</label>
          <select {...register('module')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="hvac">HVAC</option>
            <option value="fire-pump">Yangın Pompası</option>
            <option value="electrical">Elektrik</option>
            <option value="plumbing">Tesisat</option>
            <option value="other">Diğer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Faz</label>
          <input
            type="text"
            {...register('phase')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.phase && <p className="text-red-500 text-sm">{errors.phase.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
            <input
              type="date"
              {...register('startDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
            <input
              type="date"
              {...register('endDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Planlanan İlerleme (%)</label>
            <input
              type="number"
              step="1"
              {...register('plannedProgress', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.plannedProgress && <p className="text-red-500 text-sm">{errors.plannedProgress.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gerçekleşen İlerleme (%)</label>
            <input
              type="number"
              step="1"
              {...register('actualProgress', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.actualProgress && <p className="text-red-500 text-sm">{errors.actualProgress.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Durum</label>
          <select {...register('status')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="on-track">Planlandığı Gibi</option>
            <option value="at-risk">Risk Altında</option>
            <option value="delayed">Gecikmeli</option>
            <option value="completed">Tamamlandı</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Engeller</label>
          <textarea
            {...register('blockers')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows={2}
            placeholder="Her satıra bir engel yazın"
          />
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
          disabled={isSubmitting}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </form>
    </div>
  );
} 