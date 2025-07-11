
import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const BottomNavigation = () => {
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/feed", icon: Search, label: "Browse" },
    { path: "/sell", icon: Plus, label: "Sell" },
    { path: "/messages", icon: MessageCircle, label: "Messages" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center p-2 text-xs ${
                isActive ? "text-purple-600" : "text-gray-600"
              }`
            }
          >
            <item.icon className="w-6 h-6 mb-1" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
