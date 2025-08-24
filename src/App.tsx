import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Reservations from './pages/Reservations';
import Calendar from './pages/Calendar';
import Customers from './pages/Customers';
import Staff from './pages/Staff';
import Courses from './pages/Courses';
import Settings from './pages/Settings';
import ReservationForm from './pages/ReservationForm';

const App = () => {
  const router = createBrowserRouter([
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'reservations', element: <Reservations /> },
        { path: 'reservations/new', element: <ReservationForm /> },
        { path: 'reservations/:id', element: <ReservationForm /> },
        { path: 'calendar', element: <Calendar /> },
        { path: 'customers', element: <Customers /> },
        { path: 'staff', element: <Staff /> },
        { path: 'courses', element: <Courses /> },
        { path: 'settings', element: <Settings /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;