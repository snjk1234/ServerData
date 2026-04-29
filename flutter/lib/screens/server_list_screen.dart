import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:aescryptojs/aescryptojs.dart';
import '../models/server_data.dart';
import '../services/server_notifier.dart';

class ServerListScreen extends ConsumerStatefulWidget {
  const ServerListScreen({super.key});

  @override
  ConsumerState<ServerListScreen> createState() => _ServerListScreenState();
}

class _ServerListScreenState extends ConsumerState<ServerListScreen> {
  String _searchQuery = '';
  String _selectedCategory = 'الكل';
  final Map<int, String> _decryptedPasswords = {};

  final List<String> _categories = [
    'الكل',
    'فلورينا',
    'فرنشايز',
    'جملة',
    'موزع معتمد',
    'اسكتشر',
    'فيلانتو'
  ];

  @override
  Widget build(BuildContext context) {
    final serverDataAsync = ref.watch(serverDataProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9), // Slate 100
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.indigo[900],
        centerTitle: true,
        title: const Text(
          'مراقبة السيرفرات',
          style: TextStyle(fontWeight: FontWeight.w900, color: Colors.white, fontSize: 20),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            tooltip: 'تحديث',
            onPressed: () => ref.refresh(serverDataProvider),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.white),
            tooltip: 'خروج',
            onPressed: () async {
              await Supabase.instance.client.auth.signOut();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Header search area
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
            decoration: BoxDecoration(
              color: Colors.indigo[900],
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(30),
                bottomRight: Radius.circular(30),
              ),
            ),
            child: Column(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: TextField(
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      hintText: 'ابحث برقم الفرع، الاسم، أو التصنيف...',
                      hintStyle: TextStyle(color: Colors.grey[400]),
                      prefixIcon: Icon(Icons.search_rounded, color: Colors.indigo[800]),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
                    ),
                    onChanged: (value) {
                      setState(() {
                        _searchQuery = value.toLowerCase();
                      });
                    },
                  ),
                ),
                const SizedBox(height: 16),
                
                // Categories Selector
                SizedBox(
                  height: 40,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _categories.length,
                    itemBuilder: (context, index) {
                      final cat = _categories[index];
                      final isSelected = _selectedCategory == cat;

                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedCategory = cat;
                          });
                        },
                        child: Container(
                          margin: const EdgeInsets.only(left: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.indigo[100] : Colors.indigo[800],
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected ? Colors.indigo[100]! : Colors.indigo[400]!,
                              width: 1.5,
                            ),
                          ),
                          child: Center(
                            child: Text(
                              cat,
                              style: TextStyle(
                                color: isSelected ? Colors.indigo[900] : Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Server List
          Expanded(
            child: serverDataAsync.when(
              data: (servers) {
                // Apply combined filters
                final filtered = servers.where((server) {
                  final matchesSearch = server.branchNo.toLowerCase().contains(_searchQuery) ||
                      server.branchNameAr.contains(_searchQuery) ||
                      server.branchNameEn.toLowerCase().contains(_searchQuery) ||
                      server.status.contains(_searchQuery);

                  final matchesCategory = _selectedCategory == 'الكل' || 
                      server.category == _selectedCategory;

                  return matchesSearch && matchesCategory;
                }).toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.layers_clear_rounded, size: 64, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        Text(
                          'لا توجد سيرفرات في هذا القسم',
                          style: TextStyle(color: Colors.grey[600], fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final server = filtered[index];
                    final isDecrypted = _decryptedPasswords.containsKey(server.id);

                    // ألوان التصنيف المخصصة
                    Color categoryColor = Colors.indigo[50]!;
                    Color categoryTextColor = Colors.indigo[800]!;
                    
                    if (server.category == 'فلورينا') {
                      categoryColor = Colors.teal[50]!;
                      categoryTextColor = Colors.teal[800]!;
                    } else if (server.category == 'فرنشايز') {
                      categoryColor = Colors.orange[50]!;
                      categoryTextColor = Colors.orange[800]!;
                    } else if (server.category == 'جملة') {
                      categoryColor = Colors.blueGrey[50]!;
                      categoryTextColor = Colors.blueGrey[800]!;
                    } else if (server.category == 'موزع معتمد') {
                      categoryColor = Colors.cyan[50]!;
                      categoryTextColor = Colors.cyan[800]!;
                    } else if (server.category == 'اسكتشر') {
                      categoryColor = Colors.purple[50]!;
                      categoryTextColor = Colors.purple[800]!;
                    } else if (server.category == 'فيلانتو') {
                      categoryColor = Colors.pink[50]!;
                      categoryTextColor = Colors.pink[800]!;
                    }

                    // لون الحالة
                    Color statusColor = Colors.grey;
                    if (server.status == 'يعمل') statusColor = Colors.green[600]!;
                    if (server.status == 'الافتتاح قريبا') statusColor = Colors.blue[600]!;
                    if (server.status == 'مغلق مؤقتا') statusColor = Colors.amber[600]!;
                    if (server.status == 'مغلق نهائياً') statusColor = Colors.red[600]!;

                    return Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.indigo.withOpacity(0.04),
                            blurRadius: 10,
                            offset: const Offset(0, 6),
                          )
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: Stack(
                          children: [
                            // الخط السفلي للحالة
                            Positioned(
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              child: Container(color: statusColor),
                            ),
                            
                            Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Row 1: Branch number, Name and Status
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                            decoration: BoxDecoration(
                                              color: categoryColor,
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: Text(
                                              '${server.branchNo} - ${server.category}',
                                              style: TextStyle(
                                                fontWeight: FontWeight.w900,
                                                color: categoryTextColor,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 10),
                                          Text(
                                            server.branchNameAr,
                                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                                          ),
                                        ],
                                      ),
                                      _buildStatusBadge(server.status, statusColor),
                                    ],
                                  ),

                                  const Padding(
                                    padding: EdgeInsets.symmetric(vertical: 12.0),
                                    child: Divider(height: 1, color: Color(0xFFF1F5F9)),
                                  ),

                                  // Row 2: Details
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            _buildDetailRow(Icons.text_fields_rounded, 'الاسم (EN):', server.branchNameEn),
                                            const SizedBox(height: 8),
                                            _buildDetailRow(Icons.person_rounded, 'اسم المستخدم:', server.username),
                                          ],
                                        ),
                                      ),
                                      Container(
                                        width: 1,
                                        height: 50,
                                        color: const Color(0xFFF1F5F9),
                                        margin: const EdgeInsets.symmetric(horizontal: 12),
                                      ),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'كلمة المرور:',
                                              style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold),
                                            ),
                                            const SizedBox(height: 4),
                                            Row(
                                              children: [
                                                Icon(Icons.lock_rounded, size: 16, color: Colors.grey[600]),
                                                const SizedBox(width: 4),
                                                Expanded(
                                                  child: Text(
                                                    isDecrypted ? _decryptedPasswords[server.id]! : '••••••',
                                                    style: TextStyle(
                                                      fontWeight: FontWeight.bold,
                                                      fontFamily: isDecrypted ? 'monospace' : null,
                                                      color: isDecrypted ? Colors.green[700] : Colors.grey[600],
                                                      fontSize: 14,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                            if (!isDecrypted)
                                              InkWell(
                                                onTap: () => _showPasswordDialog(server),
                                                child: Text(
                                                  'اضغط للإظهار',
                                                  style: TextStyle(
                                                    color: Colors.indigo[600],
                                                    fontWeight: FontWeight.w800,
                                                    fontSize: 12,
                                                    decoration: TextDecoration.underline,
                                                  ),
                                                ),
                                              ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  
                                  const SizedBox(height: 8),
                                  Align(
                                    alignment: Alignment.centerLeft,
                                    child: IconButton(
                                      icon: Icon(Icons.info_outline_rounded, color: Colors.indigo[300], size: 20),
                                      tooltip: 'المزيد من التفاصيل',
                                      onPressed: () => _showDetailsDialog(server),
                                    ),
                                  )
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
              loading: () => Center(child: CircularProgressIndicator(color: Colors.indigo[800])),
              error: (err, stack) => Center(child: Text('حدث خطأ أثناء تحميل البيانات: $err')),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddServerDialog(context),
        label: const Text('إضافة فرع', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        backgroundColor: Colors.indigo[900],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.indigo[300]),
        const SizedBox(width: 6),
        Text(
          '$label ',
          style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.bold),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusBadge(String status, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w900),
      ),
    );
  }

  void _showPasswordDialog(ServerData server) {
    final TextEditingController passController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('التحقق من الصلاحية', style: TextStyle(fontWeight: FontWeight.w900)),
          content: TextField(
            controller: passController,
            obscureText: true,
            decoration: InputDecoration(
              hintText: 'أدخل الرمز الموحد (sols)',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              filled: true,
              fillColor: Colors.grey[50],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('إلغاء', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () {
                if (passController.text == 'sols') {
                  Navigator.pop(context);
                  _decryptPassword(server);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('كلمة المرور غير صحيحة')),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.indigo[800],
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('تأكيد', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  void _decryptPassword(ServerData server) {
    try {
      final decrypted = decryptAESCryptoJS(server.encryptedPassword, 'sols');
      setState(() {
        _decryptedPasswords[server.id] = decrypted; 
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('حدث خطأ أثناء فك التشفير: $e')),
      );
    }
  }

  void _showDetailsDialog(ServerData server) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(
            '${server.branchNo} - تفاصيل كاملة',
            style: const TextStyle(fontWeight: FontWeight.w900),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildDetailItem('رقم الفرع:', server.branchNo),
              _buildDetailItem('التصنيف:', server.category),
              _buildDetailItem('اسم الفرع AR:', server.branchNameAr),
              _buildDetailItem('اسم الفرع EN:', server.branchNameEn),
              _buildDetailItem('اسم اليوزر:', server.username),
              _buildDetailItem('الحالة:', server.status),
              _buildDetailItem('تاريخ الإنشاء:', server.createdAt.toLocal().toString().split('.').first),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('إغلاق', style: TextStyle(color: Colors.indigo[800], fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: RichText(
        text: TextSpan(
          style: const TextStyle(color: Color(0xFF334155), fontSize: 14, fontFamily: 'Cairo'),
          children: [
            TextSpan(text: '$label ', style: const TextStyle(fontWeight: FontWeight.w900)),
            TextSpan(text: value),
          ],
        ),
      ),
    );
  }
  void _showAddServerDialog(BuildContext context) {
    String selectedCategory = 'فلورينا';
    String selectedStatus = 'يعمل';
    final branchNoController = TextEditingController();
    final nameArController = TextEditingController();
    final nameEnController = TextEditingController();
    final usernameController = TextEditingController();
    final passwordController = TextEditingController();
    
    bool isGenerating = true;

    void generateBranchNo(List<ServerData> allServers, String category, StateSetter setDialogState) {
      int startNum = 1;
      if (category == 'اسكتشر') startNum = 300;
      else if (category == 'فرنشايز') startNum = 500;
      else if (category == 'موزع معتمد') startNum = 600;
      else if (category == 'فيلانتو') startNum = 900;

      final categoryNumbers = allServers
          .where((r) => r.category == category)
          .map((r) {
            final numStr = r.branchNo.replaceAll(RegExp(r'\D'), '');
            return int.tryParse(numStr) ?? 0;
          })
          .toList();

      int nextNum = startNum;
      if (categoryNumbers.isNotEmpty) {
        nextNum = categoryNumbers.reduce((a, b) => a > b ? a : b) + 1;
      }

      final hasBR = allServers.any((r) => r.branchNo.startsWith('BR'));
      String formattedNo = hasBR ? 'BR${nextNum.toString().padLeft(3, '0')}' : nextNum.toString();

      setDialogState(() {
        branchNoController.text = formattedNo;
      });
    }

    showDialog(
      context: context,
      builder: (context) {
        final serverDataAsync = ref.read(serverDataProvider);
        final servers = serverDataAsync.value ?? [];

        return StatefulBuilder(
          builder: (context, setDialogState) {
            if (isGenerating) {
              generateBranchNo(servers, selectedCategory, setDialogState);
              isGenerating = false;
            }

            return AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: const Text('إضافة فرع جديد', style: TextStyle(fontWeight: FontWeight.w900)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DropdownButtonFormField<String>(
                      value: selectedCategory,
                      decoration: const InputDecoration(labelText: 'تصنيف الفرع'),
                      items: _categories.where((c) => c != 'الكل').map((c) {
                        return DropdownMenuItem(value: c, child: Text(c));
                      }).toList(),
                      onChanged: (val) {
                        setDialogState(() {
                          selectedCategory = val!;
                          isGenerating = true;
                        });
                      },
                    ),
                    const SizedBox(height: 12),
                    
                    TextField(
                      controller: branchNoController,
                      decoration: const InputDecoration(labelText: 'رقم الفرع'),
                    ),
                    const SizedBox(height: 12),

                    TextField(
                      controller: nameArController,
                      decoration: const InputDecoration(labelText: 'اسم الفرع (عربي)'),
                    ),
                    const SizedBox(height: 12),

                    TextField(
                      controller: nameEnController,
                      decoration: const InputDecoration(labelText: 'اسم الفرع (إنجليزي)'),
                      onChanged: (val) {
                        final text = val.toUpperCase();
                        nameEnController.value = nameEnController.value.copyWith(
                          text: text,
                          selection: TextSelection.collapsed(offset: text.length),
                        );
                      },
                    ),
                    const SizedBox(height: 12),

                    TextField(
                      controller: usernameController,
                      decoration: const InputDecoration(labelText: 'اسم المستخدم للسيرفر'),
                    ),
                    const SizedBox(height: 12),

                    TextField(
                      controller: passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(labelText: 'الباسوورد للسيرفر'),
                    ),
                    const SizedBox(height: 12),

                    DropdownButtonFormField<String>(
                      value: selectedStatus,
                      decoration: const InputDecoration(labelText: 'حالة الفرع'),
                      items: ['يعمل', 'الافتتاح قريبا', 'مغلق مؤقتا', 'مغلق نهائيا'].map((s) {
                        return DropdownMenuItem(value: s, child: Text(s));
                      }).toList(),
                      onChanged: (val) {
                        setDialogState(() {
                          selectedStatus = val!;
                        });
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('إلغاء', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                ),
                ElevatedButton(
                  onPressed: () async {
                    if (branchNoController.text.isEmpty ||
                        nameArController.text.isEmpty ||
                        nameEnController.text.isEmpty ||
                        usernameController.text.isEmpty ||
                        passwordController.text.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('يرجى إدخال جميع الحقول')),
                      );
                      return;
                    }

                    try {
                      final encryptedPass = encryptAESCryptoJS(passwordController.text, 'sols');
                      
                      await Supabase.instance.client.from('server_data').insert({
                        'رقم_الفرع': branchNoController.text,
                        'تصنيف_الفرع': selectedCategory,
                        'اسم_الفرع_ar': nameArController.text,
                        'اسم_الفرع_en': nameEnController.text,
                        'اسم_اليوزر': usernameController.text,
                        'باسوورد': encryptedPass,
                        'حالة_اليوزر': selectedStatus,
                      });

                      if (context.mounted) {
                        Navigator.pop(context);
                        ref.refresh(serverDataProvider);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('تمت إضافة الفرع بنجاح')),
                        );
                      }
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('خطأ أثناء الحفظ: $e')),
                        );
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo[900]),
                  child: const Text('حفظ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                )
              ],
            );
          }
        );
      }
    );
  }
}
