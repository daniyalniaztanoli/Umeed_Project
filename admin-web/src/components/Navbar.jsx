import { useContext } from 'react';
import { FiMenu, FiUser } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <FiMenu size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
            <FiUser size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;