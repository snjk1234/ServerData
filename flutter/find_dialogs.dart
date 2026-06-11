import 'dart:io';

void main() {
  final content = File('lib/screens/admin_tabs.dart').readAsStringSync();
  final methods = ['showDialog', 'void _show'];
  for (var m in methods) {
    if (content.contains(m)) {
      print('Found \');
    }
  }
}
