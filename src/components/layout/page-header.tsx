
import React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
      {children && <div className="mt-4 flex items-center md:mt-0">{children}</div>}
    </div>
  );
};

export default PageHeader;
