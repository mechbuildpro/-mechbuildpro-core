import { useState } from 'react';

interface Drawing {
  id: string;
  name: string;
  category: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  author: string;
  createdDate: Date;
  lastModified: Date;
  fileUrl: string;
  notes?: string;
}

interface Model {
  id: string;
  name: string;
  category: 'bim' | 'render' | 'animation';
  version: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  author: string;
  createdDate: Date;
  lastModified: Date;
  fileUrl: string;
  thumbnailUrl?: string;
  notes?: string;
}

interface Revision {
  id: string;
  name: string;
  category: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  author: string;
  createdDate: Date;
  lastModified: Date;
  changes: string[];
  impact: string[];
  notes?: string;
}

interface Approval {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  requester: string;
  approver?: string;
  requestDate: Date;
  approvalDate?: Date;
  comments?: string;
  notes?: string;
}

interface Document {
  id: string;
  name: string;
  category: 'specifications' | 'products' | 'standards' | 'references';
  version: string;
  status: 'draft' | 'review' | 'approved' | 'rejected';
  author: string;
  createdDate: Date;
  lastModified: Date;
  fileUrl: string;
  notes?: string;
}

interface DesignData {
  activeTab: 'drawings' | 'models' | 'revisions' | 'approvals' | 'documentation';
  drawings: {
    items: Drawing[];
    categories: string[];
    statistics: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
    };
  };
  models: {
    items: Model[];
    categories: string[];
    statistics: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
    };
  };
  revisions: {
    items: Revision[];
    categories: string[];
    statistics: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
    };
  };
  approvals: {
    items: Approval[];
    categories: string[];
    statistics: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
    };
  };
  documentation: {
    items: Document[];
    categories: string[];
    statistics: {
      total: number;
      approved: number;
      pending: number;
      rejected: number;
    };
  };
}

interface DesignManagementState {
  designData: DesignData;
}

export const useDesignManagement = (projectId: string) => {
  const [state, setState] = useState<DesignManagementState>({
    designData: {
      activeTab: 'drawings',
      drawings: {
        items: [],
        categories: [
          'Mimari',
          'Statik',
          'Mekanik',
          'Elektrik',
          'Yangın'
        ],
        statistics: {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0
        }
      },
      models: {
        items: [],
        categories: [
          'BIM',
          'Render',
          'Animasyon'
        ],
        statistics: {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0
        }
      },
      revisions: {
        items: [],
        categories: [
          'Mimari',
          'Statik',
          'Mekanik',
          'Elektrik',
          'Yangın'
        ],
        statistics: {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0
        }
      },
      approvals: {
        items: [],
        categories: [
          'Mimari',
          'Statik',
          'Mekanik',
          'Elektrik',
          'Yangın'
        ],
        statistics: {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0
        }
      },
      documentation: {
        items: [],
        categories: [
          'Teknik Şartnameler',
          'Ürün Dokümantasyonu',
          'Standartlar ve Kodlar',
          'Referans Dokümanlar'
        ],
        statistics: {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0
        }
      }
    }
  });

  const updateDesign = (updates: Partial<DesignData>) => {
    setState(prevState => ({
      ...prevState,
      designData: {
        ...prevState.designData,
        ...updates
      }
    }));
  };

  return {
    designData: state.designData,
    updateDesign
  };
}; 