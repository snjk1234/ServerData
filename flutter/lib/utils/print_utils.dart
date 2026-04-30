import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../models/server_data.dart';

class PrintUtils {
  static Future<void> printBranchFoundation(ServerData server) async {
    final doc = pw.Document();
    final arabicFont = await PdfGoogleFonts.amiriRegular();
    final arabicFontBold = await PdfGoogleFonts.amiriBold();

    final category = server.category;
    final isFranchise = category == 'فرنشايز';
    final isDistributor = category == 'موزع معتمد';
    final isFilanto = category == 'فيلانتو';
    
    String getTitle() {
      if (category == 'جملة') return 'تأسيس جملة فلورينا';
      if (category == 'موزع معتمد') return 'تأسيس موزع معتمد';
      return 'تأسيس فرع $category';
    }

    doc.addPage(
      pw.Page(
        margin: const pw.EdgeInsets.all(28), // approx 10mm
        theme: pw.ThemeData.withFont(
          base: arabicFont,
          bold: arabicFontBold,
        ),
        build: (pw.Context context) {
          return pw.Directionality(
            textDirection: pw.TextDirection.rtl,
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Center(
                  child: pw.Text(
                    getTitle(),
                    style: pw.TextStyle(
                      fontSize: 45,
                      fontWeight: pw.FontWeight.bold,
                      decoration: pw.TextDecoration.underline,
                    ),
                  ),
                ),
                pw.SizedBox(height: 20),
                
                // Header Table
                pw.Table(
                  columnWidths: {
                    0: const pw.FixedColumnWidth(140),
                    1: const pw.FlexColumnWidth(),
                    2: const pw.FixedColumnWidth(140),
                    3: const pw.FixedColumnWidth(100),
                  },
                  children: [
                    pw.TableRow(
                      children: [
                        _paddedCell('اسم الفرع:', isHeader: true),
                        _paddedCell('( ${server.branchNameAr} )  ( ${server.branchNameEn} )'),
                        _paddedCell('رقم الفرع:', isHeader: true),
                        _paddedCell(server.branchNo),
                      ],
                    ),
                    if (!(server.category == 'اسكتشر' || server.category == 'موزع معتمد'))
                      pw.TableRow(
                        children: [
                          _paddedCell('العنوان:', isHeader: true),
                          _paddedCell('( ${server.streetName ?? ''} )'),
                          if (!(server.category == 'فلورينا' || server.category == 'جملة')) ...[
                            _paddedCell('رقم الضريبي :', isHeader: true),
                            _paddedCell(server.taxNo ?? ''),
                          ] else ...[
                            _paddedCell(''),
                            _paddedCell(''),
                          ],
                        ],
                      ),
                    if (!(server.category == 'فلورينا' || server.category == 'جملة' || server.category == 'اسكتشر' || server.category == 'موزع معتمد'))
                      pw.TableRow(
                        children: [
                          _paddedCell('المدينة:', isHeader: true),
                          _paddedCell('( ${server.cityName ?? ''} )'),
                          _paddedCell('', isHeader: true),
                          _paddedCell(''),
                        ],
                      ),
                  ],
                ),
                pw.SizedBox(height: 20),

                // Points List
                if (isFranchise)
                  ..._buildFranchisePoints(server)
                else if (isDistributor)
                  ..._buildDistributorPoints(server)
                else
                  ..._buildStandardPoints(server),

                pw.Spacer(),
                
                // Footer
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('قفل الفروع = 0', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
                    pw.Text('قفل تحديث الاسعار = 1', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
                    pw.Text('الميزان لا يوجد ق', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );

    await Printing.layoutPdf(onLayout: (PdfPageFormat format) async => doc.save());
  }

  static List<pw.Widget> _buildFranchisePoints(ServerData server) {
    return [
      _point(1, 'إنشاء مجلد باسم الفرع في كلا من ( C:\\ prog ) و ( F:\\ data ) ووضع قواعد البيانات فيها'),
      _point(null, 'ووضع ملفات ( sales – return - trans – messages - coupons ) .', isSub: true),
      _point(2, 'إضافة الفرع في User عملاء المؤسسة'),
      _point(3, 'إضافة الفرع في قاعدة بيانات Data Updater ووضعه مقفلا .'),
      _point(4, 'إضافة الفرع في قاعدة SQL بيانات LOGINSR'),
      _point(5, 'إضافة الفرع في User برنامج التقارير في RTNFR وإضافة رقم المنطقة', extra: ' ${server.region}'),
      _point(6, 'إضافة بيانات الفرع في كلا من :'),
      _subPoint('Cgfdir *'),
      _subPoint('Brn : رقم الفرع – اسم الفرع الطابعات .', extra: '  ${server.printerBill}    ${server.printerA4}'),
      _subPoint('Hasbat : إضافة بطاقة قريب من افتتاح الفرع .'),
      _subPoint('UserFR * : تعديل اسم الفرع ومسار قواعد البيانات . وإختيار النوع(Type)', extra: ' 1 فرنشايز'),
      _subPoint('إضافة رقم السيريال في قاعدة SQL *', extra: ' ${server.serialNumber}'),
      _subPoint('PIND * : تغير رقم السري الخاص المرتجعات لمدير المنطقة'),
      _point(7, 'عمل اسم مستخدم للفرع'),
      _point(8, 'تحديد برنامج للمستخدم .'),
      _point(9, 'تجربة البرنامج .'),
    ];
  }

  static List<pw.Widget> _buildStandardPoints(ServerData server) {
    final isFilanto = server.category == 'فيلانتو';
    final path = isFilanto ? 'C:\\ prog' : 'F:\\ prog';
    
    return [
      _point(1, 'إنشاء مجلد باسم الفرع في كلا من ( $path ) و ( F:\\ data ) ووضع قواعد البيانات فيها'),
      _point(null, 'ووضع ملفات ( sales – return - trans – messages - coupons ) .', isSub: true),
      _point(2, 'إضافة الفرع في جميع User المتواجدة في السيرفرات في RTN مجلد الفروع ومجلد اسد ووضع القفل على صفر'),
      _point(3, 'إضافة الفرع في User برنامج التقارير في RTN واضافة رقم المنطقة', extra: ' ${server.region}  والقفل صفر .'),
      _point(4, 'إضافة الفرع في قاعدة بيانات Data Updater ووضعه مقفلا . بعد تحويل صنف لها'),
      _point(5, 'إضافة الفرع في قاعدة SQL بيانات LOGINSR'),
      _point(6, 'إضافة بيانات الفرع في كلا من :'),
      _subPoint('Cgfdir * :'),
      _subPoint('Brn : رقم الفرع – اسم الفرع – صندوق الفرع – شبكة الفرع- هدايا الفرع - تالف الفرع'),
      _subPoint('خصومات الفرع - الطابعات .', extra: '  ${server.printerBill}    ${server.printerA4}'),
      _subPoint('Hasbat : إضافة بطاقة قريب من افتتاح الفرع .'),
      _subPoint('User * : تعديل اسم الفرع ومسار قواعد البيانات .'),
      _subPoint('Months : إضافة رقم صندوق الفرع ورقم القيد والعنوان والمنطقة'),
      _subPoint('العنوان :'),
      _subPoint('إضافة رقم السيريال في قاعدة SQL *', extra: ' ${server.serialNumber}'),
      _subPoint('NCS : إضافة المصاريف في masacc'),
      _subPoint('PIND: تغير رقم السري الخاص المرتجعات لمدير المنطقة'),
      _point(7, 'عمل مستوى ثاني في قاعدة بيانات (ACC) لمصاريف الفرع وجعل المستوى الاول رئيسي .'),
      _point(8, 'عمل اسم مستخدم للفرع مع الغاء خاصية ربط الأجهزة بالسيرفر'),
      _point(9, 'تحديد برنامج للمستخدم .'),
      _point(10, 'تجربة البرنامج .'),
    ];
  }

  static List<pw.Widget> _buildDistributorPoints(ServerData server) {
    return [
      _point(1, 'إنشاء مجلد باسم الفرع في كلا من ( C:\\ prog ) و ( F:\\ data ) ووضع قواعد البيانات فيها.'),
      _point(null, 'ووضع ملفات ( sales – return - trans – messages - coupons ) .', isSub: true),
      _point(2, 'إضافة الفرع في User الجملة الخاصة بها', extra: ' جملة المدينة'),
      _point(3, 'إضافة الفرع في User تبع التقارير في RTNFR واضافة رقم المنطقة', extra: ' 1'),
      _point(4, 'إضافة الفرع في قاعدة SQL بيانات LOGINSR'),
      _point(5, 'إضافة بيانات الفرع في كلا من :'),
      _subPoint('Cgfdir *'),
      _subPoint('Brn : رقم الفرع – اسم الفرع . الطابعات .', extra: '  ${server.printerBill}    ${server.printerA4}'),
      _subPoint('Hasbat : إضافة بطاقة قريب من افتتاح الفرع .'),
      _subPoint('UserFR * : تعديل اسم الفرع ومسار قواعد البيانات . وإختيار النوع(Type)', extra: ' 2 للعملاء'),
      _subPoint('إضافة رقم السيريال في قاعدة SQL *', extra: ' ${server.serialNumber}'),
      _subPoint('PIND * : تغير رقم السري الخاص بـ المرتجعات لمدير المنطقة'),
      _point(6, 'إضافة (اسم المؤسسة – الرقم الضريبي – عنوان العميل ) في USERFR تبع الفرع في الجدول RTN'),
      _point(7, 'عمل اسم مستخدم للفرع'),
      _point(8, 'تحديد برنامج للمستخدم .'),
      _point(9, 'تجربة البرنامج .'),
      _point(10, 'إضافة الفرع في ملف التحديث RTNFR = UPDATER بعد تحويل صنف'),
    ];
  }

  static pw.Widget _point(int? number, String text, {bool isSub = false, String? extra}) {
    return pw.Padding(
      padding: pw.EdgeInsets.only(top: 4, right: isSub ? 30 : 0),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          if (!isSub) pw.Container(width: 35, child: pw.Text('${number ?? ''}-', style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold))),
          pw.Expanded(
            child: pw.RichText(
              softWrap: false,
              text: pw.TextSpan(
                style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold),
                children: [
                  pw.TextSpan(text: text),
                  if (extra != null)
                    pw.TextSpan(
                      text: extra,
                      style: pw.TextStyle(
                        fontWeight: pw.FontWeight.bold, 
                        fontSize: 20,
                        font: pw.Font.helveticaBold(),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  static pw.Widget _subPoint(String text, {String? extra}) {
    return pw.Padding(
      padding: pw.EdgeInsets.only(top: 2, right: 50),
      child: pw.Row(
        children: [
          pw.Text('* ', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 20)),
          pw.Expanded(
            child: pw.RichText(
              softWrap: false,
              text: pw.TextSpan(
                style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold),
                children: [
                  pw.TextSpan(text: text),
                  if (extra != null)
                    pw.TextSpan(
                      text: extra,
                      style: pw.TextStyle(
                        fontWeight: pw.FontWeight.bold, 
                        fontSize: 20,
                        font: pw.Font.helveticaBold(),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  static pw.Widget _paddedCell(String text, {bool isHeader = false}) {
    return pw.Container(
      padding: const pw.EdgeInsets.all(5),
      child: pw.Text(
        text,
        style: pw.TextStyle(
          fontWeight: pw.FontWeight.black,
          fontSize: isHeader ? 22 : 18,
          font: !isHeader ? pw.Font.helveticaBold() : null,
        ),
        textAlign: pw.TextAlign.right,
      ),
    );
  }
}
