import { useContext } from 'react';
import { PlateShareContext } from './PlateShareContextValue';

export function usePlateShare() {
  const context = useContext(PlateShareContext);
  if (!context)
    throw new Error('usePlateShare must be used inside PlateShareProvider');
  return context;
}
