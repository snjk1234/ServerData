'use client';

import React, { useRef, useState } from 'react';
import { LayoutGrid, Store, ShieldCheck, ShoppingBag, Layers, Sparkles, Footprints, Users, Monitor, BarChart2, Cpu, ChevronDown, ChevronUp } from 'lucide-react';

export const categories = [
  { id: 'all', name: 'الكل' },
  { id: 'فلورينا', name: 'فلورينا' },
  { id: 'فرنشايز', name: 'فرنشايز' },
  { id: 'جملة', name: 'جملة' },
  { id: 'موزع معتمد', name: 'موزع معتمد' },
  { id: 'اسكتشر', name: 'اسكتشر' },
  { id: 'فيلانتو', name: 'فيلانتو' },
  { id: 'الإدارة', name: 'الإدارة' },
  { id: 'كمبيوتر وملحقات', name: 'كمبيوتر وملحقات' },
  { id: 'بيانات الاتصال', name: 'بيانات الاتصال' }
];

export const categoryThemes: Record<string, {
  activeBg: string;
  badgeActive: string;
  badgeInactive: string;
  borderHover: string;
  textActive: string;
  iconBg: string;
  iconColor: string;
}> = {
  all: {
    activeBg: 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 dark:shadow-none',
    badgeActive: 'bg-indigo-700/50 text-indigo-100',
    badgeInactive: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    borderHover: 'hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
  'فلورينا': {
    activeBg: 'bg-sky-600 dark:bg-sky-500 text-white shadow-lg shadow-sky-500/20 dark:shadow-none',
    badgeActive: 'bg-sky-700/50 text-sky-100',
    badgeInactive: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
    borderHover: 'hover:border-sky-500 hover:bg-sky-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-100 dark:bg-sky-950/50',
    iconColor: 'text-sky-600 dark:text-sky-400'
  },
  'فرنشايز': {
    activeBg: 'bg-purple-600 dark:bg-purple-500 text-white shadow-lg shadow-purple-500/20 dark:shadow-none',
    badgeActive: 'bg-purple-700/50 text-purple-100',
    badgeInactive: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    borderHover: 'hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-950/50',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  'جملة': {
    activeBg: 'bg-amber-500 dark:bg-amber-500 text-white shadow-lg shadow-amber-500/20 dark:shadow-none',
    badgeActive: 'bg-amber-600/50 text-amber-100',
    badgeInactive: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    borderHover: 'hover:border-amber-500 hover:bg-amber-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  'موزع معتمد': {
    activeBg: 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 dark:shadow-none',
    badgeActive: 'bg-emerald-700/50 text-emerald-100',
    badgeInactive: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    borderHover: 'hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  'اسكتشر': {
    activeBg: 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 dark:shadow-none',
    badgeActive: 'bg-indigo-700/50 text-indigo-100',
    badgeInactive: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    borderHover: 'hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
  'فيلانتو': {
    activeBg: 'bg-rose-600 dark:bg-rose-500 text-white shadow-lg shadow-rose-500/20 dark:shadow-none',
    badgeActive: 'bg-rose-700/50 text-rose-100',
    badgeInactive: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    borderHover: 'hover:border-rose-500 hover:bg-rose-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-100 dark:bg-rose-950/50',
    iconColor: 'text-rose-600 dark:text-rose-400'
  },
  'الإدارة': {
    activeBg: 'bg-slate-800 dark:bg-slate-700 text-white shadow-lg shadow-slate-500/20 dark:shadow-none',
    badgeActive: 'bg-slate-900/50 text-slate-100',
    badgeInactive: 'bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-400',
    borderHover: 'hover:border-slate-500 hover:bg-slate-50/30 dark:hover:bg-slate-800/30',
    textActive: 'text-slate-850 dark:text-slate-300',
    iconBg: 'bg-slate-200 dark:bg-slate-800/50',
    iconColor: 'text-slate-750 dark:text-slate-400'
  },
  'كمبيوتر وملحقات': {
    activeBg: 'bg-cyan-600 dark:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 dark:shadow-none',
    badgeActive: 'bg-cyan-700/50 text-cyan-100',
    badgeInactive: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
    borderHover: 'hover:border-cyan-500 hover:bg-cyan-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-cyan-600 dark:text-cyan-400',
    iconBg: 'bg-cyan-100 dark:bg-cyan-950/50',
    iconColor: 'text-cyan-600 dark:text-cyan-400'
  },
  'بيانات الاتصال': {
    activeBg: 'bg-orange-600 dark:bg-orange-500 text-white shadow-lg shadow-orange-500/20 dark:shadow-none',
    badgeActive: 'bg-orange-700/50 text-orange-100',
    badgeInactive: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
    borderHover: 'hover:border-orange-500 hover:bg-orange-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-950/50',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  stats: {
    activeBg: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-550/25',
    badgeActive: 'bg-indigo-700/50 text-indigo-100',
    badgeInactive: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    borderHover: 'hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400'
  },
  users: {
    activeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-555/25',
    badgeActive: 'bg-emerald-700/50 text-emerald-100',
    badgeInactive: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    borderHover: 'hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  hardware: {
    activeBg: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-550/25',
    badgeActive: 'bg-blue-700/50 text-blue-100',
    badgeInactive: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    borderHover: 'hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-slate-700/30',
    textActive: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400'
  }
};

export const renderCategoryIcon = (id: string, className = "w-5 h-5") => {
  switch (id) {
    case 'all': return <LayoutGrid className={className} />;
    case 'فلورينا': return <ShoppingBag className={className} />;
    case 'فرنشايز': return <Store className={className} />;
    case 'جملة': return <Layers className={className} />;
    case 'موزع معتمد': return <ShieldCheck className={className} />;
    case 'اسكتشر': return <Footprints className={className} />;
    case 'فيلانتو': return <Sparkles className={className} />;
    case 'الإدارة': return <Users className={className} />;
    case 'كمبيوتر وملحقات': return <Monitor className={className} />;
    case 'stats': return <BarChart2 className={className} />;
    case 'users': return <Users className={className} />;
    case 'hardware': return <Cpu className={className} />;
    default: return <Store className={className} />;
  }
};

interface CategoryTabsProps {
  visibleCategories: any[];
  activeCategory: string | null;
  setActiveCategory: (cat: string) => void;
  getCounts: (catId: string) => number;
}

export default function CategoryTabs({ visibleCategories, activeCategory, setActiveCategory, getCounts }: CategoryTabsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  const handleSubCatClick = (id: string) => {
    setActiveCategory(id);
    setIsDropdownOpen(false);
  };

  const primaryCategories = visibleCategories.slice(0, 5);
  const secondaryCategories = visibleCategories.slice(5);

  return (
    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 justify-center lg:justify-start w-full relative z-30">
      {primaryCategories.map((cat) => {
        const isActive = activeCategory === cat.id;
        const theme = categoryThemes[cat.id] || categoryThemes.all;
        const count = getCounts(cat.id);

        return (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              group relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300
              ${isActive ? theme.activeBg : `bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 ${theme.borderHover} ${theme.textActive}`}
            `}
          >
            <div className={`
              p-1 rounded-lg transition-colors
              ${isActive ? 'bg-white/20 text-white' : `${theme.iconBg} ${theme.iconColor}`}
            `}>
              {renderCategoryIcon(cat.id, "w-4 h-4")}
            </div>
            
            <span>{cat.name}</span>
            
            <span className={`
              text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors
              ${isActive ? theme.badgeActive : theme.badgeInactive}
            `}>
              {count}
            </span>
          </button>
        );
      })}

      {secondaryCategories.length > 0 && (
        <div 
          className="relative group"
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
        >
          <button
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-300
              ${secondaryCategories.some((c: any) => c.id === activeCategory) 
                ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-lg' 
                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300'}
            `}
          >
            <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Layers className="w-4 h-4" />
            </div>
            <span>المزيد</span>
            {isDropdownOpen ? <ChevronUp className="w-4 h-4 opacity-50" /> : <ChevronDown className="w-4 h-4 opacity-50" />}
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-2 z-50 animate-fade-in origin-top">
              {secondaryCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                const theme = categoryThemes[cat.id] || categoryThemes.all;
                const count = getCounts(cat.id);

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSubCatClick(cat.id)}
                    className={`
                      w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-right
                      ${isActive ? 'bg-slate-50 dark:bg-slate-700/50 font-bold' : 'hover:bg-gray-50 dark:hover:bg-slate-700/30'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${theme.iconBg} ${theme.iconColor}`}>
                        {renderCategoryIcon(cat.id, "w-4 h-4")}
                      </div>
                      <span className={isActive ? theme.textActive : 'text-gray-700 dark:text-gray-300'}>
                        {cat.name}
                      </span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${theme.badgeInactive}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
