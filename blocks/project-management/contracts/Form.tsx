import React from 'react';
import { useForm } from 'react-hook-form';

interface ContractFormData {
  type: 'boq' | 'progress' | 'rfi' | 'contract';
  name: string;
  description: string;
  date: Date;
  status: string;
  amount?: number;
  category?: string;
  dueDate?: Date;
  attachments?: File[];
  notes?: string;
}

interface ContractFormProps {
  onSubmit: (data: ContractFormData) => void;
  initialData?: Partial<ContractFormData>;
}

export const ContractForm: React.FC<ContractFormProps> = ({
  onSubmit,
  initialData
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ContractFormData>({
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="contract-form">
      <div className="form-group">
        <label>İşlem Tipi</label>
        <select {...register('type', { required: true })}>
          <option value="boq">Metraj (BOQ)</option>
          <option value="progress">Hakediş</option>
          <option value="rfi">Bilgi Talebi (RFI)</option>
          <option value="contract">Sözleşme Değişikliği</option>
        </select>
        {errors.type && <span className="error">İşlem tipi gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Başlık</label>
        <input
          type="text"
          {...register('name', { required: true })}
          placeholder="İşlem başlığı"
        />
        {errors.name && <span className="error">Başlık gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Açıklama</label>
        <textarea
          {...register('description', { required: true })}
          placeholder="İşlem açıklaması"
        />
        {errors.description && <span className="error">Açıklama gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Tarih</label>
        <input
          type="date"
          {...register('date', { required: true })}
        />
        {errors.date && <span className="error">Tarih gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Durum</label>
        <select {...register('status', { required: true })}>
          <option value="pending">Beklemede</option>
          <option value="in_progress">İşlemde</option>
          <option value="completed">Tamamlandı</option>
          <option value="cancelled">İptal Edildi</option>
        </select>
        {errors.status && <span className="error">Durum gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Tutar</label>
        <input
          type="number"
          {...register('amount')}
          placeholder="Tutar"
        />
      </div>

      <div className="form-group">
        <label>Kategori</label>
        <input
          type="text"
          {...register('category')}
          placeholder="Kategori"
        />
      </div>

      <div className="form-group">
        <label>Son Tarih</label>
        <input
          type="date"
          {...register('dueDate')}
        />
      </div>

      <div className="form-group">
        <label>Dosyalar</label>
        <input
          type="file"
          multiple
          {...register('attachments')}
        />
      </div>

      <div className="form-group">
        <label>Notlar</label>
        <textarea
          {...register('notes')}
          placeholder="Ek notlar"
        />
      </div>

      <button type="submit" className="submit-button">
        Kaydet
      </button>
    </form>
  );
};

export default ContractForm; 