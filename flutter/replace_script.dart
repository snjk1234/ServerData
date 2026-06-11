import 'dart:io';

void main() {
  final adminTabsFile = File('lib/screens/admin_tabs.dart');
  final widgetFile = File('widget.dart');

  final adminTabsContent = adminTabsFile.readAsStringSync();
  final widgetContent = widgetFile.readAsStringSync();

  final startStr = 'class UsersManagementWidget extends StatefulWidget {';
  final endStr = '}';

  final startIndex = adminTabsContent.indexOf(startStr);
  final endIndex = adminTabsContent.lastIndexOf(endStr) + 1;

  if (startIndex >= 0 && endIndex > startIndex) {
    final newContent = adminTabsContent.substring(0, startIndex) + widgetContent;
    adminTabsFile.writeAsStringSync(newContent);
    print('Replaced successfully via Dart');
  } else {
    print('Failed to find indices');
  }
}
