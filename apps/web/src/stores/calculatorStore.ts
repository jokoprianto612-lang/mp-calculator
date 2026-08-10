import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalculationInputs, CalculationResult } from '@/shared';

interface CalculatorState {
  // Form inputs
  inputs: CalculationInputs;
  setInputs: (inputs: Partial<CalculationInputs>) => void;
  resetInputs: () => void;

  // Results
  marketplacePrice: CalculationResult | null;
  livePrice: CalculationResult | null;
  setMarketplacePrice: (result: CalculationResult) => void;
  setLivePrice: (result: CalculationResult) => void;

  // Calculation state
  isCalculating: boolean;
  setIsCalculating: (value: boolean) => void;
  lastCalculated: Date | null;
  setLastCalculated: (date: Date) => void;

  // Actions
  calculate: () => Promise<void>;
}

const defaultInputs: CalculationInputs = {
  marketplace: 'tokopedia',
  mode: 'marketplace',
  category: 'electronics',
  hpp: 150000,
  targetMargin: 20,
  sellerVoucher: 0,
  platformVoucher: 0,
  isMallSeller: false,
  useAds: true,
  adBudget: 22500,
  useAms: true,
  weight: 0.5,
  originCity: 'Jakarta',
  destinationCity: 'Surabaya',
  packingCost: 5000,
  freeShippingProgram: 'xtra',
  promoProgram: 'promo-xtra',
  // Live mode defaults (required by zod schema even when mode='marketplace')
  liveDiscountPercent: 20,
  liveAdBudget: 0,
  livePackingCost: 0,
};

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      inputs: defaultInputs,
      marketplacePrice: null,
      livePrice: null,
      isCalculating: false,
      lastCalculated: null,

      setInputs: (newInputs) => set((state) => ({
        inputs: { ...state.inputs, ...newInputs },
      })),

      resetInputs: () => set({ inputs: defaultInputs }),

      setMarketplacePrice: (result) => set({ marketplacePrice: result }),
      setLivePrice: (result) => set({ livePrice: result }),

      setIsCalculating: (value) => set({ isCalculating: value }),
      setLastCalculated: (date) => set({ lastCalculated: date }),

      calculate: async () => {
        const { inputs, setIsCalculating, setMarketplacePrice, setLivePrice, setLastCalculated } = get();
setIsCalculating(true);

        try {
          // Import the fee engine dynamically
          const { calculateMarketplacePrice, calculateLivePrice, validateInputs } = await import('@/shared');

          // Validate
          const validation = validateInputs(inputs);
          if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
          }

          // Calculate marketplace price
          const marketplaceResult = calculateMarketplacePrice(inputs);
          setMarketplacePrice(marketplaceResult);

          // Calculate live price if in live mode
          if (inputs.mode === 'live') {
            const liveInputs = inputs as any; // LiveSellingInputs
            const liveResult = calculateLivePrice(marketplaceResult.marketplacePrice, liveInputs);
            setLivePrice(liveResult);
          } else {
            setLivePrice(null as any);
          }

          setLastCalculated(new Date());
        } catch (error) {
          console.error('Calculation error:', error);
        } finally {
          setIsCalculating(false);
        }
      },
    }),
    {
      name: 'calculator-storage',
      partialize: (state) => ({
        inputs: state.inputs,
        marketplacePrice: state.marketplacePrice,
        livePrice: state.livePrice,
      }),
    }
  )
);
