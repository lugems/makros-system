import React from 'react';
import { InventoryItem } from '../../types';
import { useMediaQuery } from '../../hooks/use-media-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card } from '../ui/card';
import { CurrencyFormat } from '../shared/currency-format';

interface InventoryListProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ items, onEdit }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4">Name</TableHead>
            <TableHead className="px-6 py-4">Quantity</TableHead>
            <TableHead className="px-6 py-4">Price</TableHead>
            <TableHead className="px-6 py-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.itemId} className="hover:bg-[#1E293B]">
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.name}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.quantity}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <CurrencyFormat value={item.price} />
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                <button onClick={() => onEdit(item)} className="text-yellow-500 hover:text-yellow-700">Edit</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.itemId} className="p-4 flex justify-between items-center bg-card border-border/50 rounded-2xl">
          <div>
            <div className="text-lg font-bold text-foreground">{item.name}</div>
            <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
            <div className="text-lg font-bold text-primary">
                <CurrencyFormat value={item.price} />
            </div>
          </div>
          <button onClick={() => onEdit(item)} className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-bold uppercase text-xs">Edit</button>
        </Card>
      ))}
    </div>
  );
};
