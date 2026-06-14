import sys

def refactor_hooks():
    with open('g:/ServerData/nextjs/app/account/page.tsx', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    added_import = False
    added_hook = False
    
    while i < len(lines):
        line = lines[i]

        if "import AccountMainTable from '@/components/AccountMainTable';" in line and not added_import:
            new_lines.append(line)
            new_lines.append("import { useAccountData } from '@/hooks/useAccountData';\n")
            added_import = True
            i += 1
            continue

        if "export default function AccountServersTable() {" in line:
            new_lines.append(line)
            new_lines.append("""  const {
    data,
    setData,
    isLoadingData,
    extraData,
    currentUser,
    setCurrentUser,
    isAdmin,
    setIsAdmin,
    visibleCategories,
    userEmail,
    adminUsers,
    setAdminUsers,
    isLoadingUsers,
    fetchAdminUsers,
    fetchData,
    supabase
  } = useAccountData();
""")
            added_hook = True
            i += 1
            continue
            
        if added_hook:
            stripped = line.strip()
            # Remove duplicated state declarations
            if stripped.startswith('const supabase = createClient();'):
                i += 1; continue
            if stripped.startswith('const [data, setData] = useState'):
                i += 1; continue
            if stripped.startswith('const [isLoadingData, setIsLoadingData] = useState'):
                i += 1; continue
            if stripped.startswith('const [userEmail, setUserEmail] = useState'):
                i += 1; continue
            if stripped.startswith('const [extraData, setExtraData] = useState'):
                i += 1; continue
            if stripped.startswith('const [isFetchingExtra, setIsFetchingExtra] = useState'):
                i += 1; continue
            if stripped.startswith('const [currentUser, setCurrentUser] = useState'):
                i += 1; continue
            if stripped.startswith('const [isAdmin, setIsAdmin] = useState'):
                i += 1; continue
            if stripped.startswith('const [visibleCategories, setVisibleCategories] = useState'):
                i += 1; continue
            if stripped.startswith('const [adminUsers, setAdminUsers] = useState'):
                i += 1; continue
            if stripped.startswith('const [isLoadingUsers, setIsLoadingUsers] = useState'):
                i += 1; continue
            
            # Remove useHooks related to data
            if "useEffect(() => {" in line and lines[i+1].strip() == "fetchData();" and lines[i+2].strip() == "supabase.auth.getUser().then(async ({ data: { user } }) => {":
                # skip until line with "}, []);"
                while "}, []);" not in lines[i]:
                    i += 1
                i += 1
                continue
                
            if "// تحديث حالة النشاط last_seen للمستخدم الحالي دورياً كل 90 ثانية" in line:
                # skip until next empty line after the hook
                while i < len(lines):
                    if lines[i].strip() == "}, [currentUser?.id]);":
                        i += 1
                        break
                    i += 1
                continue
                
            if "// جلب قائمة المستخدمين للمسؤول" in line:
                # skip until fetchAdminUsers ends
                while i < len(lines):
                    if lines[i].strip() == "};":
                        i += 1
                        break
                    i += 1
                continue

            if "useEffect(() => {" in line and lines[i+1].strip() == "if ((activeCategory === 'users' || activeCategory === 'stats') && isAdmin) {":
                # skip
                while "}, [activeCategory, isAdmin]);" not in lines[i]:
                    i += 1
                i += 1
                continue
                
            if "const fetchData = async () => {" in line:
                # skip
                while i < len(lines):
                    if lines[i].strip() == "};":
                        i += 1
                        break
                    i += 1
                continue
                
            if "// جلب البيانات الإضافية في الخلفية" in line:
                # skip
                while i < len(lines):
                    if lines[i].strip() == "};":
                        i += 1
                        break
                    i += 1
                continue
                
            if "useEffect(() => {" in line and lines[i+1].strip() == "if (data.length > 0) {":
                # skip
                while "}, [data]);" not in lines[i]:
                    i += 1
                i += 1
                continue

        new_lines.append(line)
        i += 1

    with open('g:/ServerData/nextjs/app/account/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

refactor_hooks()
