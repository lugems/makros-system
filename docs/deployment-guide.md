# Deployment Guide

This guide provides instructions for deploying the garage management system.

## Prerequisites

- A Firebase project
- Node.js and npm installed

## Deployment Steps

1.  **Configure Firebase**: Set up a new Firebase project and enable Firestore and Firebase Authentication.
2.  **Set Environment Variables**: Create a `.env.local` file in the root of the project and add your Firebase project configuration.
3.  **Install Dependencies**: Run `npm install` to install the project dependencies.
4.  **Build the Project**: Run `npm run build` to create a production build of the application.
5.  **Deploy to Firebase**: Deploy the application to Firebase Hosting using the Firebase CLI.
