'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const taskSchema = z.object({
  taskName: z.string().min(1, 'Görev adı gereklidir'),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['not_started', 'in_progress', 'completed', 'delayed']),
  assignedTo: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  estimatedHours: z.number().min(0, 'Süre 0\'dan küçük olamaz'),
  actualHours: z.number().min(0, 'Süre 0\'dan küçük olamaz').optional(),
  module: z.enum(['hvac', 'fire-pump', 'zoning', 'boq', 'sozlesme']),
  milestone: z.boolean(),
  notes: z.string().optional()
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function TimelineForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      status: 'not_started',
      milestone: false
    }
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/timeline/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Görev kaydetme hatası');
      }

      // Form başarıyla gönderildi
      window.location.reload();
    } catch (error) {
      console.error('Görev kaydetme hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-primary-700">Görev Ekle</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Görev Adı</label>
          <input
            type="text"
            {...register('taskName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.taskName && <p className="text-red-500 text-sm">{errors.taskName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Açıklama</label>
          <textarea
            {...register('description')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows={3}
          />
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Öncelik</label>
          <select {...register('priority')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Durum</label>
          <select {...register('status')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="not_started">Başlanmadı</option>
            <option value="in_progress">Devam Ediyor</option>
            <option value="completed">Tamamlandı</option>
            <option value="delayed">Gecikti</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Atanan Kişi</label>
          <input
            type="text"
            {...register('assignedTo')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bağımlılıklar</label>
          <input
            type="text"
            {...register('dependencies')}
            placeholder="Görev ID'lerini virgülle ayırın"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tahmini Süre (Saat)</label>
            <input
              type="number"
              step="0.5"
              {...register('estimatedHours', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.estimatedHours && <p className="text-red-500 text-sm">{errors.estimatedHours.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gerçekleşen Süre (Saat)</label>
            <input
              type="number"
              step="0.5"
              {...register('actualHours', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.actualHours && <p className="text-red-500 text-sm">{errors.actualHours.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Modül</label>
          <select {...register('module')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
            <option value="hvac">HVAC</option>
            <option value="fire-pump">Yangın Pompası</option>
            <option value="zoning">Zonlama</option>
            <option value="boq">BOQ</option>
            <option value="sozlesme">Sözleşme</option>
          </select>
        </div>

        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register('milestone')}
              className="rounded border-gray-300 text-primary-600 shadow-sm"
            />
            <span className="ml-2 text-sm text-gray-700">Kilometre Taşı</span>
          </label>
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