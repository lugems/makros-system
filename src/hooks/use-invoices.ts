import { useState, useEffect } from 'react';
import { Invoice } from '@/types/invoice';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Invoices are now handled via useCollection in components
    setIsLoading(false);
  }, []);

  return { invoices, isLoading };
};
