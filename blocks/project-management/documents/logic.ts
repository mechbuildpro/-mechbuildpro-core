import React from 'react';

interface DocumentData {
  activeTab: 'drawings' | 'contracts' | 'reports' | 'archive';
  drawings?: {
    files: Array<{
      id: string;
      name: string;
      type: string;
      version: string;
      revision: string;
      uploadDate: string;
    }>;
    revisions: Array<{
      id: string;
      drawingId: string;
      version: string;
      changes: string;
      date: string;
    }>;
  };
  contracts?: {
    documents: Array<{
      id: string;
      name: string;
      type: string;
      status: string;
      startDate: string;
      endDate: string;
    }>;
    licenses: Array<{
      id: string;
      name: string;
      type: string;
      expiryDate: string;
      status: string;
    }>;
  };
  reports?: {
    progress: Array<{
      id: string;
      name: string;
      type: string;
      date: string;
      status: string;
    }>;
    quality: Array<{
      id: string;
      name: string;
      type: string;
      date: string;
      status: string;
    }>;
    cost: Array<{
      id: string;
      name: string;
      type: string;
      date: string;
      status: string;
    }>;
  };
  archive?: {
    categories: Array<{
      id: string;
      name: string;
      description: string;
    }>;
    documents: Array<{
      id: string;
      name: string;
      categoryId: string;
      uploadDate: string;
      accessLevel: string;
    }>;
  };
}

interface DocumentManagementState {
  documentData: DocumentData;
}

export const useDocumentManagement = (projectId: string) => {
  const [state, setState] = React.useState<DocumentManagementState>({
    documentData: {
      activeTab: 'drawings',
      drawings: {
        files: [],
        revisions: []
      },
      contracts: {
        documents: [],
        licenses: []
      },
      reports: {
        progress: [],
        quality: [],
        cost: []
      },
      archive: {
        categories: [],
        documents: []
      }
    }
  });

  const updateDocument = (updates: Partial<DocumentData>) => {
    setState(prev => ({
      ...prev,
      documentData: {
        ...prev.documentData,
        ...updates
      }
    }));
  };

  return {
    documentData: state.documentData,
    updateDocument
  };
}; 