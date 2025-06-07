import React from 'react';
import { useProjectPlanning } from './logic';

interface ProjectPlanningProps {
  projectId: string;
  onPlanUpdate?: (planData: any) => void;
}

export const ProjectPlanning: React.FC<ProjectPlanningProps> = ({
  projectId,
  onPlanUpdate
}) => {
  const { planData, updatePlan } = useProjectPlanning(projectId);

  const handlePlanUpdate = (updates: any) => {
    updatePlan(updates);
    onPlanUpdate?.(updates);
  };

  return (
    <div className="project-planning">
      <div className="planning-tabs">
        <button onClick={() => handlePlanUpdate({ activeTab: 'wbs' })}>
          İş Kırılım Yapısı
        </button>
        <button onClick={() => handlePlanUpdate({ activeTab: 'resources' })}>
          Kaynaklar
        </button>
        <button onClick={() => handlePlanUpdate({ activeTab: 'cost' })}>
          Maliyetler
        </button>
        <button onClick={() => handlePlanUpdate({ activeTab: 'schedule' })}>
          Zaman Planı
        </button>
      </div>

      <div className="planning-content">
        {planData.activeTab === 'wbs' && (
          <div className="wbs-section">
            <h3>İş Kırılım Yapısı</h3>
            {/* WBS içeriği buraya gelecek */}
          </div>
        )}

        {planData.activeTab === 'resources' && (
          <div className="resources-section">
            <h3>Kaynak Planlaması</h3>
            {/* Kaynak planlaması içeriği buraya gelecek */}
          </div>
        )}

        {planData.activeTab === 'cost' && (
          <div className="cost-section">
            <h3>Maliyet Planlaması</h3>
            {/* Maliyet planlaması içeriği buraya gelecek */}
          </div>
        )}

        {planData.activeTab === 'schedule' && (
          <div className="schedule-section">
            <h3>Zaman Planlaması</h3>
            {/* Zaman planlaması içeriği buraya gelecek */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPlanning; 