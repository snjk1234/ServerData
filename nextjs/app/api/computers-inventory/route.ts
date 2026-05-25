import { NextResponse } from 'next/server';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable Next.js caching

export async function GET() {
  try {
    const spreadsheetId = '1NycN1P-ZcMjEvR9vqx0GyOjfaq4FWpK2N3srpv4pWp4';
    const timestamp = Date.now();
    // Using the public CSV export URL
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0&t=${timestamp}`;
    
    const response = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CSV data from Google Sheets');
    }

    const csvText = await response.text();
    const parsed = Papa.parse(csvText, {
      header: false,
      skipEmptyLines: true,
    });
    
    const rows = parsed.data as string[][];

    if (rows.length < 2) {
      return NextResponse.json({ success: true, data: [], headers: [] });
    }

    // الأعمدة المتاحة حسب الشيت:
    // 0: رقم الفرع, 1: اسم الفرع, 2: المنطقة, 3: الكمبيوتر, 4: الشاشة, 5: الهارد, 6: المعالج, 7: الرام, 
    // 8: الطابعه الكبيره, 9: الطابعة الصغيرة, 10: الماسح الضوئي, 11: نوع الانترنت, 12: رقم الهاتف, 
    // 13: جهاز الكاميرات, 14: جهاز البصمة, 15: الموقع
    const allowedIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    const customHeaders = [
      "رقم الفرع", "اسم الفرع", "المنطقة", "الكمبيوتر", "الشاشة", "الهارد", "المعالج", "الرام", 
      "الطابعة الكبيرة", "الطابعة الصغيرة", "الماسح الضوئي", "نوع الانترنت", "رقم الهاتف", 
      "DVR", "البصمة", "الموقع"
    ];
    
    const data = rows.slice(1).map(row => {
      const obj: any = {};
      allowedIndices.forEach((colIdx, i) => {
        let val = row[colIdx] || '';
        obj[customHeaders[i]] = val.trim();
      });
      return obj;
    });

    return NextResponse.json({ success: true, data, headers: customHeaders });
  } catch (error: any) {
    console.error('Error fetching computers inventory data:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
