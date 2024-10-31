# Patient Management System

This is a Node.js + TypeScript project designed to manage patient information
with AWS Cognito for authentication and JWT verification.

## Project Structure

- **`src/`**: Contains the source code for the application.
- **`middleware/`**: Middleware for authentication and token verification.
- **`modules/`**: Main modules of the project, handling business logic.
- **`example.env`**: Example environment file to set up required environment
  variables.

## Prerequisites

Ensure you have the following installed on your machine:

- Node.js (v20.x or above)
- TypeScript (globally installed)
- AWS Account (Cognito set up with user pool, Opensearch)
- AWS DynamoDB
- AWS IAM user with necessary permissions

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/MilanNimavat/patient-management.git
   cd patient-management
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Variables**:

   ```bash
   cp example.env .env
   ```

## Scripts

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Run the project in development**:

   ```bash
   npm run dev
   ```

3. **Run the project in production**:

   ```bash
   npm run start
   ```
