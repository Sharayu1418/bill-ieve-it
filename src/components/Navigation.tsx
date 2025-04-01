import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UsersIcon, StarIcon } from 'lucide-react';
import { auth } from '../lib/firebase';

const Navigation = () => {
  const [user] = React.useState(auth.currentUser);
  const linkClass = "flex items-center space-x-2 hover:text-blue-200 transition-colors";
  const activeLinkClass = "text-blue-200";

  return (
    <nav>
      <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeLinkClass : ''}`
            }
          >
            <HomeIcon className="h-5 w-5" />
            <span>Browse Bills</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/members"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeLinkClass : ''}`
            }
          >
            <UsersIcon className="h-5 w-5" />
            <span>Members</span>
          </NavLink>
        </li>
        {user && (
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeLinkClass : ''}`
              }
            >
              <StarIcon className="h-5 w-5" />
              <span>My Dashboard</span>
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;