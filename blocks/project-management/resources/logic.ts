import { useState } from 'react';

interface Equipment {
  id: string;
  name: string;
  category: string;
  model: string;
  serialNumber: string;
  purchaseDate: Date;
  status: 'available' | 'in_use' | 'maintenance' | 'repair';
  location: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
  notes?: string;
}

interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'ordered';
  supplier: string;
  lastOrderDate?: Date;
  nextOrderDate?: Date;
  notes?: string;
}

interface Workforce {
  id: string;
  name: string;
  department: string;
  position: string;
  skills: string[];
  status: 'available' | 'busy' | 'off';
  currentTask?: string;
  startDate: Date;
  endDate?: Date;
  contact: string;
  notes?: string;
}

interface Vehicle {
  id: string;
  name: string;
  type: string;
  plate: string;
  model: string;
  year: number;
  status: 'available' | 'in_use' | 'maintenance' | 'repair';
  currentLocation?: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
  notes?: string;
}

interface BuildingSystem {
  id: string;
  name: string;
  system: 'hvac' | 'electrical' | 'plumbing' | 'fire';
  type: string;
  model: string;
  serialNumber: string;
  installationDate: Date;
  status: 'operational' | 'maintenance' | 'repair' | 'replacement';
  location: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
  manufacturer: string;
  capacity?: number;
  unit?: string;
  specifications?: Record<string, unknown>;
  notes?: string;
}

interface ResourceData {
  activeTab: 'equipment' | 'materials' | 'workforce' | 'vehicles' | 'building';
  equipment: {
    items: Equipment[];
    categories: string[];
    statistics: {
      total: number;
      available: number;
      inUse: number;
      maintenance: number;
    };
  };
  materials: {
    items: Material[];
    categories: string[];
    statistics: {
      total: number;
      inStock: number;
      lowStock: number;
      outOfStock: number;
    };
  };
  workforce: {
    items: Workforce[];
    departments: string[];
    statistics: {
      total: number;
      available: number;
      busy: number;
      off: number;
    };
  };
  vehicles: {
    items: Vehicle[];
    types: string[];
    statistics: {
      total: number;
      available: number;
      inUse: number;
      maintenance: number;
    };
  };
  building: {
    items: BuildingSystem[];
    systems: {
      hvac: string[];
      electrical: string[];
      plumbing: string[];
      fire: string[];
    };
    statistics: {
      total: number;
      operational: number;
      maintenance: number;
      repair: number;
      replacement: number;
    };
  };
}

interface ResourceManagementState {
  resourceData: ResourceData;
}

export const useResourceManagement = (projectId: string) => {
  const [state, setState] = useState<ResourceManagementState>({
    resourceData: {
      activeTab: 'equipment',
      equipment: {
        items: [],
        categories: [],
        statistics: {
          total: 0,
          available: 0,
          inUse: 0,
          maintenance: 0
        }
      },
      materials: {
        items: [],
        categories: [],
        statistics: {
          total: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0
        }
      },
      workforce: {
        items: [],
        departments: [],
        statistics: {
          total: 0,
          available: 0,
          busy: 0,
          off: 0
        }
      },
      vehicles: {
        items: [],
        types: [],
        statistics: {
          total: 0,
          available: 0,
          inUse: 0,
          maintenance: 0
        }
      },
      building: {
        items: [],
        systems: {
          hvac: [
            'AHU (Hava İşleme Üniteleri)',
            'Fan Coil Üniteleri',
            'Chiller Üniteleri',
            'Pompalar',
            'Soğutma Kuleleri',
            'VAV Üniteleri',
            'Klima Santralleri'
          ],
          electrical: [
            'Trafo Merkezleri',
            'Jeneratörler',
            'UPS Sistemleri',
            'Ana Panolar',
            'Dağıtım Panoları',
            'Aydınlatma Sistemleri'
          ],
          plumbing: [
            'Su Pompaları',
            'Basınç Tankları',
            'Su Deposu',
            'Atık Su Pompaları',
            'Yağmur Suyu Sistemleri'
          ],
          fire: [
            'Yangın Pompaları',
            'Yangın Söndürme Sistemleri',
            'Duman Tahliye Sistemleri',
            'Yangın Alarm Sistemleri'
          ]
        },
        statistics: {
          total: 0,
          operational: 0,
          maintenance: 0,
          repair: 0,
          replacement: 0
        }
      }
    }
  });

  const updateResource = (updates: Partial<ResourceData>) => {
    setState(prevState => ({
      ...prevState,
      resourceData: {
        ...prevState.resourceData,
        ...updates
      }
    }));
  };

  return {
    resourceData: state.resourceData,
    updateResource
  };
}; 