import re

filepath = "components/HardwareInventoryTable.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old = """    // معالجة خاصة لعمود الوقت - فرز بالتاريخ (سنة → شهر → يوم → وقت)
    if (sortConfig.key === 'وقت') {
      const parseDate = (val: string) => {
        const cleaned = val.replace(/[/]/g, '-').trim();
        const d = new Date(cleaned);
        return isNaN(d.getTime()) ? new Date(0) : d;
      };
      const aDate = parseDate(aValue);
      const bDate = parseDate(bValue);
      return sortConfig.direction === 'asc'
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }"""

new = """    // معالجة خاصة لعمود الوقت - فرز بالتاريخ (سنة → شهر → يوم → وقت)
    if (sortConfig.key === 'وقت') {
      const parseDate = (val: string) => {
        // دعم التنسيقات: MM/DD/YYYY HH:mm و YYYY/MM/DD HH:mm و YYYY-MM-DD HH:mm
        const m = val.match(/(\d{1,4})[\/-](\d{1,2})[\/-](\d{1,4})\s*(\d{1,2}):(\d{1,2})?(?::(\d{1,2}))?/);
        if (m) {
          const p1 = parseInt(m[1], 10);
          const p2 = parseInt(m[2], 10);
          const p3 = parseInt(m[3], 10);
          const hh = parseInt(m[4], 10);
          const mm = parseInt(m[5] || '0', 10);
          const ss = parseInt(m[6] || '0', 10);
          let year: number, month: number, day: number;
          if (p1 > 100) { year = p1; month = p2; day = p3; }
          else { year = p3; month = p1; day = p2; }
          return new Date(year, month - 1, day, hh, mm, ss);
        }
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date(0) : d;
      };
      const aDate = parseDate(aValue);
      const bDate = parseDate(bValue);
      return sortConfig.direction === 'asc'
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }"""

if old in content:
    content = content.replace(old, new)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Done!")
else:
    print("Target not found")
