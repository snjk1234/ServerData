import re

with open("app/account/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_pattern = r"filteredCats = categories\.filter\(cat =>\s+cat\.id === 'all' \|\| hasAll \|\| allowed\.includes\(cat\.id\)\s+\);"
new_code = "filteredCats = [...categories.filter(cat =>\n              cat.id === 'all' || hasAll || allowed.includes(cat.id)\n            ), { id: 'hardware', name: '\u062c\u0631\u062f \u0627\u0644\u0623\u062c\u0647\u0632\u0629' }];"

content = re.sub(old_pattern, new_code, content)

with open("app/account/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done!")
