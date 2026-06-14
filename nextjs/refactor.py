import sys

def refactor_page():
    with open('g:/ServerData/nextjs/app/account/page.tsx', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # 1. Imports and arrays (lines 14 to 172) -> 13 to 171 in 0-indexed
    imports = """
import SidebarMenu, { categories, categoryThemes, renderCategoryIcon } from '@/components/SidebarMenu';
import BranchStatsCards from '@/components/BranchStatsCards';
import AccountTableControls from '@/components/AccountTableControls';
import UserManagementTable from '@/components/UserManagementTable';
"""

    sidebar = """          <SidebarMenu
            visibleCategories={visibleCategories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            categoryCounts={categoryCounts}
            userEmail={userEmail}
            isAdmin={isAdmin}
            onSignOut={handleSignOut}
          />\n"""

    stats = """              <BranchStatsCards
                data={data}
                totalServers={totalServers}
                activeServers={activeServers}
                activePercent={activePercent}
                openingSoonServers={openingSoonServers}
                openingPercent={openingPercent}
                closedTempServers={closedTempServers}
                closedPermServers={closedPermServers}
                categoryCountsData={categoryCountsData}
                isLoadingUsers={isLoadingUsers}
                adminUsers={adminUsers}
                setActiveCategory={setActiveCategory}
              />\n"""

    users = """              <UserManagementTable
                adminUsers={adminUsers}
                isLoadingUsers={isLoadingUsers}
                fetchAdminUsers={fetchAdminUsers}
                handleToggleCategory={handleToggleCategory}
                updateUserStatus={updateUserStatus}
                handleUserDeleteClick={handleUserDeleteClick}
                currentUser={currentUser}
              />\n"""

    controls = """                <AccountTableControls
                  stats={stats}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  search={search}
                  setSearch={setSearch}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  isAdmin={isAdmin}
                  isAllPasswordsRevealed={isAllPasswordsRevealed}
                  toggleAllPasswords={toggleAllPasswords}
                  exportToCSV={exportToCSV}
                />\n"""

    # Create new lines
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        if line.startswith("const categories = ["):
            # skip until `};\n` after `renderCategoryIcon`
            new_lines.append(imports)
            while i < len(lines) and not lines[i].startswith("export default function AccountServersTable() {"):
                i += 1
            continue
            
        if '<div className="w-full lg:w-64 shrink-0 bg-white dark:bg-slate-800 px-0 py-4 rounded-sm border' in line:
            # this is sidebar start
            new_lines.append(sidebar)
            while i < len(lines) and "القائمة الجانبية للتصنيفات" not in lines[i] and 'flex-1 min-w-0 w-full' not in lines[i+2]:
                i += 1
            # actually skip until the next block comment
            while i < len(lines) and 'flex-1 min-w-0 w-full' not in lines[i]:
                i += 1
            continue

        if '<div className="w-full md:max-w-[996px] space-y-4 animate-fade-in">' in line and 'أولاً: في حال تفعيل تبويب الإحصائيات' in lines[i-1]:
            new_lines.append(stats)
            while i < len(lines) and 'ثانياً: في حال تفعيل تبويب إدارة' not in lines[i]:
                i += 1
            continue

        if '<div className="w-full md:max-w-[996px] space-y-4 animate-fade-in">' in line and 'ثانياً: في حال تفعيل' in lines[i-1]:
            new_lines.append(users)
            while i < len(lines) and 'ثالثاً: شاشة جداول البيانات' not in lines[i]:
                i += 1
            continue
            
        if '<div className="w-full md:max-w-[996px] flex flex-row gap-2.5 mb-2">' in line and 'كروت تصفية الحالات السريعة' in lines[i-1]:
            new_lines.append(controls)
            while i < len(lines) and 'جدول فروع السيرفرات' not in lines[i]:
                i += 1
            continue

        new_lines.append(line)
        i += 1

    with open('g:/ServerData/nextjs/app/account/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

refactor_page()
