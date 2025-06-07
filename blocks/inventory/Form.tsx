'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useErrorHandler } from '../common/hooks/useErrorHandler';

const inventorySchema = z.object({
  itemName: z.string().min(1, 'Malzeme adı gereklidir'),
  itemCode: z.string().min(1, 'Malzeme kodu gereklidir'),
  category: z.enum(['hvac', 'fire-pump', 'electrical', 'plumbing', 'other']),
  unit: z.enum(['piece', 'meter', 'kg', 'liter', 'box']),
  quantity: z.number().min(0, 'Miktar 0\'dan küçük olamaz'),
  minQuantity: z.number().min(0, 'Minimum miktar 0\'dan küçük olamaz'),
  location: z.string().min(1, 'Depo konumu gereklidir'),
  supplier: z.string().optional(),
  unitPrice: z.number().min(0, 'Birim fiyat 0\'dan küçük olamaz'),
  lastRestockDate: z.string().optional(),
  lastRestockQuantity: z.number().min(0, 'Son stok miktarı 0\'dan küçük olamaz').optional(),
  notes: z.string().optional()
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  onSuccess: () => void;
}

export default function InventoryForm({ onSuccess }: InventoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema)
  });

  const onSubmit = async (data: InventoryFormData) => {
    setIsSubmitting(true);
    clearError();
    
    try {
      const response = await fetch('/api/inventory/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Malzeme kaydetme hatası');
      }

      reset();
      onSuccess();
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-primary-700">Malzeme Ekle</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Malzeme Adı</label>
            <input
              type="text"
              {...register('itemName')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.itemName && <p className="text-red-500 text-sm">{errors.itemName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Malzeme Kodu</label>
            <input
              type="text"
              {...register('itemCode')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.itemCode && <p className="text-red-500 text-sm">{errors.itemCode.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori</label>
            <select {...register('category')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="hvac">HVAC</option>
              <option value="fire-pump">Yangın Pompası</option>
              <option value="electrical">Elektrik</option>
              <option value="plumbing">Tesisat</option>
              <option value="other">Diğer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Birim</label>
            <select {...register('unit')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="piece">Adet</option>
              <option value="meter">Metre</option>
              <option value="kg">Kilogram</option>
              <option value="liter">Litre</option>
              <option value="box">Kutu</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Miktar</label>
              <input
                type="number"
                step="0.01"
                {...register('quantity', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Miktar</label>
              <input
                type="number"
                step="0.01"
                {...register('minQuantity', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.minQuantity && <p className="text-red-500 text-sm">{errors.minQuantity.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Depo Konumu</label>
            <input
              type="text"
              {...register('location')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tedarikçi</label>
            <input
              type="text"
              {...register('supplier')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Birim Fiyat</label>
            <input
              type="number"
              step="0.01"
              {...register('unitPrice', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.unitPrice && <p className="text-red-500 text-sm">{errors.unitPrice.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Son Stok Tarihi</label>
              <input
                type="date"
                {...register('lastRestockDate')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Son Stok Miktarı</label>
              <input
                type="number"
                step="0.01"
                {...register('lastRestockQuantity', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
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
    </ErrorBoundary>
  );
} 