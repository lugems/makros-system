import React from 'react';
import { Sidebar } from './components/layout/sidebar';
import { Dashboard } from './components/dashboard/dashboard';
import { CustomersPage } from './components/customers/customers-page';
import { JobCardsPage } from './components/job-cards/job-cards-page';
import InvoicesPage from './components/invoices/invoices-page';
import { InventoryPage } from './components/inventory/inventory-page';
import { Header } from './components/layout/header';

const App: React.FC = () => {
  const [activePage, setActivePage] = React.useState('Dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Customers':
        return <CustomersPage />;
      case 'Job Cards':
        return <JobCardsPage />;
      case 'Invoices':
        return <InvoicesPage />;
      case 'Inventory':
        return <InventoryPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={activePage} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;