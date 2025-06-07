import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createMaintenancePlan, type MaintenancePlan } from './logic';

const maintenancePlanSchema = z.object({
  name: z.string().min(1, 'Plan adı gereklidir'),
  type: z.enum(['routine', 'preventive', 'corrective', 'emergency']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  systemId: z.string().min(1, 'Sistem seçimi gereklidir'),
  systemType: z.string().min(1, 'Sistem tipi gereklidir'),
  location: z.string().min(1, 'Konum gereklidir'),
  description: z.string().min(1, 'Açıklama gereklidir'),
  assignedTo: z.string().min(1, 'Atanan kişi gereklidir'),
  startDate: z.string().min(1, 'Başlangıç tarihi gereklidir'),
  endDate: z.string().min(1, 'Bitiş tarihi gereklidir'),
  estimatedDuration: z.number().min(1, 'Tahmini süre gereklidir'),
  checklist: z.array(z.object({
    description: z.string().min(1, 'Kontrol maddesi açıklaması gereklidir'),
    notes: z.string().optional()
  })),
  materials: z.array(z.object({
    name: z.string().min(1, 'Malzeme adı gereklidir'),
    quantity: z.number().min(1, 'Miktar gereklidir'),
    unit: z.string().min(1, 'Birim gereklidir'),
    notes: z.string().optional()
  })),
  notes: z.string().optional()
});

type MaintenancePlanFormData = z.infer<typeof maintenancePlanSchema>;

interface MaintenancePlanFormProps {
  onSuccess?: (plan: MaintenancePlan) => void;
  onCancel?: () => void;
}

export const MaintenancePlanForm: React.FC<MaintenancePlanFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<MaintenancePlanFormData>({
    resolver: zodResolver(maintenancePlanSchema),
    defaultValues: {
      checklist: [{ description: '', notes: '' }],
      materials: [{ name: '', quantity: 1, unit: '', notes: '' }]
    }
  });

  const onSubmit = async (data: MaintenancePlanFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const plan = await createMaintenancePlan({
        ...data,
        status: 'pending',
        notes: data.notes || '',
        checklist: data.checklist.map(item => ({
          ...item,
          id: crypto.randomUUID(),
          isCompleted: false
        })),
        materials: data.materials.map(material => ({
          ...material,
          id: crypto.randomUUID(),
          status: 'available' // Varsayılan olarak mevcut
        }))
      });
      onSuccess?.(plan);
    } catch (err) {
      setError('Plan oluşturulurken bir hata oluştu');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addChecklistItem = () => {
    const currentChecklist = watch('checklist');
    setValue('checklist', [...currentChecklist, { description: '', notes: '' }]);
  };

  const removeChecklistItem = (index: number) => {
    const currentChecklist = watch('checklist');
    setValue('checklist', currentChecklist.filter((_, i) => i !== index));
  };

  const addMaterial = () => {
    const currentMaterials = watch('materials');
    setValue('materials', [...currentMaterials, { name: '', quantity: 1, unit: '', notes: '' }]);
  };

  const removeMaterial = (index: number) => {
    const currentMaterials = watch('materials');
    setValue('materials', currentMaterials.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Temel Bilgiler */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Temel Bilgiler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Plan Adı</label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tip</label>
            <select
              {...register('type')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seçiniz</option>
              <option value="routine">Rutin</option>
              <option value="preventive">Önleyici</option>
              <option value="corrective">Düzeltici</option>
              <option value="emergency">Acil</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Öncelik</label>
            <select
              {...register('priority')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Seçiniz</option>
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
              <option value="critical">Kritik</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sistem</label>
            <input
              type="text"
              {...register('systemId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.systemId && (
              <p className="mt-1 text-sm text-red-600">{errors.systemId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sistem Tipi</label>
            <input
              type="text"
              {...register('systemType')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.systemType && (
              <p className="mt-1 text-sm text-red-600">{errors.systemType.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Konum</label>
            <input
              type="text"
              {...register('location')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Zaman Bilgileri */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Zaman Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi</label>
            <input
              type="date"
              {...register('startDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi</label>
            <input
              type="date"
              {...register('endDate')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tahmini Süre (dakika)</label>
            <input
              type="number"
              {...register('estimatedDuration', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.estimatedDuration && (
              <p className="mt-1 text-sm text-red-600">{errors.estimatedDuration.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Atanan Kişi</label>
            <input
              type="text"
              {...register('assignedTo')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.assignedTo && (
              <p className="mt-1 text-sm text-red-600">{errors.assignedTo.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Kontrol Listesi */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Kontrol Listesi</h2>
          <button
            type="button"
            onClick={addChecklistItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Madde Ekle
          </button>
        </div>
        <div className="space-y-4">
          {watch('checklist').map((_, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  {...register(`checklist.${index}.description`)}
                  placeholder="Kontrol maddesi açıklaması"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.checklist?.[index]?.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.checklist[index]?.description?.message}</p>
                )}
                <input
                  type="text"
                  {...register(`checklist.${index}.notes`)}
                  placeholder="Notlar (opsiyonel)"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeChecklistItem(index)}
                className="mt-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Malzemeler */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Malzemeler</h2>
          <button
            type="button"
            onClick={addMaterial}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Malzeme Ekle
          </button>
        </div>
        <div className="space-y-4">
          {watch('materials').map((_, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  {...register(`materials.${index}.name`)}
                  placeholder="Malzeme adı"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.materials?.[index]?.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.materials[index]?.name?.message}</p>
                )}
              </div>
              <div>
                <input
                  type="number"
                  {...register(`materials.${index}.quantity`, { valueAsNumber: true })}
                  placeholder="Miktar"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.materials?.[index]?.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.materials[index]?.quantity?.message}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  {...register(`materials.${index}.unit`)}
                  placeholder="Birim"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.materials?.[index]?.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.materials[index]?.unit?.message}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  {...register(`materials.${index}.notes`)}
                  placeholder="Notlar (opsiyonel)"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  className="mt-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notlar */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Notlar</h2>
        <textarea
          {...register('notes')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Ek notlar (opsiyonel)"
        />
      </div>

      {/* Form Butonları */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </form>
  );
}; 