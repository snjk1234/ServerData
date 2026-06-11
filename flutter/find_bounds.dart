import 'dart:io';

void main() {
  final content = File('lib/screens/server_list_screen.dart').readAsLinesSync();
  int start = -1;
  int end = -1;
  
  for(int i = 0; i < content.length; i++) {
    if (content[i].contains('void _showServerDialog({ServerData? serverToEdit')) {
      start = i + 1;
    }
  }
  
  if (start != -1) {
    int braceCount = 0;
    for (int i = start - 1; i < content.length; i++) {
      braceCount += '\'.split('{').length - 1;
      braceCount -= '\'.split('}').length - 1;
      if (braceCount == 0) {
        end = i + 1;
        break;
      }
    }
  }
  print('start=\, end=\');
}
