import io

with io.open('lib/screens/server_list_screen.dart', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with io.open('dialog_content.dart', 'w', encoding='utf-8') as f:
    f.writelines(lines[63:444])
