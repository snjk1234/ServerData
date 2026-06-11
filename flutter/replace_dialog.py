import os

filepath = r'g:\ServerData\flutter\lib\screens\server_list_screen.dart'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find start of showDialog
start_idx = -1
for i, line in enumerate(lines):
    if 'showDialog(' in line and 'builder: (context) => StatefulBuilder(' in lines[i+2]:
        start_idx = i
        break

if start_idx == -1:
    print('Could not find start of showDialog')
    exit(1)

# Find end of showDialog
end_idx = -1
braces = 0
for i in range(start_idx, len(lines)):
    line = lines[i]
    if '(' in line:
        braces += line.count('(')
    if ')' in line:
        braces -= line.count(')')
    
    # Check if we hit the line     ); that closes showDialog
    if braces == 0 and ');' in line and i > start_idx + 10:
        end_idx = i
        break

if end_idx == -1:
    print('Could not find end of showDialog')
    exit(1)

print(f'Replacing lines {start_idx} to {end_idx}')

new_content = '''    InputDecoration customInputDecoration(String label, IconData icon, {Widget? suffixIcon}) {
      return InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Colors.grey[600], fontSize: 14),
        prefixIcon: Icon(icon, color: Colors.indigo[300], size: 22),
        suffixIcon: suffixIcon,
        filled: true,
        fillColor: Colors.grey[50],
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: BorderSide(color: Colors.grey[200]!, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: const BorderSide(color: Colors.indigo, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(15),
          borderSide: const BorderSide(color: Colors.red, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      );
    }

    Widget sectionHeader(String title, IconData icon) {
      return Padding(
        padding: const EdgeInsets.only(top: 24, bottom: 16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: Colors.indigo.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
              child: Icon(icon, color: Colors.indigo, size: 20),
            ),
            const SizedBox(width: 10),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.indigo)),
          ],
        ),
      );
    }

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
          elevation: 0,
          backgroundColor: Colors.transparent,
          child: Container(
            constraints: const BoxConstraints(maxWidth: 800),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(25),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, 10)),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: const BoxDecoration(
                    color: Colors.indigo,
                    borderRadius: BorderRadius.only(topLeft: Radius.circular(25), topRight: Radius.circular(25)),
                  ),
                  child: Row(
                    children: [
                      Icon(serverToEdit != null ? Icons.edit_document : Icons.add_circle, color: Colors.white, size: 28),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          serverToEdit != null ? 'تعديل سيرفر ()' : 'إضافة سيرفر جديد',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 22, color: Colors.white),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                ),
                Flexible(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        sectionHeader('البيانات الأساسية', Icons.info_outline),
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: selectedCategory,
                                decoration: customInputDecoration('تصنيف الفرع', Icons.category),
                                items: ['فلورينا', 'فرنشايز', 'جملة', 'موزع معتمد', 'اسكتشر', 'فيلانتو', 'الإدارة', 'كمبيوتر وملحقات'].map((c) {
                                  return DropdownMenuItem(value: c, child: Text(c));
                                }).toList(),
                                onChanged: (val) {
                                  setDialogState(() {
                                    selectedCategory = val!;
                                    if (serverToEdit == null) {
                                      branchNoEdited = false;
                                      updateAutoGeneratedFields(selectedCategory);
                                    }
                                  });
                                },
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: TextField(
                                controller: branchNoController,
                                decoration: customInputDecoration('رقم الفرع', Icons.numbers),
                                onChanged: (v) => branchNoEdited = true,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: nameArController,
                                decoration: customInputDecoration('اسم الفرع بالعربي', Icons.store),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: TextField(
                                controller: nameEnController,
                                decoration: customInputDecoration('اسم الفرع بالإنجليزي', Icons.store_outlined),
                                textCapitalization: TextCapitalization.characters,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: usernameController,
                                decoration: customInputDecoration('اسم اليوزر', Icons.person),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: TextField(
                                controller: passwordController,
                                obscureText: obscurePassword,
                                decoration: customInputDecoration(
                                  serverToEdit != null ? 'كلمة سر جديدة (اختياري)' : 'الباسوورد للسيرفر',
                                  Icons.lock,
                                  suffixIcon: IconButton(
                                    icon: Icon(obscurePassword ? Icons.visibility_off : Icons.visibility, color: Colors.grey),
                                    onPressed: () => setDialogState(() => obscurePassword = !obscurePassword),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        sectionHeader('حالة ومعلومات الفرع', Icons.business_center),
                        Row(
                          children: [
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: selectedStatus,
                                decoration: customInputDecoration('حالة الفرع', Icons.toggle_on),
                                items: ['يعمل', 'الافتتاح قريبا', 'مغلق مؤقتا', 'مغلق نهائيا'].map((s) {
                                  return DropdownMenuItem(value: s, child: Text(s));
                                }).toList(),
                                onChanged: (val) => setDialogState(() => selectedStatus = val!),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: DropdownButtonFormField<String>(
                                value: selectedRegion,
                                decoration: customInputDecoration('المنطقة', Icons.map),
                                items: _regions.map((r) => DropdownMenuItem(value: r, child: Text(r))).toList(),
                                onChanged: (val) => setDialogState(() => selectedRegion = val),
                              ),
                            ),
                          ],
                        ),
                        if (selectedCategory != 'الإدارة') ...[
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: serialController,
                                  keyboardType: TextInputType.number,
                                  decoration: customInputDecoration('التسلسل (Serial Number)', Icons.confirmation_number),
                                ),
                              ),
                              const SizedBox(width: 16),
                              const Expanded(child: SizedBox()),
                            ],
                          ),
                        ],
                        sectionHeader('بيانات إضافية وموقع', Icons.location_on),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: streetController,
                                decoration: customInputDecoration('اسم الشارع', Icons.streetview, suffixIcon: _getRequiredFields(selectedCategory)['street']! ? const Icon(Icons.star, color: Colors.red, size: 12) : null),
                                enabled: _getRequiredFields(selectedCategory)['street']! || _getRequiredFields(selectedCategory)['city']!,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: TextField(
                                controller: cityController,
                                decoration: customInputDecoration('اسم المدينة', Icons.location_city, suffixIcon: _getRequiredFields(selectedCategory)['city']! ? const Icon(Icons.star, color: Colors.red, size: 12) : null),
                                enabled: _getRequiredFields(selectedCategory)['street']! || _getRequiredFields(selectedCategory)['city']!,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: taxNoController,
                                decoration: customInputDecoration('الرقم الضريبي', Icons.receipt, suffixIcon: _getRequiredFields(selectedCategory)['taxNo']! ? const Icon(Icons.star, color: Colors.red, size: 12) : null),
                                enabled: _getRequiredFields(selectedCategory)['taxNo']!,
                              ),
                            ),
                            const SizedBox(width: 16),
                            const Expanded(child: SizedBox()),
                          ],
                        ),
                        if (selectedCategory != 'الإدارة') ...[
                          sectionHeader('بيانات الطابعات', Icons.print),
                          Row(
                            children: [
                              Expanded(
                                child: TextField(
                                  controller: printerA4Controller,
                                  decoration: customInputDecoration('طابعة A4', Icons.print),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: TextField(
                                  controller: printerBillController,
                                  decoration: customInputDecoration('طابعة الفواتير', Icons.receipt_long),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(25), bottomRight: Radius.circular(25)),
                    border: Border(top: BorderSide(color: Colors.grey[200]!)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('إلغاء', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 16)),
                      ),
                      const SizedBox(width: 16),
                      ElevatedButton.icon(
                        onPressed: () async {
                          if (branchNoController.text.isEmpty ||
                              nameArController.text.isEmpty ||
                              nameEnController.text.isEmpty ||
                              usernameController.text.isEmpty ||
                              (serverToEdit == null && passwordController.text.isEmpty)) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('يرجى إدخال الحقول المطلوبة')),
                            );
                            return;
                          }

                          if (selectedCategory != 'الإدارة' && nameEnController.text.length < 4) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('اسم الفرع بالإنجليزية يجب أن يكون 4 أحرف على الأقل')),
                            );
                            return;
                          }

                          if (selectedCategory != 'الإدارة' && printerA4Controller.text.isNotEmpty && printerA4Controller.text.length != 12) {
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
                            
                            if (selectedCategory != 'الإدارة') {
                              final duplicate = freshServers.firstWhere(
                                (s) => s.id != (serverToEdit?.id ?? -1) && 
                                       ((s.printerA4 == printerA4Controller.text && printerA4Controller.text.isNotEmpty) ||
                                        (s.printerBill == printerBillController.text && printerBillController.text.isNotEmpty)),
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
                                        'اسم الطابعة مستخدم مسبقاً في:\n() - ',
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
                            }

                            String? encryptedPass;
                            if (passwordController.text.isNotEmpty) {
                              encryptedPass = encryptAESCryptoJS(passwordController.text, adminKey);
                            } else {
                              encryptedPass = serverToEdit?.encryptedPassword;
                            }

                            final dataPayload = {
                              'رقم_الفرع': branchNoController.text,
                              'تصنيف_الفرع': selectedCategory,
                              'اسم_الفرع_ar': nameArController.text,
                              'اسم_الفرع_en': nameEnController.text.toUpperCase(),
                              'اسم_اليوزر': usernameController.text,
                              'باسوورد': encryptedPass,
                              'حالة_اليوزر': selectedStatus,
                              'serial_number': selectedCategory == 'الإدارة' ? null : (int.tryParse(serialController.text) ?? 100000),
                              'المنطقة': selectedRegion,
                              'اسم_الشارع': streetController.text.isEmpty ? null : streetController.text,
                              'اسم_المدينة': cityController.text.isEmpty ? null : cityController.text,
                              'الرقم_الضريبي': selectedCategory == 'الإدارة' ? null : (taxNoController.text.isEmpty ? null : taxNoController.text),
                              'طابعة_a4': selectedCategory == 'الإدارة' ? null : printerA4Controller.text,
                              'طابعة_فواتير': selectedCategory == 'الإدارة' ? null : printerBillController.text,
                            };

                            if (serverToEdit == null) {
                              await Supabase.instance.client.from('server_data').insert(dataPayload);
                            } else {
                              await Supabase.instance.client.from('server_data').update(dataPayload).eq('id', serverToEdit.id);
                            }

                            if (context.mounted) {
                              Navigator.pop(context); 
                              ref.read(serverDataNotifierProvider.notifier).refreshServers();
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(serverToEdit == null ? 'تم حفظ بيانات الفرع بنجاح' : 'تم تحديث بيانات الفرع بنجاح', style: const TextStyle(fontWeight: FontWeight.bold)),
                                  backgroundColor: Colors.indigo[600],
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              );
                            }
                          } catch (e) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('حدث خطأ أثناء الحفظ: ')),
                              );
                            }
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.indigo,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                          elevation: 2,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: Icon(serverToEdit == null ? Icons.save : Icons.update, size: 20),
                        label: Text(
                          serverToEdit == null ? 'إضافة الفرع' : 'حفظ التعديلات',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
'''

# ensure a newline at end
new_content += '\n'

lines = lines[:start_idx] + [new_content] + lines[end_idx+1:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Success')
