'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { JobTaskForm, TaskFormData } from '@/components/job-cards/job-task-form';
import { PartUsedForm, PartFormData } from '@/components/job-cards/part-used-form';
import { MOCK_JOB_CARDS } from '@/data/seed-job-cards';
import { MOCK_INVENTORY } from '@/data/seed-inventory';

export function JobCardDetailsPage() {
  const params = useParams();
  // Consistently look for jobCardId from the dynamic segment
  const jobCardId = params.jobCardId as string;
  const jobCard = MOCK_JOB_CARDS.find(jc => jc.id === jobCardId);

  if (!jobCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-2xl font-bold">Job Card Not Found</h2>
        <p className="text-muted-foreground">The job card with ID {jobCardId || 'unknown'} could not be located.</p>
        <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const handleTaskSubmit = (data: TaskFormData) => console.log('New Task:', data);
  const handlePartSubmit = (data: PartFormData) => console.log('New Part:', data);
  const handleStatusUpdate = (status: string) => console.log('Status Updated:', status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Job Card - {jobCard.id}</h1>
        <div className="px-3 py-1 bg-secondary rounded text-sm font-medium">
          Status: {jobCard.status}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-card/50">
        <div>
          <p className="text-sm text-muted-foreground">Customer</p>
          <p className="font-semibold">{jobCard.customerName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Vehicle</p>
          <p className="font-semibold">{jobCard.vehicleDescription}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Assigned Mechanic</p>
          <p className="font-semibold">{jobCard.assignedMechanicName || 'Not Assigned'}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Estimate</p>
          <p className="font-semibold text-accent">${jobCard.totalCost.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <JobTaskForm onSubmit={handleTaskSubmit} />
        </div>
        <div className="space-y-4">
          <PartUsedForm onSubmit={handlePartSubmit} inventoryItems={MOCK_INVENTORY} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-4 border-t">
        <Button onClick={() => handleStatusUpdate('In Progress')}>Start Work</Button>
        <Button onClick={() => handleStatusUpdate('Completed')} variant="secondary">Mark as Complete</Button>
        <Button variant="outline">Generate Invoice</Button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Inspection Photos</h2>
        <div className="border-dashed border-2 border-border rounded-lg p-12 text-center bg-secondary/5">
          <p className="text-muted-foreground">No photos uploaded yet.</p>
          <Button variant="link" className="mt-2">Upload Files</Button>
        </div>
      </div>
    </div>
  );
}
