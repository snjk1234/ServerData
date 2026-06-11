import 'dart:io';

void main() {
  final content = File('lib/screens/server_list_screen.dart').readAsStringSync();
  final start = content.indexOf('void _showServerDialog');
  final end = content.indexOf('void _showPermissionsDialog');
  int finalEnd = end != -1 ? end : content.indexOf('Widget build(BuildContext context)');
  print(content.substring(start, start + 1000));
}
