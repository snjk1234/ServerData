import sys

def fix_table():
    with open('g:/ServerData/nextjs/components/AccountMainTable.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. replace revealedPasswords -> decryptedPasswords
    content = content.replace('revealedPasswords: Set<number>;', 'decryptedPasswords: Record<number, string>;')
    content = content.replace('revealedPasswords,', 'decryptedPasswords,')
    content = content.replace("revealedPasswords.has(row.id) ? row.الباسوورد : '••••••••'", "decryptedPasswords[row.id] ? decryptedPasswords[row.id] : '••••••••'")
    content = content.replace('revealedPasswords.has(row.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />', 'decryptedPasswords[row.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />')
    content = content.replace('revealedPasswords.has(row.id) ? "إخفاء" : "إظهار"', 'decryptedPasswords[row.id] ? "إخفاء" : "إظهار"')

    # 2. replace togglePasswordVisibility -> handleShowPassword
    content = content.replace('togglePasswordVisibility: (id: number) => void;', 'handleShowPassword: (id: number) => void;')
    content = content.replace('togglePasswordVisibility,', 'handleShowPassword,')
    content = content.replace('togglePasswordVisibility(row.id)', 'handleShowPassword(row.id)')

    # 3. replace setEditingItem -> handleEditClick
    content = content.replace('setEditingItem: (item: any) => void;', 'handleEditClick: (item: any) => void;')
    content = content.replace('setEditingItem,', 'handleEditClick,')
    content = content.replace('setEditingItem(row)', 'handleEditClick(row)')

    with open('g:/ServerData/nextjs/components/AccountMainTable.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

def fix_page():
    with open('g:/ServerData/nextjs/app/account/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace('togglePasswordVisibility={togglePasswordVisibility}', 'handleShowPassword={handleShowPassword}')
    content = content.replace('revealedPasswords={revealedPasswords}', 'decryptedPasswords={decryptedPasswords}')
    content = content.replace('setEditingItem={setEditingItem}', 'handleEditClick={handleEditClick}')

    with open('g:/ServerData/nextjs/app/account/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

fix_table()
fix_page()
