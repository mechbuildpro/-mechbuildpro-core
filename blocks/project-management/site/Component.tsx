import React from 'react';

interface SiteManagementProps {
  projectId: string;
  // Diğer gerekli prop tipleri buraya eklenecek
}

const SiteManagementComponent: React.FC<SiteManagementProps> = ({ projectId }) => {
  // Bileşen mantığı buraya gelecek

  return (
    <div>
      {/* Bileşen JSX içeriği */}
      <p>Site Yönetimi Bileşeni Hazır!</p>
      <p>Proje ID: {projectId}</p>
    </div>
  );
};

export default SiteManagementComponent; 