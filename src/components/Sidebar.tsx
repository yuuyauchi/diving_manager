import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const navLinks = [
    { path: '/reservations', name: '予約一覧' },
    { path: '/calendar', name: '予約カレンダー' },
    { path: '/customers', name: '顧客管理' },
    { path: '/staff', name: 'スタッフ管理' },
    { path: '/courses', name: 'コース管理' },
    { path: '/settings', name: '設定' },
  ];

  return (
    <nav className="w-64 bg-gray-900 text-white p-4 space-y-2">
      {navLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `block py-2 px-4 rounded transition duration-200 ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`
          }
        >
          {link.name}
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;
