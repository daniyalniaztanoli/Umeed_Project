import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {
  FiHome,
  FiAlertCircle,
  FiHeart,
  FiDollarSign,
  FiDroplet,
  FiCalendar,
  FiUsers,
  FiUserCheck,
  FiGrid,
  FiFileText,
  FiBell,
  FiMessageSquare,
  FiBook,
  FiLogOut,
} from 'react-icons/fi';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';

const STORAGE_KEY = 'umeed_sidebar_groups';

const groupsConfig = [
  {
    title: null,
    items: [{ label: 'Dashboard', icon: FiHome, path: '/dashboard' }],
  },
  {
    title: 'CORE',
    items: [
      { label: 'Complaints', icon: FiAlertCircle, path: '/complaints', badgeKey: 'complaints' },
      { label: 'Welfare', icon: FiHeart, path: '/welfare', badgeKey: 'welfare' },
      { label: 'Donations', icon: FiDollarSign, path: '/donations', badgeKey: 'donations' },
    ],
  },
  {
    title: 'COMMUNITY',
    items: [
      { label: 'Blood Donors', icon: FiDroplet, path: '/blood-donors' },
      { label: 'Events', icon: FiCalendar, path: '/events' },
      { label: 'Volunteers', icon: FiUserCheck, path: '/volunteers' },
      { label: 'Impact Stories', icon: FiHeart, path: '/impact-stories' },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      { label: 'Announcements', icon: FiBell, path: '/announcements' },
      { label: 'Notifications', icon: FiBell, path: '/notifications' },
      { label: 'Feedback', icon: FiMessageSquare, path: '/feedback' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { label: 'Users', icon: FiUsers, path: '/users' },
      { label: 'Staff', icon: FiUserCheck, path: '/staff' },
      { label: 'Departments', icon: FiGrid, path: '/departments' },
      { label: 'Resources', icon: FiBook, path: '/resources' },
    ],
  },
  {
    title: null,
    items: [{ label: 'Reports', icon: FiFileText, path: '/reports' }],
  },
];

const SidebarItem = ({ item, isActive, badge }) => (
  <li>
    <NavLink
      to={item.path}
      aria-current={isActive ? 'page' : undefined}
      className={({ isActive: navActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 ${
          navActive || isActive
            ? 'bg-white text-primary font-semibold shadow-md'
            : 'hover:bg-white/10'
        }`
      }
    >
      <item.icon size={18} />
      <span className="flex-1">{item.label}</span>
      {badge > 0 && (
        <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </NavLink>
  </li>
);

const SidebarGroup = ({ group, collapsed, onToggle, badges, isActivePath }) => {
  if (!group.title) {
    return (
      <ul className="space-y-1">
        {group.items.map((item) => (
          <SidebarItem
            key={item.path}
            item={item}
            isActive={isActivePath(item.path)}
            badge={item.badgeKey ? badges[item.badgeKey] || 0 : 0}
          />
        ))}
      </ul>
    );
  }
  const isCollapsed = collapsed[group.title];
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => onToggle(group.title)}
        className="w-full text-left text-[10px] uppercase tracking-widest text-white/60 font-bold px-4 mb-1.5 hover:text-white/80 transition-colors"
        aria-expanded={!isCollapsed}
      >
        {group.title}
      </button>
      {!isCollapsed && (
        <ul className="space-y-1">
          {group.items.map((item) => (
            <SidebarItem
              key={item.path}
              item={item}
              isActive={isActivePath(item.path)}
              badge={item.badgeKey ? badges[item.badgeKey] || 0 : 0}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useContext(AuthContext);
  const location = useLocation();
  const [badges, setBadges] = useState({ complaints: 0, welfare: 0, donations: 0 });
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  });

  const isActivePath = useCallback(
    (path) => location.pathname === path || location.pathname.startsWith(path + '/'),
    [location.pathname]
  );

  const fetchCounts = useCallback(async () => {
    try {
      const res = await api.get('/admin/pending-counts');
      setBadges(res.data || {});
    } catch {
      // endpoint may not exist yet
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    const id = setInterval(fetchCounts, 60000);
    return () => clearInterval(id);
  }, [fetchCounts]);

  const toggleGroup = (title) => {
    setCollapsed((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-gradient-to-b from-primary to-teal-700 text-white
          flex flex-col shadow-xl
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              🌱
            </div>
            <div>
              <h1 className="text-xl font-bold">Umeed</h1>
              <p className="text-xs text-white/70">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {groupsConfig.map((group, idx) => (
            <SidebarGroup
              key={idx}
              group={group}
              collapsed={collapsed}
              onToggle={toggleGroup}
              badges={badges}
              isActivePath={isActivePath}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-all"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
