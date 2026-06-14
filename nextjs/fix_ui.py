import re

def fix_page_tsx():
    with open('g:/ServerData/nextjs/app/account/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Pass copyToClipboard to AccountMainTable
    # First check if copyToClipboard is already there, it should be passed down.
    if "copyToClipboard={copyToClipboard}" not in content:
        content = content.replace("handleDeleteClick={handleDeleteClick}", "handleDeleteClick={handleDeleteClick}\n              copyToClipboard={copyToClipboard}")

    # 2. Add useEffect for fetchAdminUsers
    use_effect_code = """
  useEffect(() => {
    if ((activeCategory === 'users' || activeCategory === 'stats') && isAdmin) {
      fetchAdminUsers();
    }
  }, [activeCategory, isAdmin, fetchAdminUsers]);
"""
    if "fetchAdminUsers();" not in content:
        # Find where to inject it. Before `const handleEditClick` is fine.
        content = content.replace("  const handleEditClick = (item: any) => {", use_effect_code + "\n  const handleEditClick = (item: any) => {")

    with open('g:/ServerData/nextjs/app/account/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

def fix_account_table():
    with open('g:/ServerData/nextjs/components/AccountMainTable.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Add copyToClipboard to props
    if "copyToClipboard:" not in content:
        content = content.replace("isAdmin: boolean;", "isAdmin: boolean;\n  copyToClipboard: (text: string) => void;")
        content = content.replace("isAdmin,\n  handleDeleteClick", "isAdmin,\n  handleDeleteClick,\n  copyToClipboard")
        # Also need to import Copy icon
        content = content.replace("import { Wifi, Monitor, Cpu, Eye, EyeOff, Edit, Printer, Trash2 }", "import { Wifi, Monitor, Cpu, Eye, EyeOff, Edit, Printer, Trash2, Copy }")

    # Fix Address / Tax
    old_address = """                    <td className="px-2 py-1 text-base border border-gray-200 dark:border-slate-700/60">
                      <div className="flex flex-col">
                        <span className="text-gray-700 dark:text-slate-300 font-medium text-base truncate max-w-[150px]">{row.address || '—'}</span>
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{row.tax_number || '—'}</span>
                      </div>
                    </td>"""
    new_address = """                    <td className="px-2 py-1 text-base border border-gray-200 dark:border-slate-700/60">
                      <div className="flex flex-col">
                        <span className="text-gray-700 dark:text-slate-300 font-medium text-base truncate max-w-[150px]">{row.اسم_المدينة ? row.اسم_المدينة + " - " + row.اسم_الشارع : row.اسم_الشارع}</span>
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{row.الرقم_الضريبي || '—'}</span>
                      </div>
                    </td>"""
    content = content.replace(old_address, new_address)

    # Fix Printers
    old_printers = """                  <td className="px-2 py-1 text-base text-gray-700 dark:text-slate-300 font-medium border border-gray-200 dark:border-slate-700/60">
                    {row.اسم_الطابعة || '—'}
                  </td>"""
    new_printers = """                  <td className="px-2 py-1 text-sm text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700/60">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">A4: {row.اسم_طابعة_a4 || '—'}</span>
                      <span className="text-gray-500 dark:text-slate-400 font-mono">طابعة_فواتير: {row.طابعة_فواتير || '—'}</span>
                    </div>
                  </td>"""
    content = content.replace(old_printers, new_printers)

    # Fix Password
    old_password = """                <td className="px-2 py-1 text-base border border-gray-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-1.5 justify-center group" onClick={(e) => e.stopPropagation()}>
                    <span className="font-mono text-sm tracking-wider text-gray-900 dark:text-slate-100 font-bold bg-gray-50 dark:bg-slate-900 px-1 py-0.5 rounded-sm border border-gray-200 dark:border-slate-700 min-w-[70px] inline-block text-center select-all">
                      {decryptedPasswords[row.id] ? decryptedPasswords[row.id] : '••••••••'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShowPassword(row.id); }}
                      className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title={decryptedPasswords[row.id] ? "إخفاء" : "إظهار"}
                    >
                      {decryptedPasswords[row.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>"""
    new_password = """                <td className="px-2 py-1 text-base border border-gray-200 dark:border-slate-700/60">
                  {decryptedPasswords[row.id] ? (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className="font-mono text-green-600 dark:text-green-400 font-bold tracking-wider">{decryptedPasswords[row.id]}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(decryptedPasswords[row.id]);
                        }}
                        className="p-1 rounded-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-900/50 dark:hover:bg-indigo-900/30 border border-gray-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        title="نسخ"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span className="text-gray-400 tracking-widest font-mono">••••••••</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowPassword(row.id);
                        }}
                        className="p-1 rounded-sm text-gray-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-gray-50 hover:bg-indigo-50 dark:bg-slate-900/50 dark:hover:bg-indigo-900/30 border border-gray-300 dark:border-slate-600 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                        title="إظهار"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </td>"""
    content = content.replace(old_password, new_password)

    # Fix Action Buttons
    old_actions = """                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(row);
                      }}
                      className="text-emerald-650 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 p-1 rounded-sm border border-emerald-100 dark:border-emerald-900/20 transition-colors cursor-pointer"
                      title="تعديل الفرع"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    {/* زر المراجعة / التعديل */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBranch({ id: row.رقم_الفرع, name: row.اسم_الفرع_ar }); }}
                        className="text-indigo-650 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/50 p-1 rounded-sm border border-indigo-100 dark:border-indigo-900/20 transition-colors cursor-pointer"
                        title="تفاصيل إضافية (أجهزة، كمبيوتر، اتصال)"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrint(row);
                      }}
                      className="text-blue-650 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 bg-blue-50 dark:bg-blue-950/50 p-1 rounded-sm border border-blue-100 dark:border-blue-900/20 transition-colors cursor-pointer"
                      title="طباعة A4"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(row);
                        }}
                        className="text-red-650 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 bg-red-50 dark:bg-red-950/50 p-1 rounded-sm border border-red-100 dark:border-red-900/20 transition-colors cursor-pointer"
                        title="حذف الفرع"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>"""
    new_actions = """                  <div className="flex gap-1 items-center justify-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditClick(row); }}
                      className="text-indigo-650 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-250 bg-indigo-50 dark:bg-indigo-950/50 p-1 rounded-sm border border-indigo-100 dark:border-indigo-900/20 transition-colors cursor-pointer"
                      title="تعديل الفرع"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePrint(row); }}
                      className="text-blue-650 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 bg-blue-50 dark:bg-blue-950/50 p-1 rounded-sm border border-blue-100 dark:border-blue-900/20 transition-colors cursor-pointer"
                      title="طباعة A4"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(row);
                        }}
                        className="text-red-650 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 bg-red-50 dark:bg-red-950/50 p-1 rounded-sm border border-red-100 dark:border-red-900/20 transition-colors cursor-pointer"
                        title="حذف الفرع"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>"""
    content = content.replace(old_actions, new_actions)

    with open('g:/ServerData/nextjs/components/AccountMainTable.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

fix_page_tsx()
fix_account_table()
