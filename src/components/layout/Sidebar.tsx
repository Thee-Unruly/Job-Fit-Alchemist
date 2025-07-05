
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  MessageCircle, 
  PieChart,
  User,
  Settings,
  Menu, 
  X
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />
    },
    {
      name: 'CV Analysis',
      path: '/cv-analysis',
      icon: <FileText size={20} />
    },
    {
      name: 'Job Match',
      path: '/job-match',
      icon: <BookOpen size={20} />
    },
    {
      name: 'Career Chat',
      path: '/career-chat',
      icon: <MessageCircle size={20} />
    },
    {
      name: 'Skills Map',
      path: '/skills-map',
      icon: <PieChart size={20} />
    },
    {
      name: 'Mock Interview',
      path: '/mock-interview',
      icon: <User size={20} />
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User size={20} />
    },
  ];

  return (
    <aside 
      className={cn(
        'bg-sidebar border-r border-border transition-all duration-300 h-screen',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">CareerSync AI</span>
          </Link>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="ml-auto">
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>
      
      <div className="py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center px-3 py-2 rounded-md transition-colors',
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                collapsed ? 'justify-center' : 'space-x-3'
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
