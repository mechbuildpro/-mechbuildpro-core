import React from 'react';
import { useForm } from 'react-hook-form';

interface FormProps {
  onSubmit: (data: any) => void;
  children?: React.ReactNode;
}

export const Form: React.FC<FormProps> = ({ onSubmit, children }) => {
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {children}
    </form>
  );
};

export default Form;
