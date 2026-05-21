import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/server_data.dart';
import '../utils/print_utils.dart';
import 'package:aescryptojs/aescryptojs.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/server_notifier.dart';
import '../services/metadata_notifier.dart';

class ServerListScreen extends ConsumerStatefulWidget {
  const ServerListScreen({super.key});

  @override
  ConsumerState<ServerListScreen> createState() => _ServerListScreenState();
}

class _ServerListScreenState extends ConsumerState<ServerListScreen> {
  final List<String> _regions = [
    '1-المدينة المنورة',
    '1-المنطقة الوسطى',
    '2-الرياض',
    '2-الدمام',
    '3-الجنوبية - أبها',
    '4-جدة',
    '4-الغربية - مكة',
    '5-الشمالية تبوك',
    '5-الطائف'
  ];

  static const adminKey = String.fromEnvironment('ADMIN_KEY', defaultValue: 'sols');


  Map<String, bool> _getRequiredFields(String category) {
    if (category == 'فرنشايز' || category == 'فيلانتو') {
      return {'street': true, 'city': true, 'taxNo': true};
    } else if (category == 'فلورينا' || category == 'جملة') {
      return {'street': false, 'city': true, 'taxNo': false};
    } else {
      return {'street': false, 'city': false, 'taxNo': false};
    }
  }

  void _showAddServerDialog() {
    final branchNoController = TextEditingController();
    final nameArController = TextEditingController();
    final nameEnController = TextEditingController();
    final usernameController = TextEditingController();
    final passwordController = TextEditingController();
    final serialController = TextEditingController(text: '100000');
    final streetController = TextEditingController();
    final cityController = TextEditingController();
    final taxNoController = TextEditingController();
    final printerA4Controller = TextEditingController();
    final printerBillController = TextEditingController();

    String selectedCategory = 'فلورينا';
    String selectedStatus = 'يعمل';
    String? selectedRegion;

    // Auto-generate printer names
    nameEnController.addListener(() {
      final text = nameEnController.text.toUpperCase();
      if (text.length >= 4) {
        printerA4Controller.text = '${text.substring(0, 4)}BIGPRIN1';
        printerBillController.text = '${text.substring(0, 4)}SPRI';
      }
    });

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('إضافة سيرفر جديد', style: TextStyle(fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: selectedCategory,
                  decoration: const InputDecoration(labelText: 'تصنيف الفرع'),
                  items: ['فلورينا', 'فرنشايز', 'جملة', 'موزع معتمد', 'اسكتشر', 'فيلانتو'].map((c) {
                    return DropdownMenuItem(value: c, child: Text(c));
                  }).toList(),
                  onChanged: (val) {
                    setDialogState(() {
                      selectedCategory = val!;
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
                  decoration: const InputDecoration(labelText: 'اسم الفرع بالعربي'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: nameEnController,
                  decoration: const InputDecoration(labelText: 'اسم الفرع بالإنجليزي'),
                  textCapitalization: TextCapitalization.characters,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: usernameController,
                  decoration: const InputDecoration(labelText: 'اسم اليوزر'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'الباسوورد للسيرفر'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: serialController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'التسلسل (Serial Number)'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: selectedStatus,
                  decoration: const InputDecoration(labelText: 'حالة الفرع'),
                  items: ['يعمل', 'الافتتاح قريبا', 'مغلق مؤقتا', 'مغلق نهائيا'].map((s) {
                    return DropdownMenuItem(value: s, child: Text(s));
                  }).toList(),
                  onChanged: (val) => setDialogState(() => selectedStatus = val!),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: selectedRegion,
                  decoration: const InputDecoration(labelText: 'المنطقة'),
                  items: _regions.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                  onChanged: (val) => setDialogState(() => selectedRegion = val),
                ),
                const SizedBox(height: 12),
                const Divider(),
                const Text('بيانات إضافية', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.indigo)),
                const SizedBox(height: 8),
                TextField(
                  controller: streetController,
                  decoration: InputDecoration(
                    labelText: 'اسم الشارع',
                    suffixIcon: _getRequiredFields(selectedCategory)['street']! ? const Icon(Icons.star, color: Colors.red, size: 10) : null,
                  ),
                  enabled: _getRequiredFields(selectedCategory)['street']! || _getRequiredFields(selectedCategory)['city']!,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: cityController,
                  decoration: InputDecoration(
                    labelText: 'اسم المدينة',
                    suffixIcon: _getRequiredFields(selectedCategory)['city']! ? const Icon(Icons.star, color: Colors.red, size: 10) : null,
                  ),
                  enabled: _getRequiredFields(selectedCategory)['street']! || _getRequiredFields(selectedCategory)['city']!,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: taxNoController,
                  decoration: InputDecoration(
                    labelText: 'الرقم الضريبي',
                    suffixIcon: _getRequiredFields(selectedCategory)['taxNo']! ? const Icon(Icons.star, color: Colors.red, size: 10) : null,
                  ),
                  enabled: _getRequiredFields(selectedCategory)['taxNo']!,
                ),
                const SizedBox(height: 12),
                const Divider(),
                const Text('بيانات الطابعات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.indigo)),
                const SizedBox(height: 8),
                TextField(
                  controller: printerA4Controller,
                  decoration: const InputDecoration(labelText: 'طابعة A4'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: printerBillController,
                  decoration: const InputDecoration(labelText: 'طابعة الفواتير'),
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

                if (nameEnController.text.length < 4) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('اسم الفرع بالإنجليزية يجب أن يكون 4 أحرف على الأقل')),
                  );
                  return;
                }

                if (printerA4Controller.text.length != 12) {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                      title: const Row(
                        children: [
                          Icon(Icons.warning_amber_rounded, color: Colors.amber),
                          SizedBox(width: 8),
                          Text('خطأ في التنسيق', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        ],
                      ),
                      content: const Text(
                        'يجب أن يتكون اسم طابعة A4 من 4 أحرف للفرع متبوعة بـ BIGPRIN1 (الإجمالي 12 حرف).',
                        style: TextStyle(fontSize: 14, color: Colors.grey),
                      ),
                      actions: [
                        ElevatedButton(
                          onPressed: () => Navigator.pop(context),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.amber,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('موافق', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  );
                  return;
                }

                try {
                  final response = await Supabase.instance.client.from('server_data').select('id, رقم_الفرع, اسم_الفرع_ar, طابعة_a4, طابعة_فواتير');
                  final freshServers = (response as List).map((s) => ServerData.fromMap(s)).toList();
                  
                  final duplicate = freshServers.firstWhere(
                    (s) => (s.printerA4 == printerA4Controller.text && printerA4Controller.text.isNotEmpty) ||
                           (s.printerBill == printerBillController.text && printerBillController.text.isNotEmpty),
                    orElse: () => ServerData(id: 0, branchNo: '', category: '', branchNameAr: '', branchNameEn: '', username: '', encryptedPassword: '', status: '', createdAt: DateTime.now(), serialNumber: 0),
                  );

                  if (duplicate.id != 0) {
                    if (context.mounted) {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
                          title: const Row(
                            children: [
                              Icon(Icons.info_outline_rounded, color: Colors.amber),
                              SizedBox(width: 8),
                              Text('تعارض في الطابعة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                            ],
                          ),
                          content: Text(
                            'اسم الطابعة مستخدم مسبقاً في:\n(${duplicate.branchNo}) - ${duplicate.branchNameAr}',
                            style: const TextStyle(fontSize: 14, color: Colors.grey),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context),
                              child: const Text('موافق', style: TextStyle(color: Colors.grey)),
                            ),
                          ],
                        ),
                      );
                    }
                    return;
                  }

                  final encryptedPass = encryptAESCryptoJS(passwordController.text, adminKey);
                  await Supabase.instance.client.from('server_data').insert({
                    'رقم_الفرع': branchNoController.text,
                    'تصنيف_الفرع': selectedCategory,
                    'اسم_الفرع_ar': nameArController.text,
                    'اسم_الفرع_en': nameEnController.text.toUpperCase(),
                    'اسم_اليوزر': usernameController.text,
                    'باسوورد': encryptedPass,
                    'حالة_اليوزر': selectedStatus,
                    'serial_number': int.tryParse(serialController.text) ?? 100000,
                    'المنطقة': selectedRegion,
                    'اسم_الشارع': streetController.text.isEmpty ? null : streetController.text,
                    'اسم_المدينة': cityController.text.isEmpty ? null : cityController.text,
                    'الرقم_الضريبي': taxNoController.text.isEmpty ? null : taxNoController.text,
                    'طابعة_a4': printerA4Controller.text,
                    'طابعة_فواتير': printerBillController.text,
                  });

                  if (context.mounted) {
                    Navigator.pop(context); // Close the Add Server Dialog
                    ref.read(serverDataNotifierProvider.notifier).refreshServers();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('تم حفظ بيانات الفرع الجديد بنجاح', style: TextStyle(fontWeight: FontWeight.bold)),
                        backgroundColor: Colors.indigo[600],
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('حدث خطأ أثناء الحفظ: $e')),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: const Text('إضافة', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final metadataAsync = ref.watch(metadataProvider);
    final serversAsync = ref.watch(serverDataNotifierProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('إدارة الفروع والسيرفرات', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          IconButton(onPressed: () => ref.read(serverDataNotifierProvider.notifier).refreshServers(), icon: const Icon(Icons.refresh)),
          IconButton(onPressed: _showAddServerDialog, icon: const Icon(Icons.add_circle_outline)),
        ],
      ),
      body: metadataAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('خطأ في جلب بيانات المستخدم: $e')),
        data: (metadata) {
          if (metadata?.role != 'admin') {
            return const Center(
              child: Text(
                'ليس لديك صلاحية للوصول إلى هذه الصفحة',
                style: TextStyle(fontSize: 18, color: Colors.red, fontWeight: FontWeight.bold),
              ),
            );
          }
          return serversAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, st) => Center(child: Text('خطأ في جلب السيرفرات: $e')),
            data: (allServers) => RefreshIndicator(
              onRefresh: () => ref.read(serverDataNotifierProvider.notifier).refreshServers(),
              child: ListView.builder(
                itemCount: allServers.length,
                itemBuilder: (context, index) {
                  final server = allServers[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.indigo[100],
                        child: Text(server.branchNo, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                      title: Text(server.branchNameAr, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${server.category} - ${server.status}'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.print, color: Colors.blue),
                            onPressed: () {
                              final supported = ['فرنشايز', 'فيلانتو', 'فلورينا', 'جملة', 'اسكتشر', 'موزع معتمد'];
                              if (supported.contains(server.category)) {
                                PrintUtils.printBranchFoundation(server);
                              } else {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('سيتم تزويد بيانات الطباعة لهذا التصنيف لاحقاً')),
                                );
                              }
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete_outline, color: Colors.red),
                            onPressed: () => _showDeleteConfirmation(server),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          );
        },
      ),
    );
  }

  void _showDeleteConfirmation(ServerData server) {
    final passwordController = TextEditingController();
    String? errorMsg;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: Colors.red),
              const SizedBox(width: 10),
              Expanded(child: Text('حذف الفرع (${server.branchNo})', style: const TextStyle(fontWeight: FontWeight.bold))),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('أنت على وشك حذف هذا الفرع نهائياً. يرجى إدخال كلمة المرور للتأكيد:'),
              if (errorMsg != null)
                Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Text(errorMsg!, style: const TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              const SizedBox(height: 15),
              TextField(
                controller: passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'كلمة المرور',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  filled: true,
                  fillColor: Colors.grey[100],
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('إلغاء', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () async {
                if (passwordController.text != adminKey) {
                  setDialogState(() => errorMsg = 'كلمة المرور غير صحيحة');
                  return;
                }
                try {
                  await Supabase.instance.client
                      .from('server_data')
                      .delete()
                      .eq('id', server.id);
                  if (context.mounted) {
                    Navigator.pop(context);
                    ref.read(serverDataNotifierProvider.notifier).refreshServers();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('تم حذف الفرع بنجاح', style: TextStyle(fontWeight: FontWeight.bold)),
                        backgroundColor: Colors.green[600],
                        behavior: SnackBarBehavior.floating,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    );
                  }
                } catch (e) {
                  setDialogState(() => errorMsg = 'خطأ في الحذف: $e');
                }
              },
              child: const Text('حذف نهائي', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
