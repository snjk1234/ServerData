'use client';

import React, { useRef, useState } from 'react';
import { LayoutGrid, Store, ShieldCheck, ShoppingBag, Layers, Sparkles, Footprints, Users, Monitor, BarChart2, Cpu, LogOut } from 'lucide-react';

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

interface SidebarMenuProps {
  visibleCategories: any[];
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  categoryCounts: Record<string, number>;
  userEmail: string;
  isAdmin: boolean;
  onSignOut: () => void;
}

export default function SidebarMenu({
  visibleCategories,
  activeCategory,
  setActiveCategory,
  categoryCounts,
  userEmail,
  isAdmin,
  onSignOut
}: SidebarMenuProps) {
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

  const subCategoriesList = ['فلورينا', 'فرنشايز', 'جملة', 'موزع معتمد', 'اسكتشر', 'فيلانتو', 'الإدارة'];

  const renderButton = (c: any, isSub: boolean = false, onClickOverride: any = null) => {
    const isCActive = activeCategory === (c.id === 'all' ? null : c.id);
    const cTheme = categoryThemes[c.id] || categoryThemes.all;
    const cCount = categoryCounts[c.id] || 0;
    
    return (
      <button
        onClick={onClickOverride ? onClickOverride : () => setActiveCategory(c.id === 'all' ? null : c.id)}
        className={`group flex items-center justify-between gap-2.5 px-3 py-1.5 border-b text-base font-bold transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 lg:w-full active:scale-[0.99] ${
          isCActive
            ? cTheme.activeBg + ' text-white border-transparent shadow-inner'
            : 'border-gray-100 dark:border-slate-700/50 text-gray-700 dark:text-slate-200 bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800/80'
        } ${isSub ? 'border-none hover:bg-gray-100 dark:hover:bg-slate-700' : ''}`}
      >
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-sm transition-transform duration-300 group-hover:scale-105 ${isCActive ? 'bg-white/20 text-white' : cTheme.iconBg + ' ' + cTheme.iconColor}`}>
            {renderCategoryIcon(c.id, "w-4 h-4")}
          </span>
          <span className="transition-transform duration-300 group-hover:translate-x-[-3px]">
            {c.name}
          </span>
        </div>

        {c.id !== 'stats' && c.id !== 'users' && c.id !== 'audit' ? (
          <span className={`text-xs font-black px-2 py-0.5 rounded-sm transition-transform duration-300 group-hover:scale-105 ${isCActive ? cTheme.badgeActive : cTheme.badgeInactive}`}>
            {cCount}
          </span>
        ) : (
          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm transition-transform duration-300 group-hover:scale-105 ${isCActive ? 'bg-white/20 text-white' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
            إدارة
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-full lg:w-64 shrink-0 bg-white dark:bg-slate-800 px-0 py-4 rounded-sm border border-gray-200 dark:border-slate-700 lg:sticky lg:top-4 lg:h-[calc(100vh-80px)] flex flex-col justify-between shadow-sm overflow-visible z-[100] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div>
        <h2 className="hidden lg:flex text-sm font-bold text-gray-800 dark:text-slate-200 mb-2 pb-2 border-b border-gray-200 dark:border-slate-700 items-center gap-1.5 px-4">
          <Layers className="w-4 h-4 text-indigo-650 dark:text-indigo-450" />
          القائمة والأقسام
        </h2>

        <div className="flex flex-row overflow-visible lg:flex-col gap-0 pb-0 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {visibleCategories.map((cat) => {
            if (subCategoriesList.includes(cat.id)) return null;

            if (cat.id === 'all') {
              const dropdownCats = visibleCategories.filter(c => subCategoriesList.includes(c.id));
              return (
                <div 
                  key={cat.id} 
                  className="relative shrink-0 z-[110]"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  {renderButton(cat)}
                  {dropdownCats.length > 0 && (
                    <div className={`absolute top-full right-0 lg:top-0 lg:right-full lg:mr-2 w-56 transition-all duration-300 ${isDropdownOpen ? 'visible opacity-100 translate-y-0 lg:translate-x-0 pointer-events-auto' : 'invisible opacity-0 translate-y-2 lg:translate-y-0 lg:translate-x-2 pointer-events-none'}`}>
                      <div className="bg-white dark:bg-slate-800 rounded-md shadow-xl border border-gray-200 dark:border-slate-700 py-1 flex flex-col gap-0">
                        {dropdownCats.map(subCat => (
                          <div key={subCat.id} className="shrink-0 w-full">
                            {renderButton(subCat, true, () => handleSubCatClick(subCat.id))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={cat.id} className="shrink-0">
                {renderButton(cat)}
              </div>
            );
          })}
        </div>
      </div>

      {/* الجزء السفلي من القائمة - المستخدم وتسجيل الخروج */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700/60 flex flex-col gap-2.5 px-2.5">
        <div className="flex items-center gap-2.5 px-1 py-0.5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm shrink-0 shadow-inner">
            {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-extrabold text-gray-800 dark:text-slate-200 truncate flex items-center gap-1">
              {userEmail ? userEmail.split('@')[0] : 'مستخدم سيرفر'}
              {isAdmin && <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 px-1 rounded-sm text-[8px] font-extrabold">مدير</span>}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
              {userEmail || 'user@server.com'}
            </span>
          </div>
        </div>
        
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-450 text-xs font-bold rounded-sm transition-colors border border-red-100 dark:border-red-900/30 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}
