# Join - Task Management System

Join is a sophisticated task management application built with Angular, featuring Kanban-style organization and real-time collaboration capabilities. This project utilizes Firebase for authentication and data storage.

## Features

- **User Authentication**
  - Email/Password login
  - Guest access
  - User registration
  - Secure authentication via Firebase

- **Task Management**
  - Kanban board with drag-and-drop functionality
  - Task creation and editing
  - Status tracking (Todo, In Progress, Await Feedback, Done)
  - Task categorization and priority levels
  - Real-time updates

- **Contact Management**
  - User contact list
  - Contact details management
  - Task assignment to contacts

- **Responsive Design**
  - Mobile-friendly interface
  - Adaptive layouts for all screen sizes
  - Modern Material Design

## Technical Requirements

- Node.js (v18 or higher)
- Angular CLI (v19.2.4)
- Firebase account and project

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Join-Angular
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication and Firestore
   - Add your Firebase configuration to the environment files

4. **Development Server**
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/`

5. **Build for Production**
   ```bash
   ng build
   ```

## Project Structure

```
src/
├── app/
│   ├── components/     # Application components
│   ├── services/       # Service classes
│   ├── models/         # Data models
│   ├── shared/         # Shared components and utilities
│   └── main-content/   # Main layout components
├── assets/            # Static assets
└── environments/      # Environment configurations
```

## Technology Stack

- Angular 19
- Firebase (Authentication & Firestore)
- Angular Material
- RxJS
- TypeScript

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Angular team for the excellent framework
- Firebase for backend services
- Material Design team for UI components
