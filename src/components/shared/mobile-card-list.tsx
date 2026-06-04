
import React from 'react';

interface MobileCardListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

const MobileCardList = <T extends object>({ items, renderItem, keyExtractor }: MobileCardListProps<T>) => {
  if (items.length === 0) {
    return <p className="text-center text-gray-500">No items found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map(item => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};

export default MobileCardList;
