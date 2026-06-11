class UsersManagementWidget extends StatefulWidget {
  const UsersManagementWidget({super.key});

  @override
  State<UsersManagementWidget> createState() => _UsersManagementWidgetState();
}

class _UsersManagementWidgetState extends State<UsersManagementWidget> {
  List<dynamic> _users = [];
  Map<String, dynamic> _lastActivities = {};
  Map<String, bool> _onlineUsers = {};
  bool _isLoading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers() async {
    try {
      final response = await Supabase.instance.client.from('users').select().order('created_at', ascending: true);
      
      final logsResponse = await Supabase.instance.client.from('audit_logs')
          .select('user_id, action, entity_name, created_at')
          .order('created_at', ascending: false);

      final Map<String, dynamic> lastActivities = {};
      final Map<String, bool> onlineUsers = {};
      final now = DateTime.now();

      for (var log in (logsResponse as List<dynamic>)) {
        final userId = log['user_id']?.toString();
        if (userId != null) {
          if (!lastActivities.containsKey(userId)) {
            lastActivities[userId] = log;
          }
          final logDate = DateTime.tryParse(log['created_at']);
          if (logDate != null && now.difference(logDate).inMinutes <= 15) {
            onlineUsers[userId] = true;
          }
        }
      }

      if (mounted) {
        setState(() {
          _users = response as List<dynamic>;
          _lastActivities = lastActivities;
          _onlineUsers = onlineUsers;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _toggleUserStatus(Map<String, dynamic> user, bool newValue) async {
    try {
      await Supabase.instance.client.from('users').update({'is_active': newValue}).eq('id', user['id']);
      _fetchUsers();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('خطأ: $e')));
    }
  }

  void _showPermissionsDialog(Map<String, dynamic> user) {
    List<String> userCategories = user['allowed_categories'] != null 
        ? List<String>.from((user['allowed_categories'] as List).map((e) => e.toString()))
        : [];
    final allCategories = ['الكل', 'اسكتشر', 'فرنشايز', 'موزع معتمد', 'فيلانتو', 'الإدارة', 'لوحة الإحصائيات', 'سجل النشاطات', 'إدارة المستخدمين', 'كمبيوتر وملحقات', 'جرد الأجهزة'];

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('صلاحيات المستخدم', style: TextStyle(fontWeight: FontWeight.bold)),
              content: SizedBox(
                width: double.maxFinite,
                child: ListView(
                  shrinkWrap: true,
                  children: allCategories.map((cat) {
                    return CheckboxListTile(
                      title: Text(cat),
                      value: userCategories.contains(cat),
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
                  }).toList(),
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context), child: const Text('إلغاء')),
                ElevatedButton(
                  onPressed: () async {
                    Navigator.pop(context);
                    try {
                      await Supabase.instance.client.from('users').update({'allowed_categories': userCategories}).eq('id', user['id']);
                      _fetchUsers();
                    } catch (e) {
                      if (!mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('خطأ: $e')));
                    }
                  },
                  child: const Text('حفظ'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showUserActivitiesDialog(Map<String, dynamic> user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('نشاطات: ${user['email'] ?? 'المستخدم'}', style: const TextStyle(fontWeight: FontWeight.bold)),
        content: SizedBox(
          width: double.maxFinite,
          height: 400,
          child: FutureBuilder(
            future: Supabase.instance.client.from('audit_logs').select().eq('user_id', user['id']).order('created_at', ascending: false),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
              if (snapshot.hasError) return Center(child: Text('خطأ: ${snapshot.error}'));
              final logs = snapshot.data as List<dynamic>;
              if (logs.isEmpty) return const Center(child: Text('لا توجد نشاطات'));
              return ListView.builder(
                itemCount: logs.length,
                itemBuilder: (context, index) {
                  final log = logs[index];
                  final action = log['action'];
                  final table = log['entity_name'];
                  final date = log['created_at'] != null ? DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(log['created_at'])) : '';
                  return Card(
                    child: ListTile(
                      title: Text('إجراء: $action على ($table)'),
                      subtitle: Text(date),
                    ),
                  );
                },
              );
            },
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('إغلاق'))
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_error.isNotEmpty) return Center(child: Text('خطأ في جلب المستخدمين: \n$_error', style: const TextStyle(color: Colors.red)));
    if (_users.isEmpty) return const Center(child: Text('لا يوجد مستخدمين'));

    final currentUserId = Supabase.instance.client.auth.currentUser?.id;

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _users.length,
      itemBuilder: (context, index) {
        final user = _users[index];
        final isMe = user['id'] == currentUserId;
        final isActive = user['is_active'] ?? false;
        final isOnline = _onlineUsers[user['id']] == true || isMe;
        final lastLog = _lastActivities[user['id']];
        
        String lastActivityText = 'لا يوجد نشاط مسجل';
        if (lastLog != null) {
          final lastDate = DateTime.parse(lastLog['created_at']);
          final action = lastLog['action'] ?? 'إجراء غير معروف';
          final table = lastLog['entity_name'] ?? 'تفاصيل غير معروفة';
          final formattedDate = DateFormat('yyyy-MM-dd HH:mm').format(lastDate);
          lastActivityText = 'آخر نشاط: $action في ($table) • $formattedDate';
        }

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
            side: isMe ? const BorderSide(color: Colors.indigo, width: 2) : BorderSide.none,
          ),
          elevation: 2,
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Stack(
                      children: [
                        CircleAvatar(
                          radius: 25,
                          backgroundColor: Colors.indigo.withOpacity(0.1),
                          child: const Icon(Icons.person, color: Colors.indigo, size: 30),
                        ),
                        if (isOnline)
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              width: 14,
                              height: 14,
                              decoration: BoxDecoration(
                                color: Colors.green,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                              ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(user['email'] ?? 'بدون إيميل', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                              if (isMe)
                                Container(
                                  margin: const EdgeInsets.only(right: 8),
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(color: Colors.indigo, borderRadius: BorderRadius.circular(10)),
                                  child: const Text('أنت', style: const TextStyle(color: Colors.white, fontSize: 10)),
                                ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text('الدور: ${user['role'] ?? 'غير محدد'}', style: TextStyle(color: Colors.grey[700])),
                          const SizedBox(height: 4),
                          Text(lastActivityText, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                        ],
                      ),
                    ),
                    Column(
                      children: [
                        const Text('حالة الحساب', style: TextStyle(fontSize: 10, color: Colors.grey)),
                        Switch(
                          value: isActive,
                          onChanged: (val) => _toggleUserStatus(user, val),
                          activeColor: Colors.green,
                        ),
                      ],
                    ),
                  ],
                ),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    TextButton.icon(
                      icon: const Icon(Icons.security, color: Colors.indigo),
                      label: const Text('الصلاحيات'),
                      onPressed: () => _showPermissionsDialog(user),
                    ),
                    TextButton.icon(
                      icon: const Icon(Icons.history, color: Colors.indigo),
                      label: const Text('سجل النشاطات'),
                      onPressed: () => _showUserActivitiesDialog(user),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
