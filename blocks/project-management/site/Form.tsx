import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface SiteFormData {
  name: string;
  address: string;
  area: number;
  startDate: string;
  endDate: string;
  manager: string;
  contactPhone: string;
  emergencyContact: string;
  notes?: string;
}

interface SiteFormProps {
  onSubmit: (data: SiteFormData) => void;
  initialData?: Partial<SiteFormData>;
}

export const SiteForm: React.FC<SiteFormProps> = ({
  onSubmit,
  initialData
}) => {
  const { register, handleSubmit } = useForm<SiteFormData>({
    defaultValues: initialData
  });

  const onFormSubmit: SubmitHandler<SiteFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div>
        <label>Şantiye Adı</label>
        <input {...register('name', { required: true })} />
      </div>

      <div>
        <label>Şantiye Adresi</label>
        <textarea {...register('address', { required: true })} />
      </div>

      <div>
        <label>Alan (m²)</label>
        <input 
          type="number" 
          {...register('area', { required: true, min: 0 })} 
        />
      </div>

      <div>
        <label>Başlangıç Tarihi</label>
        <input 
          type="date" 
          {...register('startDate', { required: true })} 
        />
      </div>

      <div>
        <label>Bitiş Tarihi</label>
        <input 
          type="date" 
          {...register('endDate', { required: true })} 
        />
      </div>

      <div>
        <label>Şantiye Şefi</label>
        <input {...register('manager', { required: true })} />
      </div>

      <div>
        <label>İletişim Telefonu</label>
        <input {...register('contactPhone', { required: true })} />
      </div>

      <div>
        <label>Acil Durum İletişim</label>
        <input {...register('emergencyContact', { required: true })} />
      </div>

      <div>
        <label>Notlar</label>
        <textarea {...register('notes')} />
      </div>

      <button type="submit">Şantiyeyi Kaydet</button>
    </form>
  );
};

export default SiteForm; 