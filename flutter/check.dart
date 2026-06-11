import 'dart:io';

void main() {
  final content = File('lib/screens/server_list_screen.dart').readAsStringSync();
  print(content.substring(400, 1000));
}
