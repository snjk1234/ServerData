import io

with io.open('lib/screens/admin_tabs.dart', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'void _showPermissionsDialog' in line:
        for j in range(i, i + 60):
            if j < len(lines):
                print(lines[j], end='')
        break
