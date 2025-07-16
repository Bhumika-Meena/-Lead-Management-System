# Lead Management System - Frontend

A modern, responsive React frontend for the Lead Management System (LMS) built with Material-UI.

## 🚀 Features

- **Modern UI/UX**: Beautiful, responsive design with Material-UI components
- **Authentication**: Secure login/logout with JWT tokens
- **Role-based Access**: Different views for Admin and Sales users
- **Dashboard**: Overview with statistics and recent activities
- **Lead Management**: Complete CRUD operations for leads
- **Real-time Updates**: Live data synchronization with backend
- **Mobile Responsive**: Works perfectly on all devices

## 🛠️ Tech Stack

- **React 18**: Modern React with hooks
- **Material-UI (MUI)**: Beautiful UI components
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Notistack**: Toast notifications
- **Context API**: State management

## 📦 Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd lms-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Backend API URL
The frontend is configured to connect to the backend API at `http://localhost:3000/api`. If your backend runs on a different port, update the `API_BASE_URL` in `src/services/api.js`.

### Environment Variables
Create a `.env` file in the root directory for environment-specific configurations:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

## 📱 Features Overview

### Authentication
- Secure login with email/password
- JWT token-based authentication
- Automatic token refresh
- Protected routes

### Dashboard
- **Statistics Cards**: Total leads, new leads, qualified, converted
- **Recent Leads**: Quick access to latest leads
- **Quick Actions**: Fast navigation to main features

### Lead Management
- **Lead List**: View all leads with filters and search
- **Lead Details**: Complete lead information
- **Create/Edit**: Add new leads or update existing ones
- **Status Management**: Update lead status (New, Contacted, Qualified, etc.)
- **Assignment**: Assign leads to sales representatives (Admin only)

### User Management (Admin Only)
- View all users
- Create new users
- Assign roles (Admin/Sales)
- Manage user permissions

## 🎨 UI Components

### Layout
- **Responsive Sidebar**: Navigation drawer with role-based menu items
- **Top App Bar**: User profile and quick actions
- **Mobile Support**: Collapsible sidebar for mobile devices

### Forms
- **Lead Form**: Create and edit leads with validation
- **Login Form**: Secure authentication
- **User Form**: User management (Admin only)

### Data Display
- **Data Tables**: Sortable and filterable lead lists
- **Status Chips**: Color-coded status indicators
- **Statistics Cards**: Dashboard metrics
- **Activity Timeline**: Lead activity history

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-based Access Control**: Different permissions for Admin/Sales
- **Protected Routes**: Automatic redirect to login
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Graceful error messages

## 📊 API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Leads
- `GET /api/leads` - Get all leads (with filters)
- `GET /api/leads/:id` - Get specific lead
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `PUT /api/leads/:id/assign` - Assign lead (Admin only)

### Activities
- `GET /api/leads/:id/activities` - Get lead activities
- `POST /api/leads/:id/activities` - Add activity

### Users (Admin Only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify/Vercel
1. Build the project: `npm run build`
2. Upload the `build` folder to your hosting platform
3. Configure environment variables in your hosting platform

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📝 Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🔄 Updates

To update dependencies:
```bash
npm update
npm audit fix
```

---

**Happy Coding! 🎉**
