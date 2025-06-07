import React from 'react';
import { useForm } from 'react-hook-form';

interface ResourceFormData {
  type: 'equipment' | 'materials' | 'workforce' | 'vehicles';
  name: string;
  category: string;
  status: string;
  description?: string;
  quantity?: number;
  unit?: string;
  location?: string;
  contact?: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

interface ResourceFormProps {
  onSubmit: (data: ResourceFormData) => void;
  initialData?: Partial<ResourceFormData>;
}

export const ResourceForm: React.FC<ResourceFormProps> = ({
  onSubmit,
  initialData
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ResourceFormData>({
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="resource-form">
      <div className="form-group">
        <label>Kaynak Tipi</label>
        <select {...register('type', { required: true })}>
          <option value="equipment">Ekipman</option>
          <option value="materials">Malzeme</option>
          <option value="workforce">İş Gücü</option>
          <option value="vehicles">Araç</option>
        </select>
        {errors.type && <span className="error">Kaynak tipi gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Ad</label>
        <input
          type="text"
          {...register('name', { required: true })}
          placeholder="Kaynak adı"
        />
        {errors.name && <span className="error">Ad gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Kategori</label>
        <input
          type="text"
          {...register('category', { required: true })}
          placeholder="Kategori"
        />
        {errors.category && <span className="error">Kategori gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Durum</label>
        <select {...register('status', { required: true })}>
          <option value="available">Müsait</option>
          <option value="in_use">Kullanımda</option>
          <option value="maintenance">Bakımda</option>
          <option value="repair">Tamirde</option>
        </select>
        {errors.status && <span className="error">Durum gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Açıklama</label>
        <textarea
          {...register('description')}
          placeholder="Kaynak açıklaması"
        />
      </div>

      <div className="form-group">
        <label>Miktar</label>
        <input
          type="number"
          {...register('quantity')}
          placeholder="Miktar"
        />
      </div>

      <div className="form-group">
        <label>Birim</label>
        <input
          type="text"
          {...register('unit')}
          placeholder="Birim"
        />
      </div>

      <div className="form-group">
        <label>Konum</label>
        <input
          type="text"
          {...register('location')}
          placeholder="Konum"
        />
      </div>

      <div className="form-group">
        <label>İletişim</label>
        <input
          type="text"
          {...register('contact')}
          placeholder="İletişim bilgisi"
        />
      </div>

      <div className="form-group">
        <label>Başlangıç Tarihi</label>
        <input
          type="date"
          {...register('startDate')}
        />
      </div>

      <div className="form-group">
        <label>Bitiş Tarihi</label>
        <input
          type="date"
          {...register('endDate')}
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

export default ResourceForm; 