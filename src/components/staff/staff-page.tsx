'use client';

import { useState } from 'react';
import { MOCK_STAFF } from '@/data/seed-staff';
import { StaffMember } from '@/types/staff';
import { StaffList } from '@/components/staff/staff-list';
import { AddStaffModal } from '@/components/staff/add-staff-modal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterStaff(term, roleFilter, statusFilter);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    filterStaff(searchTerm, role, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterStaff(searchTerm, roleFilter, status);
  };

  const filterStaff = (searchStr: string, role: string, status: string) => {
    let tempStaff = [...staff];

    if (searchStr) {
      tempStaff = tempStaff.filter(
        (s) =>
          s.fullName.toLowerCase().includes(searchStr.toLowerCase()) ||
          s.phone.includes(searchStr) ||
          s.email.toLowerCase().includes(searchStr.toLowerCase()) ||
          s.role.toLowerCase().includes(searchStr.toLowerCase())
      );
    }

    if (role !== 'All') {
      tempStaff = tempStaff.filter((s) => s.role === role);
    }

    if (status !== 'All') {
      tempStaff = tempStaff.filter((s) => s.status === status);
    }

    setFilteredStaff(tempStaff);
  };
  
  const handleAddStaff = (newStaff: Partial<StaffMember>) => {
    const staffToAdd: StaffMember = {
      ...newStaff as Omit<StaffMember, 'userId' | 'createdAt' | 'updatedAt'>,
      userId: `STF-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedStaffList = [staffToAdd, ...staff];
    setStaff(updatedStaffList);
    
    // Re-apply filters to updated list
    const tempFiltered = updatedStaffList.filter(s => {
        const matchesSearch = !searchTerm || s.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || s.role === roleFilter;
        const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });
    setFilteredStaff(tempFiltered);
  };

  const handleEditStaff = (staffId: string, updatedStaff: Partial<StaffMember>) => {
    const now = new Date().toISOString();
    const updated = staff.map((s) =>
      s.userId === staffId ? { ...s, ...updatedStaff, updatedAt: now } : s
    );
    setStaff(updated);
    // Re-apply filters
    filterStaff(searchTerm, roleFilter, statusFilter);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <AddStaffModal onAdd={handleAddStaff} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <Input
          placeholder="Search by name, phone, email, or role..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="md:max-w-sm"
        />
        <div className="flex items-center space-x-4">
          <Select onValueChange={handleRoleFilter} defaultValue="All">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Roles</SelectItem>
              <SelectItem value="Garage Owner">Garage Owner</SelectItem>
              <SelectItem value="Workshop Manager">Workshop Manager</SelectItem>
              <SelectItem value="Receptionist">Receptionist</SelectItem>
              <SelectItem value="Mechanic">Mechanic</SelectItem>
              <SelectItem value="Inventory Officer">Inventory Officer</SelectItem>
              <SelectItem value="Accountant">Accountant</SelectItem>
              <SelectItem value="Customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={handleStatusFilter} defaultValue="All">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <StaffList staff={filteredStaff} onEdit={handleEditStaff} />
    </div>
  );
}
