# Chemistry Class Admin Panel

A modern, responsive admin dashboard for managing chemistry classes, students, and payments.

## Features

- **Dashboard**: Overview of key metrics and recent activities
- **Class Management**: Create, view, edit, and delete classes
- **Student Management**: Manage student profiles and enrollments
- **Payment Processing**: Verify and track student payments
- **Responsive Design**: Works on desktop and tablet devices
- **Modern UI**: Built with Material-UI for a clean, professional look

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Backend API (see backend setup)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chemistry_admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   # Add other environment variables as needed
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from create-react-app (use with caution)

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/          # Page components
  │   ├── classes/    # Class management pages
  │   ├── students/   # Student management pages
  │   └── payments/   # Payment management pages
  ├── services/       # API services
  ├── types/          # TypeScript type definitions
  ├── App.tsx         # Main App component
  └── index.tsx       # Entry point
```

## Connecting to Backend

This admin panel is designed to work with a RESTful API. Update the `baseURL` in `src/services/api.ts` to point to your backend API.

## Deployment

### Build for Production
```bash
npm run build
```

This will create a `build` directory with production-ready files that can be served by any static file server.

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please email support@chemistryclass.com or open an issue in the repository.
