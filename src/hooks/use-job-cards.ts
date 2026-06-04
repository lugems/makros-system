import { useState, useEffect } from 'react';
import { JobCard } from '@/types/job-card';

export const useJobCards = () => {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // Transitioning to Firestore-based useCollection
    setLoading(false);
  }, []);

  return { jobCards, isLoading };
};
