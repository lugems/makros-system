import React from 'react';
import { JobCard } from '../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface JobCardListProps {
  jobCards: JobCard[];
  onView: (jobCard: JobCard) => void;
  onEdit: (jobCard: JobCard) => void;
}

export const JobCardList: React.FC<JobCardListProps> = ({ jobCards, onView, onEdit }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-6 py-4">Job ID</TableHead>
          <TableHead className="px-6 py-4">Customer</TableHead>
          <TableHead className="px-6 py-4">Total Cost</TableHead>
          <TableHead className="px-6 py-4">Status</TableHead>
          <TableHead className="px-6 py-4 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobCards.map((jobCard) => (
          <TableRow key={jobCard.jobId} className="hover:bg-[#1E293B]">
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{jobCard.jobId}</TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{jobCard.customer.name}</TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${jobCard.totalCost.toFixed(2)}</TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${ 
                  jobCard.status === 'Completed' ? 'bg-green-600 text-white' : 
                  jobCard.status === 'In Progress' ? 'bg-yellow-600 text-black' : 'bg-gray-600 text-white'
                }`}>
                {jobCard.status}
              </span>
            </TableCell>
            <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
              <button onClick={() => onView(jobCard)} className="text-blue-500 hover:text-blue-700 mr-4">View</button>
              <button onClick={() => onEdit(jobCard)} className="text-yellow-500 hover:text-yellow-700">Edit</button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
