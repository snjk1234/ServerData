import { NextResponse } from 'next/server';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable Next.js caching

function parseArabicDateTime(val: string): Date {
  if (!val) return new Date(0);
  
  // Clean up and normalize multiple spaces
  let cleanVal = val.trim().replace(/\s+/g, ' ');
  
  // Detect PM/AM in both Arabic and English formats
  const isPM = cleanVal.includes('م') || cleanVal.toLowerCase().includes('pm') || cleanVal.includes('??');
  const isAM = cleanVal.includes('ص') || cleanVal.toLowerCase().includes('am');
  
  // Remove indicators to leave only numbers and separators
  cleanVal = cleanVal.replace(/[مصص\?]|pm|am/gi, '').trim();
  
  const parts = cleanVal.split(' ');
  let datePart = '';
  let timePart = '';
  
  parts.forEach(part => {
    if (part.includes('/') || part.includes('-')) {
      datePart = part;
    } else if (part.includes(':')) {
      timePart = part;
    }
  });
  
  let year = 1970, month = 0, day = 1;
  let hours = 0, minutes = 0, seconds = 0;
  
  if (datePart) {
    const dParts = datePart.split(/[\/-]/);
    if (dParts.length === 3) {
      const p1 = parseInt(dParts[0], 10) || 0;
      const p2 = parseInt(dParts[1], 10) || 0;
      const p3 = parseInt(dParts[2], 10) || 0;
      
      if (p1 > 100) {
        // YYYY-MM-DD
        year = p1;
        month = p2 - 1;
        day = p3;
      } else if (p3 > 100) {
        // DD/MM/YYYY or MM/DD/YYYY
        year = p3;
        if (p2 > 12) {
          // MM/DD/YYYY
          month = p1 - 1;
          day = p2;
        } else {
          // Default to DD/MM/YYYY
          month = p2 - 1;
          day = p1;
        }
      }
    }
  }
  
  if (timePart) {
    const tParts = timePart.split(':');
    hours = parseInt(tParts[0], 10) || 0;
    minutes = parseInt(tParts[1], 10) || 0;
    seconds = parseInt(tParts[2], 10) || 0;
    
    if (isPM && hours < 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }
  }
  
  const parsedDate = new Date(year, month, day, hours, minutes, seconds);
  return isNaN(parsedDate.getTime()) ? new Date(0) : parsedDate;
}

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME;

    let rows: string[][] = [];

    if (apiKey && apiKey !== 'YOUR_API_KEY_HERE' && spreadsheetId && sheetName) {
      // Use Google Sheets API v4 (Instant Sync)
      const range = encodeURIComponent(`${sheetName}!A:AJ`);
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
      
      const response = await fetch(url, { 
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Google Sheets API Error Details:', errText);
        throw new Error(`Google Sheets API returned status ${response.status}`);
      }

      const result = await response.json();
      rows = (result.values || []) as string[][];
    } else {
      // Graceful fallback to Public CSV publishing if API key is not configured
      console.warn('Google Sheets API key or spreadsheet configuration not fully set. Falling back to public CSV URL.');
      const timestamp = Date.now();
      const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vT5ngevFTz20Fi7JG_JKIe4ZnYmVEGpUZtL_5INutfSNI3PqCO7F3J9rkdDWN9LtA6pLnisoar0-v7C/pub?gid=806274198&single=true&output=csv&t=${timestamp}`;
      
      const response = await fetch(url, { 
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSV data from Google Sheets public fallback');
      }

      const csvText = await response.text();
      const parsed = Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
      });
      rows = parsed.data as string[][];
    }

    if (rows.length < 2) {
      return NextResponse.json({ success: true, data: [], headers: [] });
    }

    // الأعمدة المسموحة بناءً على طلبك:
    // 0 (طابع زمني)، 2 إلى 4 (المشرف، المنطقة، الفرع)
    // 15 إلى 35 (من نوع الكمبيوتر إلى الملاحظات)
    // يتم استبعاد الباسوورد (1) و F إلى O (5 إلى 15) وأي عمود بعد AJ (35)
    const allowedIndices = [0, 2, 3, 4, ...Array.from({length: 21}, (_, i) => i + 16)];

    const customHeaders = [
      "وقت", "المشرف", "المنطقة", "الفرع", 
      "الكمبيرتر", "الشاشة", "الكيبورد", "الماوس", " قارئ الباركود", 
      " قارئ VIP", "السكنر A4", "طابعة A4", "طابعة الفواتير", 
      "شاشة داخلية", "شاشة خارجية", "عدد الكاميرات", "DVR", 
      "شاشة للكاميرات", "نوع شاشة الكاميرات", "البصمة", "الانترنت", 
      "سويتش", "اسم المسئول", "جوال", "ملاحظات"
    ];
    
    const data = rows.slice(1).map(row => {
      const obj: any = {};
      allowedIndices.forEach((colIdx, i) => {
        let val = row[colIdx] || '';
        // تحويل الطابع الزمني (العمود الاول) الى تنسيق YYYY-MM-DD HH:mm:ss
        if (i === 0 && val) {
          const d = parseArabicDateTime(val);
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
    });

    return NextResponse.json({ success: true, data, headers: customHeaders });
  } catch (error: any) {
    console.error('Error fetching sheets data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
