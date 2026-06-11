import 'dart:io';

void main() {
  final content = File('lib/screens/admin_tabs.dart').readAsLinesSync();
  for (int i = 0; i < content.length; i++) {
    if (content[i].contains('showDialog')) {
      print('--- admin_tabs.dart Line ' + i.toString() + ' ---');
      for (int j = i - 2; j <= i + 10; j++) {
        if (j >= 0 && j < content.length) {
          print(content[j]);
        }
      }
    }
  }
}
