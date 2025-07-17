import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, History, TrendingUp, Lightbulb } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  
  const tabs = [
    {
      name: 'Daily Log',
      path: '/',
      icon: Calendar,
      description: 'Track today'
    },
    {
      name: 'History',
      path: '/history',
      icon: History,
      description: 'Past logs'
    },
    {
      name: 'Trends',
      path: '/trends',
      icon: TrendingUp,
      description: 'Analytics'
    },
    {
      name: 'Insights',
      path: '/insights',
      icon: Lightbulb,
      description: 'Premium'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const IconComponent = tab.icon;
          
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-1 text-xs transition-colors ${
                isActive 
                  ? 'text-primary bg-primary/5' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <IconComponent 
                className={`w-5 h-5 mb-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} 
              />
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;