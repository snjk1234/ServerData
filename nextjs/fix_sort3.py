filepath = "app/api/hardware-inventory/route.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old = """    const data = rows.slice(1).map(row => {
      const obj: any = {};
      allowedIndices.forEach((colIdx, i) => {
        obj[customHeaders[i] || `col_${i}`] = row[colIdx] || '';
      });
      return obj;
    });"""

new = """    const data = rows.slice(1).map(row => {
      const obj: any = {};
      allowedIndices.forEach((colIdx, i) => {
        let val = row[colIdx] || '';
        // تحويل الطابع الزمني (العمود الاول) الى تنسيق YYYY-MM-DD HH:mm
        if (i === 0 && val) {
          const d = new Date(val);
          if (!isNaN(d.getTime())) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const mi = String(d.getMinutes()).padStart(2, '0');
            const ss = String(d.getSeconds()).padStart(2, '0');
            val = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
          }
        }
        obj[customHeaders[i] || `col_${i}`] = val;
      });
      return obj;
    });"""

if old in content:
    content = content.replace(old, new)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Done!")
else:
    print("Target not found")
