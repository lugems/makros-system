
import {
  Users,
  Car,
  ClipboardList,
  CheckCircle,
  Clock,
  ShoppingCart,
  FileText,
  DollarSign,
} from "lucide-react";

export const summaryData = [
  {
    title: "Total Customers",
    value: "1,250",
    icon: Users,
  },
  {
    title: "Vehicles Received Today",
    value: "25",
    icon: Car,
  },
  {
    title: "Active Job Cards",
    value: "50",
    icon: ClipboardList,
  },
  {
    title: "Completed Jobs",
    value: "1,500",
    icon: CheckCircle,
  },
  {
    title: "Pending Approvals",
    value: "15",
    icon: Clock,
  },
  {
    title: "Waiting for Parts",
    value: "10",
    icon: ShoppingCart,
  },
  {
    title: "Pending Invoices",
    value: "30",
    icon: FileText,
  },
  {
    title: "Payments Received Today",
    value: "$5,000",
    icon: DollarSign,
  },
];

export const lowStockData = [
  {
    name: "Brake Pads",
    stock: 5,
  },
  {
    name: "Oil Filter",
    stock: 3,
  },
  {
    name: "Air Filter",
    stock: 2,
  },
  {
    name: "Spark Plugs",
    stock: 8,
  },
];

export const availableMechanics = [
  {
    name: "John Doe",
    specialty: "Engine Repair",
  },
  {
    name: "Jane Smith",
    specialty: "Transmission",
  },
  {
    name: "Peter Jones",
    specialty: "Brakes",
  },
  {
    name: "Mary Johnson",
    specialty: "Electrical",
  },
];

export const recentBookings = [
  {
    id: "BK-001",
    customer: "John Doe",
    vehicle: "Toyota Camry",
    date: "2024-07-28",
  },
  {
    id: "BK-002",
    customer: "Jane Smith",
    vehicle: "Honda Accord",
    date: "2024-07-28",
  },
];

export const recentJobCards = [
  {
    id: "JC-001",
    customer: "Peter Jones",
    vehicle: "Ford Focus",
    status: "In Progress",
  },
  {
    id: "JC-002",
    customer: "Mary Johnson",
    vehicle: "Chevrolet Malibu",
    status: "Completed",
  },
];

export const monthlyRevenueData = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      label: "Revenue",
      data: [
        5000,
        6000,
        7500,
        8000,
        9000,
        10000,
        12000,
        11000,
        10500,
        9500,
        8500,
        7000,
      ],
      backgroundColor: "rgba(75, 192, 192, 0.2)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    },
  ],
};
