import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface MaintenanceFormData {
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  notes?: string;
}

interface MaintenanceFormProps {
  onSubmit: (data: MaintenanceFormData) => void;
  initialData?: Partial<MaintenanceFormData>;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  onSubmit,
  initialData
}) => {
  const { register, handleSubmit } = useForm<MaintenanceFormData>({
    defaultValues: initialData
  });

  const onFormSubmit: SubmitHandler<MaintenanceFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div>
        <label>Description</label>
        <textarea {...register('description', { required: true })} />
      </div>

      <div>
        <label>Priority</label>
        <select {...register('priority', { required: true })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label>Assigned To</label>
        <input {...register('assignedTo', { required: true })} />
      </div>

      <div>
        <label>Notes</label>
        <textarea {...register('notes')} />
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default MaintenanceForm; 