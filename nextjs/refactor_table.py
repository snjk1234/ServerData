import sys

def refactor_page2():
    with open('g:/ServerData/nextjs/app/account/page.tsx', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    main_table_import = "import AccountMainTable from '@/components/AccountMainTable';\n"
    
    main_table_component = """                <AccountMainTable
                  sortConfig={sortConfig}
                  handleSort={handleSort}
                  activeCategory={activeCategory}
                  isLoadingData={isLoadingData}
                  sortedData={sortedData}
                  setSelectedBranch={setSelectedBranch}
                  extraData={extraData}
                  togglePasswordVisibility={togglePasswordVisibility}
                  revealedPasswords={revealedPasswords}
                  setEditingItem={setEditingItem}
                  handlePrint={handlePrint}
                  isAdmin={isAdmin}
                  handleDeleteClick={handleDeleteClick}
                />\n"""

    new_lines = []
    i = 0
    added_import = False
    while i < len(lines):
        line = lines[i]
        
        if "import UserManagementTable from '@/components/UserManagementTable';" in line and not added_import:
            new_lines.append(line)
            new_lines.append(main_table_import)
            added_import = True
            i += 1
            continue

        if "{/* جدول فروع السيرفرات */}" in line:
            new_lines.append(line)
            new_lines.append(main_table_component)
            i += 1
            # Skip until we pass the table block end
            while i < len(lines):
                if lines[i].strip() == "</table>":
                    i += 2 # skip </table> and </div>
                    break
                i += 1
            continue

        new_lines.append(line)
        i += 1

    with open('g:/ServerData/nextjs/app/account/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

refactor_page2()
