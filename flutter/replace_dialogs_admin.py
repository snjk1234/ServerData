import io

with io.open('lib/screens/admin_tabs.dart', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def find_method(method_name):
    start = -1
    for i, line in enumerate(lines):
        if method_name in line:
            start = i
            break
    end = -1
    if start != -1:
        brace_count = 0
        for i in range(start, len(lines)):
            brace_count += lines[i].count('{')
            brace_count -= lines[i].count('}')
            if brace_count == 0 and i > start:
                end = i
                break
    return start, end

start1, end1 = find_method('void _showPermissionsDialog(')

new_perms = '''  void _showPermissionsDialog(Map<String, dynamic> user) {
    List<String> userCategories = user['allowed_categories'] != null 
        ? List<String>.from((user['allowed_categories'] as List).map((e) => e.toString()))
        : [];
    final allCategories = ['الكل', 'اسكتشر', 'فرنشايز', 'موزع معتمد', 'فيلانتو', 'الإدارة', 'لوحة الإحصائيات', 'سجل النشاطات', 'إدارة المستخدمين', 'كمبيوتر وملحقات', 'جرد الأجهزة'];

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return Dialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              elevation: 10,
              backgroundColor: Colors.transparent,
              child: Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, 10)),
                  ],
                ),
                constraints: const BoxConstraints(maxWidth: 450, maxHeight: 650),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(colors: [Colors.indigo, Colors.blueAccent]),
                        borderRadius: BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.security_rounded, color: Colors.white, size: 28),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'صلاحيات: ',
                              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, color: Colors.white),
                            onPressed: () => Navigator.pop(context),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: allCategories.length,
                        separatorBuilder: (context, index) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final cat = allCategories[index];
                          final isSelected = userCategories.contains(cat);
                          return CheckboxListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            tileColor: isSelected ? Colors.indigo.withOpacity(0.05) : null,
                            title: Text(cat, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, color: isSelected ? Colors.indigo : Colors.black87)),
                            value: isSelected,
                            activeColor: Colors.indigo,
                            checkColor: Colors.white,
                            onChanged: (val) {
                              setDialogState(() {
                                if (val == true) {
                                  userCategories.add(cat);
                                } else {
                                  userCategories.remove(cat);
                                }
                              });
                            },
                          );
                        },
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade50,
                        borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(24), bottomRight: Radius.circular(24)),
                        border: Border(top: BorderSide(color: Colors.grey.shade200)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('إلغاء', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                          const SizedBox(width: 12),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.indigo,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            onPressed: () async {
                              Navigator.pop(context);
                              try {
                                await Supabase.instance.client.from('users').update({'allowed_categories': userCategories}).eq('id', user['id']);
                                _fetchUsers();
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم تحديث الصلاحيات بنجاح', style: TextStyle(fontWeight: FontWeight.bold)), backgroundColor: Colors.teal));
                              } catch (e) {
                                if (!mounted) return;
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('خطأ: '), backgroundColor: Colors.redAccent));
                              }
                            },
                            child: const Text('حفظ التعديلات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
'''

if start1 != -1 and end1 != -1:
    lines = lines[:start1] + [new_perms + '\n'] + lines[end1+1:]

start2, end2 = find_method('void _showUserActivitiesDialog(')

new_acts = '''  void _showUserActivitiesDialog(Map<String, dynamic> user) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        backgroundColor: Colors.transparent,
        child: Container(
          decoration: BoxDecoration(
            color: Theme.of(context).scaffoldBackgroundColor,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, 10)),
            ],
          ),
          constraints: const BoxConstraints(maxWidth: 600, maxHeight: 700),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [Colors.indigo, Colors.blueAccent]),
                  borderRadius: BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.history_rounded, color: Colors.white, size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'نشاطات: ',
                        style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: FutureBuilder(
                  future: Supabase.instance.client.from('audit_logs').select().eq('user_id', user['id']).order('created_at', ascending: false).limit(50),
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
                    if (snapshot.hasError) return Center(child: Text('حدث خطأ: '));
                    
                    final logs = snapshot.data as List<dynamic>? ?? [];
                    if (logs.isEmpty) {
                      return const Center(child: Text('لا توجد نشاطات مسجلة لهذا المستخدم.', style: TextStyle(fontSize: 16, color: Colors.grey)));
                    }
                    
                    return ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: logs.length,
                      separatorBuilder: (context, index) => const Divider(),
                      itemBuilder: (context, index) {
                        final log = logs[index];
                        final action = log['action'];
                        final entity = log['entity_name'] ?? 'سيرفر';
                        final date = DateTime.parse(log['created_at']).toLocal();
                        final isDelete = action == 'DELETE';
                        final isInsert = action == 'INSERT';

                        return ListTile(
                          leading: CircleAvatar(
                            backgroundColor: isDelete ? Colors.red.shade100 : (isInsert ? Colors.green.shade100 : Colors.blue.shade100),
                            child: Icon(
                              isDelete ? Icons.delete_rounded : (isInsert ? Icons.add_circle_rounded : Icons.edit_rounded),
                              color: isDelete ? Colors.red : (isInsert ? Colors.green : Colors.blue),
                            ),
                          ),
                          title: Text(' في ', style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('-- :'),
                        );
                      },
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
'''

if start2 != -1 and end2 != -1:
    lines = lines[:start2] + [new_acts + '\n'] + lines[end2+1:]

with io.open('lib/screens/admin_tabs.dart', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Replaced admin_tabs dialogs successfully!")
