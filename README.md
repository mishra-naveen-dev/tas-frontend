# Traveling Allowance System Frontend

Modern React frontend for the Traveling Allowance System - a comprehensive field officer management application with attendance tracking, allowance management, and CRM capabilities.

**Built with:** React 18 + Material-UI + JavaScript (ES2020)

## Project Structure

```
src/
├── pages/
│   ├── admin/              # Admin pages (AdminDashboard, PendingApprovals, etc.)
│   ├── employee/           # Employee pages (EmployeeDashboard, PunchHistory, etc.)
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   └── PunchRecords.jsx
├── components/             # Reusable UI components
│   ├── AppLayout.jsx       # Main layout with sidebar navigation
│   ├── ProtectedRoute.jsx  # Role-based route protection
│   └── HelloWorld.jsx
├── contexts/               # React Context for state management
│   └── AuthContext.jsx     # Authentication and user state
├── services/               # API service
│   └── api.js              # Axios API client with token refresh
├── App.jsx                 # Main app routing and theme
└── index.jsx               # React app entry point
public/
└── index.html              # HTML entry point
```

## Features

✅ **Role-Based Access Control**: Admin, Employee, and Public routes  
✅ **User Authentication**: JWT token-based with automatic refresh  
✅ **Admin Dashboard**: Statistics, pending approvals, employee tracking  
✅ **Employee Dashboard**: Punch status, distance tracking, allowance management  
✅ **Allowance Management**: Create, track, and approve travel allowances  
✅ **Attendance System**: Punch in/out with geolocation  
✅ **CRM Integration**: Loan visit tracking and management  
✅ **Material-UI Responsive Design**: Works seamlessly on mobile and desktop  

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Backend API running on `http://localhost:8000`

### Installation

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   The app opens at `http://localhost:3000`

3. **Build for Production**
   ```bash
   npm run build
   ```

## Configuration

### API Base URL
The API communicates with the backend at `http://localhost:8000` by default.  
To change, update the `API_BASE_URL` in `src/services/api.js`

### Environment Variables
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

## JavaScript React Setup

This project uses **JavaScript (JSX)** instead of TypeScript for simpler development without type annotations. 

- **Module Resolution**: Configured in `jsconfig.json`
- **No Build Step**: React Scripts handles compilation
- **Full ES2020 Support**: Modern JavaScript features available

See [CONVERSION_SUMMARY.md](./CONVERSION_SUMMARY.md) for details on TypeScript → JavaScript conversion.

## Available Scripts

```bash
npm start          # Start development server (port 3000)
npm run build      # Create production build
npm test           # Run tests
npm run eject      # Eject from Create React App (not recommended)
```

## Key Technologies

| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **React Router v6** | Routing and navigation |
| **Material-UI v5** | Component library + theming |
| **Axios** | HTTP client for API calls |
| **date-fns** | Date manipulation |

## API Integration

All API calls go through `src/services/api.js` singleton:

```javascript
import api from '../services/api';

// Authentication
await api.login(username, password);
await api.logout();

// Organization
await api.getUsers();
await api.getCurrentUser();

// Attendance
await api.getPunchRecords();
await api.getDailySummary();

// Allowance
await api.getAllowanceRequests();
await api.approveAllowanceRequest(id);
```

## Routing Structure

```
/login                          # Public login page
/dashboard                      # Redirects to role-based dashboard

/employee/dashboard             # Employee home
/employee/punch-history         # View punch records
/employee/create-allowance      # Request allowance
/employee/allowance-history     # View allowance requests

/admin/dashboard                # Admin home with statistics
/admin/pending-approvals        # Review & approve allowances
/admin/employee-tracking        # Monitor employee data
/admin/crm-visits               # Loan visit records
```

## Development Workflow

1. **Component Development**: Create reusable components in `src/components/`
2. **Page Creation**: Build feature pages in `src/pages/`
3. **API Integration**: Use `api.js` service for backend calls
4. **State Management**: Use React Context for shared state
5. **Styling**: Material-UI components with `sx` prop for styling

## Troubleshooting

### "Cannot find module" errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Backend connection issues
- Verify backend is running on `http://localhost:8000`
- Check CORS settings in backend
- Ensure API proxy in `package.json` matches backend URL

### "Module not found" for .jsx files
- Ensure you're importing with `.jsx` extension or using default exports
- React Scripts should auto-resolve JSX files

## Contributing

1. Create a feature branch: `git checkout -b feature/new-feature`
2. Make changes and test thoroughly
3. Submit a pull request with description

## License

This project is part of the Traveling Allowance System suite.

## Support

For issues or questions:
- Check the API backend logs
- Review browser DevTools console
- Refer to Material-UI documentation: https://mui.com/
- React documentation: https://react.dev