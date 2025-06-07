import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface PlanFormData {
  projectName: string;
  startDate: string;
  endDate: string;
  budget: number;
  manager: string;
  description?: string;
}

interface PlanFormProps {
  onSubmit: (data: PlanFormData) => void;
  initialData?: Partial<PlanFormData>;
}

export const PlanForm: React.FC<PlanFormProps> = ({
  onSubmit,
  initialData
}) => {
  const { register, handleSubmit } = useForm<PlanFormData>({
    defaultValues: initialData
  });

  const onFormSubmit: SubmitHandler<PlanFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div>
        <label>Proje Adı</label>
        <input {...register('projectName', { required: true })} />
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
        <label>Bütçe</label>
        <input 
          type="number" 
          {...register('budget', { required: true, min: 0 })} 
        />
      </div>

      <div>
        <label>Proje Yöneticisi</label>
        <input {...register('manager', { required: true })} />
      </div>

      <div>
        <label>Açıklama</label>
        <textarea {...register('description')} />
      </div>

      <button type="submit">Planı Kaydet</button>
    </form>
  );
};

export default PlanForm; 