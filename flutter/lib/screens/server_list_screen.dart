import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/server_data.dart';
import '../utils/print_utils.dart';
import 'package:aescryptojs/aescryptojs.dart';
import 'package:http/http.dart' as http;
import 'package:csv/csv.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/server_notifier.dart';
import '../services/metadata_notifier.dart';
import 'admin_tabs.dart';
import 'server_dialog.dart';

class ServerListScreen extends ConsumerStatefulWidget {
  const ServerListScreen({super.key});

  @override
  ConsumerState<ServerListScreen> createState() => _ServerListScreenState();
}

class _ServerListScreenState extends ConsumerState<ServerListScreen> {
  final List<String> _categories = [
    'الكل',
    'فلورينا',
    'فرنشايز',
    'جملة',
    'موزع معتمد',
    'اسكتشر',
    'فيلانتو',
    'الإدارة',
    'كمبيوتر وملحقات',
    'جرد الأجهزة',
    'لوحة الإحصائيات',
    'سجل النشاطات',
    'إدارة المستخدمين'
  ];

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

  void _showServerDialog({ServerData? serverToEdit, required List<ServerData> allServers}) {
    showDialog(
      context: context,
      builder: (context) => ServerDialog(
        serverToEdit: serverToEdit,
        allServers: allServers,
        onSaved: () {
          ref.read(serverDataNotifierProvider.notifier).refreshServers();
        },
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'يعمل':
        return Colors.green.withOpacity(0.12);
      case 'مغلق نهائيا':
        return Colors.red.withOpacity(0.12);
      case 'مغلق مؤقتا':
        return Colors.orange.withOpacity(0.12);
      case 'الافتتاح قريبا':
        return Colors.blue.withOpacity(0.12);
      default:
        return Colors.grey.withOpacity(0.12);
    }
  }

  Color _getStatusTextColor(String status) {
    switch (status) {
      case 'يعمل':
        return Colors.green[800]!;
      case 'مغلق نهائيا':
        return Colors.red[800]!;
      case 'مغلق مؤقتا':
        return Colors.orange[800]!;
      case 'الافتتاح قريبا':
        return Colors.blue[800]!;
      default:
        return Colors.grey[800]!;
    }
  }

  void _showPasswordDialog(ServerData server) {
    String decryptedPass = '';
    try {
      if (server.encryptedPassword.isNotEmpty) {
        decryptedPass = decryptAESCryptoJS(server.encryptedPassword, adminKey);
      }
    } catch (e) {
      decryptedPass = 'تعذر فك التشفير';
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.vpn_key_outlined, color: Colors.indigo),
            SizedBox(width: 8),
            Text('كلمة المرور', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('كلمة المرور للسيرفر (${server.branchNo}):', style: const TextStyle(fontSize: 14)),
            const SizedBox(height: 15),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: SelectableText(
                      decryptedPass.isEmpty ? 'غير متوفرة' : decryptedPass,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.copy, color: Colors.indigo),
                    tooltip: 'نسخ كلمة المرور',
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: decryptedPass));
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text('تم النسخ للحافظة بنجاح!', style: TextStyle(fontWeight: FontWeight.bold)),
                          backgroundColor: Colors.green[600],
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                      );
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إغلاق', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final metadataAsync = ref.watch(metadataProvider);
    final serversAsync = ref.watch(serverDataNotifierProvider);

    return DefaultTabController(
      length: _categories.length,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('إدارة الفروع والسيرفرات', style: TextStyle(fontWeight: FontWeight.bold)),
          backgroundColor: Colors.indigo,
          foregroundColor: Colors.white,
          actions: [
            IconButton(onPressed: () => ref.read(serverDataNotifierProvider.notifier).refreshServers(), icon: const Icon(Icons.refresh)),
            serversAsync.when(
              data: (allServers) => IconButton(
                onPressed: () => _showServerDialog(allServers: allServers), 
                icon: const Icon(Icons.add_circle_outline)
              ),
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            )
          ],
          bottom: TabBar(
            isScrollable: true,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            indicatorColor: Colors.amber,
            tabs: _categories.map((c) => Tab(text: c)).toList(),
          ),
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
              data: (allServers) => TabBarView(
                children: _categories.map((category) {
                  if (category == 'كمبيوتر وملحقات') {
                    return const GoogleSheetTableWidget(
                      csvUrl: 'https://docs.google.com/spreadsheets/d/1NycN1P-ZcMjEvR9vqx0GyOjfaq4FWpK2N3srpv4pWp4/export?format=csv&gid=0',
                      allowedIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                      customHeaders: ["رقم الفرع", "اسم الفرع", "المنطقة", "الكمبيوتر", "الشاشة", "الهارد", "المعالج", "الرام", "الطابعة الكبيرة", "الطابعة الصغيرة", "الماسح الضوئي", "نوع الانترنت", "رقم الهاتف", "DVR", "البصمة", "الموقع"],
                    );
                  } else if (category == 'جرد الأجهزة') {
                    return const GoogleSheetTableWidget(
                      csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT5ngevFTz20Fi7JG_JKIe4ZnYmVEGpUZtL_5INutfSNI3PqCO7F3J9rkdDWN9LtA6pLnisoar0-v7C/pub?gid=806274198&single=true&output=csv',
                      allowedIndices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
                      customHeaders: ["اسم الفرع", "عدد الكاميرات", "سعة الهارد", "عدد الماوس", "الكيبورد", "الاسكانر", "درج الكاشير", "الشاشة الكبيرة", "الشاشة الصغيرة", "شاشة اللمس", "UPS", "السويتش", "جهاز البصمة"],
                    );
                  } else if (category == 'لوحة الإحصائيات') {
                    return StatisticsDashboardWidget(allServers: allServers);
                  } else if (category == 'سجل النشاطات') {
                    return const AuditLogsWidget();
                  } else if (category == 'إدارة المستخدمين') {
                    return const UsersManagementWidget();
                  }

                  final filteredServers = category == 'الكل' 
                      ? allServers 
                      : allServers.where((s) => s.category == category).toList();
                  
                  if (filteredServers.isEmpty) {
                    return const Center(child: Text('لا توجد سيرفرات في هذا التصنيف', style: TextStyle(fontSize: 16, color: Colors.grey)));
                  }

                  return RefreshIndicator(
                    onRefresh: () => ref.read(serverDataNotifierProvider.notifier).refreshServers(),
                    child: ListView.builder(
                      itemCount: filteredServers.length,
                      itemBuilder: (context, index) {
                        final server = filteredServers[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15),
                            side: BorderSide(color: Colors.grey[200]!, width: 1),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            leading: CircleAvatar(
                              backgroundColor: Colors.indigo.withOpacity(0.1),
                              foregroundColor: Colors.indigo,
                              child: Text(server.branchNo, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            ),
                            title: Text(server.branchNameAr, style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Padding(
                              padding: const EdgeInsets.only(top: 8.0),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(server.category, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: _getStatusColor(server.status),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      server.status,
                                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: _getStatusTextColor(server.status)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.vpn_key_outlined, color: Colors.amber, size: 22),
                                  tooltip: 'عرض كلمة المرور',
                                  onPressed: () => _showPasswordDialog(server),
                                ),
                                IconButton(
                                  icon: Icon(Icons.print_outlined, color: Colors.blue[600], size: 22),
                                  tooltip: 'طباعة نموذج',
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
                                  icon: Icon(Icons.edit_outlined, color: Colors.green[600], size: 22),
                                  tooltip: 'تعديل',
                                  onPressed: () => _showServerDialog(serverToEdit: server, allServers: allServers),
                                ),
                                IconButton(
                                  icon: Icon(Icons.delete_outline, color: Colors.red[600], size: 22),
                                  tooltip: 'حذف',
                                  onPressed: () => _showDeleteConfirmation(server),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  );
                }).toList(),
              ),
            );
          },
        ),
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

class GoogleSheetTableWidget extends StatefulWidget {
  final String csvUrl;
  final List<int>? allowedIndices;
  final List<String>? customHeaders;

  const GoogleSheetTableWidget({
    super.key,
    required this.csvUrl,
    this.allowedIndices,
    this.customHeaders,
  });

  @override
  State<GoogleSheetTableWidget> createState() => _GoogleSheetTableWidgetState();
}

class _GoogleSheetTableWidgetState extends State<GoogleSheetTableWidget> {
  List<Map<String, String>> _data = [];
  List<String> _headers = [];
  bool _isLoading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _fetchCsv();
  }

  Future<void> _fetchCsv() async {
    try {
      final url = '${widget.csvUrl}&t=${DateTime.now().millisecondsSinceEpoch}';
      final response = await http.get(Uri.parse(url), headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
      });
      
      if (response.statusCode == 200) {
        final decoded = utf8.decode(response.bodyBytes);
        final rows = CsvDecoder().convert(decoded);
        
        if (rows.length < 2) {
          setState(() {
            _data = [];
            _headers = widget.customHeaders ?? [];
            _isLoading = false;
          });
          return;
        }

        List<String> headers = widget.customHeaders ?? rows.first.map((e) => e.toString()).toList();
        List<int> indices = widget.allowedIndices ?? List.generate(headers.length, (i) => i);

        List<Map<String, String>> parsedData = [];
        for (int i = 1; i < rows.length; i++) {
          final row = rows[i];
          Map<String, String> rowData = {};
          for (int j = 0; j < indices.length; j++) {
            final colIdx = indices[j];
            rowData[headers[j]] = (colIdx < row.length) ? row[colIdx].toString() : '';
          }
          parsedData.add(rowData);
        }

        setState(() {
          _data = parsedData;
          _headers = headers;
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'خطأ في جلب البيانات من المصدر';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'حدث خطأ: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_error.isNotEmpty) return Center(child: Text(_error, style: const TextStyle(color: Colors.red)));
    if (_data.isEmpty) return const Center(child: Text('لا توجد بيانات', style: TextStyle(color: Colors.grey)));

    return RefreshIndicator(
      onRefresh: _fetchCsv,
      child: LayoutBuilder(
        builder: (context, constraints) {
          return SingleChildScrollView(
            scrollDirection: Axis.vertical,
            physics: const AlwaysScrollableScrollPhysics(),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: ConstrainedBox(
                constraints: BoxConstraints(minWidth: constraints.maxWidth),
                child: DataTable(
                  headingRowColor: MaterialStateProperty.all(Colors.indigo.withOpacity(0.05)),
                  dataRowMaxHeight: 60,
                  columns: _headers.map((h) => DataColumn(
                    label: Text(h, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo)),
                  )).toList(),
                  rows: _data.map((row) {
                    return DataRow(
                      cells: _headers.map((h) {
                        return DataCell(
                          Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: SelectableText(row[h] ?? '', style: const TextStyle(fontSize: 13)),
                          ),
                        );
                      }).toList(),
                    );
                  }).toList(),
                ),
              ),
            ),
          );
        }
      ),
    );
  }
}
