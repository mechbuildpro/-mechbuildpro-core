import React from 'react';

interface CommonComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export const CommonComponent: React.FC<CommonComponentProps> = ({ children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default CommonComponent;
