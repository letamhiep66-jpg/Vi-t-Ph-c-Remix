import React from 'react';
import { useApp } from '../../context/AppContext';
import { Compass, Sparkles, Award, SlidersHorizontal } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    {
      id: 'explore' as const,
      label: 'Khám phá',
      icon: Compass,
    },
    {
      id: 'mix' as const,
      label: 'Phối đồ',
      icon: Sparkles,
    },
    {
      id: 'critique' as const,
      label: 'Chấm điểm',
      icon: Award,
    },
    {
      id: 'settings' as const,
      label: 'Cài đặt',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <nav
      aria-label="Thanh điều hướng di động"
      className="block md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FBF8F3]/95 backdrop-blur-md border-t border-[#E9DFD1] px-4 py-2 shadow-lg safe-bottom"
    >
      <div className="grid grid-cols-4 items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-200 group cursor-pointer active:scale-95 ${
                isActive
                  ? 'text-[#800E13] opacity-100'
                  : 'text-[#6C584C] opacity-70 hover:opacity-100 hover:scale-105 hover:text-[#2C241D]'
              }`}
            >
              {/* Active top accent indicator */}
              {isActive && (
                <span className="absolute -top-2 w-8 h-0.5 bg-[#800E13] rounded-full shadow-xs animate-in fade-in zoom-in-75 duration-200" />
              )}

              <div
                className={`p-1 rounded-xl transition-all duration-200 transform ${
                  isActive
                    ? 'bg-[#800E13]/10 text-[#800E13] scale-105 shadow-xs'
                    : 'group-hover:bg-[#EFE7DC] group-hover:scale-110 text-[#6C584C]'
                }`}
              >
                <Icon className="w-5 h-5 transition-transform duration-200" />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 transition-all duration-200 ${
                  isActive
                    ? 'font-bold text-[#800E13]'
                    : 'font-medium text-[#6C584C] group-hover:text-[#2C241D]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
