import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface DashboardFormData {
  title: string;
  layout: 'grid' | 'list';
  filters: string[];
  refreshInterval?: number;
}

interface DashboardFormProps {
  onSubmit: (data: DashboardFormData) => void;
  initialData?: Partial<DashboardFormData>;
}

export const DashboardForm: React.FC<DashboardFormProps> = ({
  onSubmit,
  initialData
}) => {
  const { register, handleSubmit } = useForm<DashboardFormData>({
    defaultValues: initialData
  });

  const onFormSubmit: SubmitHandler<DashboardFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div>
        <label>Dashboard Title</label>
        <input {...register('title', { required: true })} />
      </div>

      <div>
        <label>Layout</label>
        <select {...register('layout', { required: true })}>
          <option value="grid">Grid</option>
          <option value="list">List</option>
        </select>
      </div>

      <div>
        <label>Refresh Interval (seconds)</label>
        <input 
          type="number" 
          {...register('refreshInterval')} 
          min="0"
          step="1"
        />
      </div>

      <button type="submit">Save Dashboard</button>
    </form>
  );
};

export default DashboardForm; 