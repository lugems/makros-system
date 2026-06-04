import { StaffMember } from '@/types/staff';

export const MOCK_STAFF: StaffMember[] = [
  {
    userId: "STF-001",
    fullName: "John Doe",
    phone: "123-456-7890",
    email: "john.doe@example.com",
    role: "Mechanic",
    status: "Active",
    specialization: "Engine Diagnostics",
    assignedJobs: 5,
    completedJobs: 25,
    currentWorkload: 3,
    createdAt: "2023-01-15T09:30:00Z",
    updatedAt: "2023-10-26T10:00:00Z",
    address: "Kampala Central"
  },
  {
    userId: "STF-002",
    fullName: "Jane Smith",
    phone: "987-654-3210",
    email: "jane.smith@example.com",
    role: "Workshop Manager",
    status: "Active",
    createdAt: "2022-11-20T14:00:00Z",
    updatedAt: "2023-10-25T11:30:00Z",
    address: "Ntinda"
  },
  {
    userId: "STF-003",
    fullName: "Peter Jones",
    phone: "555-123-4567",
    email: "peter.jones@example.com",
    role: "Receptionist",
    status: "Active",
    createdAt: "2023-03-10T11:00:00Z",
    updatedAt: "2023-10-24T09:45:00Z",
    address: "Nakawa"
  },
  {
    userId: "STF-004",
    fullName: "Sam Wilson",
    phone: "555-987-6543",
    email: "sam.wilson@example.com",
    role: "Mechanic",
    status: "Inactive",
    specialization: "Brake Systems",
    assignedJobs: 0,
    completedJobs: 18,
    currentWorkload: 0,
    createdAt: "2023-02-05T16:45:00Z",
    updatedAt: "2023-09-15T14:20:00Z",
    address: "Kira"
  },
  {
    userId: "STF-005",
    fullName: "Emily Brown",
    phone: "555-555-5555",
    email: "emily.brown@example.com",
    role: "Makros System Owner",
    status: "Active",
    createdAt: "2021-09-01T08:00:00Z",
    updatedAt: "2023-10-27T08:00:00Z",
    address: "Kololo"
  },
];
