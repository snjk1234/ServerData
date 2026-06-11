import 'dart:io';

void main() {
  final content = File('lib/screens/server_list_screen.dart').readAsStringSync();
  final start = content.indexOf('void _showPermissionsDialog(');
  if (start == -1) {
    print('Not found');
    return;
  }
  
  final lines = content.substring(start, start + 1500).split('\n');
  for (int i = 0; i < 30; i++) {
    if (i < lines.length) {
      print(lines[i]);
    }
  }
}
