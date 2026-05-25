import re

filepath = "components/HardwareInventoryTable.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Find the line number of the comment about number conversion
lines = content.split("\n")
found_idx = -1
for i, line in enumerate(lines):
    if "محاولة تحويل القيم إلى أرقام" in line:
        found_idx = i
        break

if found_idx == -1:
    print("Target comment not found!")
else:
    print(f"Found at line {found_idx + 1}")
    # Build the new code block to insert before the found line
    insert_lines = [
        "    // معالجة خاصة لعمود الوقت - فرز بالتاريخ (سنة → شهر → يوم → وقت)",
        "    if (sortConfig.key === 'وقت') {",
        "      const parseDate = (val: string) => {",
        "        const cleaned = val.replace(/[/]/g, '-').trim();",
        "        const d = new Date(cleaned);",
        "        return isNaN(d.getTime()) ? new Date(0) : d;",
        "      };",
        "      const aDate = parseDate(aValue);",
        "      const bDate = parseDate(bValue);",
        "      return sortConfig.direction === 'asc'",
        "        ? aDate.getTime() - bDate.getTime()",
        "        : bDate.getTime() - aDate.getTime();",
        "    }",
        "",
    ]
    # Insert before the found line
    lines = lines[:found_idx] + insert_lines + lines[found_idx:]
    content = "\n".join(lines)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Done!")
