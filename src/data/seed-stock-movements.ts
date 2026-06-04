export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'In' | 'Out';
  quantityChange: number;
  date: string;
}

export const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'm1',
    itemId: 'item-001',
    itemName: 'Engine Oil 5W-30',
    type: 'In',
    quantityChange: 20,
    date: '2024-03-15T10:00:00Z',
  },
  {
    id: 'm2',
    itemId: 'item-001',
    itemName: 'Engine Oil 5W-30',
    type: 'Out',
    quantityChange: -2,
    date: '2024-03-20T14:30:00Z',
  },
  {
    id: 'm3',
    itemId: 'item-002',
    itemName: 'Brake Pads (Front)',
    type: 'In',
    quantityChange: 10,
    date: '2024-03-21T09:00:00Z',
  },
  {
    id: 'm4',
    itemId: 'item-003',
    itemName: 'Air Filter',
    type: 'Out',
    quantityChange: -1,
    date: '2024-03-22T11:00:00Z',
  }
];
