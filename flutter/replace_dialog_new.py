import io

with io.open('lib/screens/server_list_screen.dart', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start = -1
for i, line in enumerate(lines):
    if 'void _showServerDialog({ServerData? serverToEdit, required List<ServerData> allServers}) {' in line:
        start = i
        break

end = -1
if start != -1:
    brace_count = 0
    for i in range(start, len(lines)):
        brace_count += lines[i].count('{')
        brace_count -= lines[i].count('}')
        if brace_count == 0 and i > start:
            end = i
            break

if start != -1 and end != -1:
    new_method = '''  void _showServerDialog({ServerData? serverToEdit, required List<ServerData> allServers}) {
    import_server_dialog();
  }
'''
    new_method = """  void _showServerDialog({ServerData? serverToEdit, required List<ServerData> allServers}) {
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
  }\n"""
    
    new_lines = lines[:start] + [new_method] + lines[end+1:]
    with io.open('lib/screens/server_list_screen.dart', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Replaced successfully!")
else:
    print(f"Failed to find bounds. start={start}, end={end}")
