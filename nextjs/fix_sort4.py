filepath = "components/HardwareInventoryTable.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old = """      return sortConfig.direction === 'asc'
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();"""

new = """      // عكس الاتجاه لعمود الوقت: asc = الاحدث اولا, desc = الاقدم اولا
      return sortConfig.direction === 'asc'
        ? bDate.getTime() - aDate.getTime()
        : aDate.getTime() - bDate.getTime();"""

if old in content:
    content = content.replace(old, new)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Done!")
else:
    print("Target not found")
