import React from 'react';
import { JobCard, JobCardStatus } from '../../types/job-card';
import { useMediaQuery } from '../../hooks/use-media-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card } from '../ui/card';

interface JobCardListProps {
  jobCards: JobCard[];
  onEdit: (jobCard: JobCard) => void;
  onView: (jobCard: JobCard) => void;
}

const getStatusColor = (status: JobCardStatus) => {
  switch (status) {
    case 'Pending':
      return 'text-yellow-400';
    case 'In Progress':
      return 'text-blue-400';
    case 'Completed':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
};

export const JobCardList: React.FC<JobCardListProps> = ({ jobCards, onEdit, onView }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4">Customer</TableHead>
            <TableHead className="px-6 py-4">Vehicle</TableHead>
            <TableHead className="px-6 py-4">Status</TableHead>
            <TableHead className="px-6 py-4">Total</TableHead>
            <TableHead className="px-6 py-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobCards.map((jobCard) => (
            <TableRow key={jobCard.jobCardId} className="hover:bg-[#1E293B]">
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{jobCard.customerId}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{jobCard.vehicleId}</TableCell>
              <TableCell className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getStatusColor(jobCard.status)}`}>
                {jobCard.status}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${jobCard.laborCost.toFixed(2)}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                <button onClick={() => onView(jobCard)} className="text-blue-500 hover:text-blue-700 mr-4">View</button>
                <button onClick={() => onEdit(jobCard)} className="text-yellow-500 hover:text-yellow-700">Edit</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-4">
      {jobCards.map((jobCard) => (
        <Card key={jobCard.jobCardId} className="p-4">
          <div onClick={() => onView(jobCard)}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-bold text-white">{jobCard.customerId}</div>
                <div className="text-sm text-gray-400">{jobCard.vehicleId}</div>
              </div>
              <div className={`text-sm font-bold ${getStatusColor(jobCard.status)}`}>{jobCard.status}</div>
            </div>
            <div className="mt-2 text-lg font-bold text-white">${jobCard.laborCost.toFixed(2)}</div>
          </div>
          <div className="mt-4">
            <button onClick={() => onEdit(jobCard)} className="w-full text-center py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">Edit</button>
          </div>
        </Card>
      ))}
    </div>
  );
};
