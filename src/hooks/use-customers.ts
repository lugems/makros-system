import { useState, useEffect } from 'react';
import { Customer } from '@/types/customer';

const initialCustomers: Customer[] = [
  { customerId: '1', fullName: 'John Doe', email: 'john.doe@example.com', phone: '123-456-7890', address: '123 Main St', status: 'Active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { customerId: '2', fullName: 'Jane Smith', email: 'jane.smith@example.com', phone: '987-654-3210', address: '456 Oak Ave', status: 'Active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const addCustomer = (customer: Omit<Customer, 'customerId'>) => {
    const newCustomer = { ...customer, customerId: Date.now().toString(), status: 'Active' as const, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setCustomers([...customers, newCustomer]);
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map(c => c.customerId === updatedCustomer.customerId ? updatedCustomer : c));
  };

  return { customers, isLoading, addCustomer, updateCustomer };
};
