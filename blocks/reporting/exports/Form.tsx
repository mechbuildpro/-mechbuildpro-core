import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface ExportFormData {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  options?: Record<string, any>;
}

interface ExportFormProps {
  onSubmit: (data: ExportFormData) => void;
}

export const ExportForm: React.FC<ExportFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit } = useForm<ExportFormData>();

  const onFormSubmit: SubmitHandler<ExportFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <select {...register('format')}>
        <option value="pdf">PDF</option>
        <option value="excel">Excel</option>
        <option value="csv">CSV</option>
        <option value="json">JSON</option>
      </select>
      <button type="submit">Export</button>
    </form>
  );
};

export default ExportForm;
