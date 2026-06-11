import io

with io.open('lib/screens/server_list_screen.dart', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if 'void _showServerDialog(' in line:
        start_idx = i
        break

if start_idx != -1:
    # Find the end of the method by counting braces
    brace_count = 0
    for i in range(start_idx, len(lines)):
        brace_count += lines[i].count('{')
        brace_count -= lines[i].count('}')
        if brace_count == 0 and i > start_idx:
            end_idx = i
            break

print(f"Start: {start_idx}, End: {end_idx}")
