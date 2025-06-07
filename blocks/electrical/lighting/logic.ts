import { useState } from 'react';

interface LightingInput {
  roomDimensions: {
    length: number;
    width: number;
    height: number;
  };
  workingPlaneHeight: number;
  maintenanceFactor: number;
  reflectance:
    {
      ceiling: number;
      walls: number;
      floor: number;
    };
  requiredIlluminance: number;
  luminaireType: string;
  luminaireLumenOutput: number;
}

interface LightingResult {
  calculatedIlluminance: number;
  numberOfLuminaires: number;
  totalPowerConsumption: number;
  energyEfficiency: number; // Calculated based on power and illuminance
  // Diğer hesaplama sonuçları buraya eklenebilir
}

interface LightingState {
  input: LightingInput;
  result: LightingResult | null;
  loading: boolean;
  error: string | null;
}

export const useLightingCalculations = () => {
  const [state, setState] = useState<LightingState>({
    input: {
      roomDimensions: { length: 0, width: 0, height: 0 },
      workingPlaneHeight: 0.8,
      maintenanceFactor: 0.8,
      reflectance: { ceiling: 0.7, walls: 0.5, floor: 0.2 },
      requiredIlluminance: 500,
      luminaireType: '',
      luminaireLumenOutput: 0,
    },
    result: null,
    loading: false,
    error: null,
  });

  const updateInput = (updates: Partial<LightingInput>) => {
    setState(prevState => ({
      ...prevState,
      input: { ...prevState.input, ...updates },
    }));
  };

  const calculateLighting = async (inputData: LightingInput) => {
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    try {
      // Aydınlatma hesaplama mantığı buraya gelecek
      // Bu sadece bir placeholder hesaplamadır
      const calculatedResult: LightingResult = {
        calculatedIlluminance: inputData.luminaireLumenOutput / (inputData.roomDimensions.length * inputData.roomDimensions.width) * inputData.maintenanceFactor, // Basit formül örneği
        numberOfLuminaires: 1, // Örnek değer
        totalPowerConsumption: 50, // Örnek değer
        energyEfficiency: 10, // Örnek değer
      };

      setState(prevState => ({ ...prevState, result: calculatedResult, loading: false }));
    } catch (err: unknown) {
       const errorMessage = err instanceof Error ? err.message : 'Aydınlatma hesaplaması sırasında bir hata oluştu.';
      setState(prevState => ({ ...prevState, error: errorMessage, loading: false, result: null }));
      console.error('Lighting calculation error:', err);
    }
  };

  return {
    state,
    updateInput,
    calculateLighting,
  };
}; 