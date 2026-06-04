import { StaffMember } from '@/types/staff';

interface MechanicWorkloadProps {
  staff: StaffMember;
}

export function MechanicWorkload({ staff }: MechanicWorkloadProps) {
  if (staff.role !== 'Mechanic') {
    return null;
  }

  return (
    <div className="text-sm">
      <p>Assigned: {staff.assignedJobs}</p>
      <p>Completed: {staff.completedJobs}</p>
      <p>Workload: {staff.currentWorkload}</p>
    </div>
  );
}
