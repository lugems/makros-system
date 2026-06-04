# Database Schema

This document outlines the database schema for the garage management system, which is built on Firestore.

## Collections

- `users`: Stores user information, including authentication details and roles.
- `customers`: Contains customer profiles, contact information, and linked vehicles.
- `vehicles`: A log of all customer vehicles, including make, model, year, and service history.
- `bookings`: Manages appointments, linking customers to specific services and time slots.
- `services`: A catalog of all offered services with descriptions and pricing.
- `jobCards`: Central to the system, these documents track the progress of a vehicle's repair, from diagnosis to completion.
- `jobTasks`: A sub-collection under `jobCards`, listing individual tasks for a job.
- `inventory`: Tracks stock levels of parts and supplies.
- `suppliers`: A list of all parts and equipment suppliers.
- `invoices`: Generated from `jobCards`, these documents detail the costs and are sent to customers.
- `payments`: Records all payments made against invoices.
- `notifications`: A log of all automated system notifications.
- `vehiclePhotos`: Stores images related to vehicle repairs.
- `auditLogs`: A record of all significant actions taken within the system.

## Sub-collections

- `customers/{customerId}/vehicles/{vehicleId}`: A customer's vehicles.
- `jobCards/{jobCardId}/tasks/{taskId}`: Individual tasks for a job card.
- `jobCards/{jobCardId}/partsUsed/{partId}`: Parts used in a job.
- `jobCards/{jobCardId}/photos/{photoId}`: Photos associated with a job card.
- `invoices/{invoiceId}/payments/{paymentId}`: Payments made on an invoice.
