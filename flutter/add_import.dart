import 'dart:io';

void main() {
  final content = File('lib/screens/server_list_screen.dart').readAsStringSync();
  if (!content.contains("import 'server_dialog.dart';")) {
    final lines = content.split('\n');
    int lastImport = 0;
    for (int i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImport = i;
      }
    }
    lines.insert(lastImport + 1, "import 'server_dialog.dart';");
    File('lib/screens/server_list_screen.dart').writeAsStringSync(lines.join('\n'));
  }
}
