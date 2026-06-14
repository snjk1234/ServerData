import os

file_path = r"g:\ServerData\nextjs\components\ConnectionModal.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update state variables to handle the new search logic
content = content.replace(
    "const [searchQuery, setSearchQuery] = useState('');",
    "const [branchSearchValue, setBranchSearchValue] = useState('');"
)

# 2. Update styling for Modal container (classic, compact)
content = content.replace(
    'className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"',
    'className="bg-white dark:bg-slate-800 rounded-sm shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"'
)

# 3. Update styling for Header
content = content.replace(
    'className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50"',
    'className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20 px-4 py-3 shrink-0"'
)

# 4. Update Header Title
content = content.replace(
    'className="text-lg font-black text-gray-800 dark:text-slate-100"',
    'className="text-sm font-extrabold text-gray-900 dark:text-slate-100"'
)

# 5. Update Close Button styling
content = content.replace(
    'className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"',
    'className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 cursor-pointer"'
)

# 6. Update Body padding
content = content.replace(
    'className="p-6 overflow-y-auto custom-scrollbar space-y-5"',
    'className="overflow-y-auto p-4 custom-scrollbar space-y-4"'
)

# 7. Replace the old branch selection UI with datalist
old_branch_ui = """          {/* Branch Selection for ADD Mode */}
          {mode === 'add' && (
            <div className="space-y-1.5 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/50 rounded-xl">
              <label className="text-sm font-bold text-indigo-800 dark:text-indigo-300">اختيار الفرع *</label>
              <div className="flex gap-2">
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">-- اختر الفرع --</option>
                  {filteredBranches.map(b => (
                    <option key={b.رقم_الفرع} value={b.رقم_الفرع}>
                      {b.رقم_الفرع} - {b.اسم_الفرع_ar}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative mt-2">
                <Search className="w-4 h-4 absolute right-3 top-2.5 text-indigo-400" />
                <input
                  type="text"
                  placeholder="بحث في الفروع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}"""

new_branch_ui = """          {/* Branch Selection for ADD Mode */}
          {mode === 'add' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5">اختيار أو بحث عن الفرع *</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute right-2.5 top-2 text-gray-400" />
                <input
                  list="branches-datalist"
                  value={branchSearchValue}
                  onChange={(e) => {
                    setBranchSearchValue(e.target.value);
                    const parts = e.target.value.split(' - ');
                    if (parts.length > 0) setSelectedBranchId(parts[0].trim());
                  }}
                  placeholder="ابحث بالاسم أو الرقم..."
                  className="w-full pr-8 pl-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <datalist id="branches-datalist">
                  {branches?.map(b => (
                    <option key={b.رقم_الفرع} value={`${b.رقم_الفرع} - ${b.اسم_الفرع_ar}`} />
                  ))}
                </datalist>
              </div>
            </div>
          )}"""
content = content.replace(old_branch_ui, new_branch_ui)

# 8. Update inputs styles to match classic edit modal
# Replace w-full px-3 py-2 bg-gray-50 ... rounded-lg text-sm focus:ring-2 ...
content = content.replace(
    'className={`w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-${themeColorClass}-500 outline-none`}',
    'className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"'
)

# Textareas
content = content.replace(
    'className={`w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-${themeColorClass}-500 outline-none resize-none`}',
    'className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"'
)

# Shared Packages specific classes
content = content.replace(
    'className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"',
    'className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"'
)

# Dates and Renewal specific classes
content = content.replace(
    'className={`w-full px-3 py-2 bg-${themeColorClass}-50 dark:bg-${themeColorClass}-900/10 border border-${themeColorClass}-200 dark:border-${themeColorClass}-900/50 rounded-lg text-sm focus:ring-2 focus:ring-${themeColorClass}-500 outline-none font-semibold text-${themeColorClass}-900 dark:text-${themeColorClass}-100`}',
    'className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-600 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"'
)

content = content.replace(
    'className="w-full px-3 py-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none font-bold text-red-700 dark:text-red-400"',
    'className="w-full px-2.5 py-1.5 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-red-500 font-bold"'
)

# Update Footer
content = content.replace(
    'className="p-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 flex justify-end gap-2"',
    'className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/20 px-4 py-3 shrink-0"'
)

content = content.replace(
    'className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"',
    'className="px-4 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-sm transition-colors text-xs cursor-pointer"'
)

content = content.replace(
    'className={`px-6 py-2 bg-${themeColorClass}-600 hover:bg-${themeColorClass}-700 text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-${themeColorClass}-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50`}',
    'className={`px-6 py-1.5 bg-${themeColorClass}-600 hover:bg-${themeColorClass}-700 text-white font-bold rounded-sm transition-colors flex items-center justify-center gap-1.5 text-xs shadow-sm cursor-pointer disabled:opacity-50`}'
)

# Shared Packages section box
content = content.replace(
    'className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-3"',
    'className="bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-sm border border-indigo-200 dark:border-indigo-900/50 space-y-3"'
)

# Fix labels
content = content.replace('className="text-xs font-bold text-gray-600 dark:text-slate-400"', 'className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1.5"')

# Remove filteredBranches logic
content = content.replace("""  const filteredBranches = mode === 'add' && branches 
    ? branches.filter(b => b.اسم_الفرع_ar?.includes(searchQuery) || String(b.رقم_الفرع).includes(searchQuery))
    : [];""", "")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
