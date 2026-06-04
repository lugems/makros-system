'use client';

import { useState, useEffect, useCallback } from 'react';
import { MakrosService } from '@/types/makros-service';
import * as servicesService from '@/services/services-service';
import { useToast } from '@/hooks/use-toast';

export const useServices = () => {
  const [services, setServices] = useState<MakrosService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadServices = useCallback(async () => {
    // Real-time data handled via useCollection in main page
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const addService = async (data: Omit<MakrosService, 'serviceId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const serviceId = servicesService.createService(data);
      toast({
        title: 'Service Created',
        description: 'The service has been created successfully.',
      });
      return serviceId;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create service.',
        variant: 'destructive',
      });
    }
  };

  return {
    services,
    isLoading,
    addService,
    refresh: loadServices,
  };
};
