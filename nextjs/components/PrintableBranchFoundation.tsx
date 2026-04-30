import React from 'react';

interface Props {
  server: any;
}

const PrintableBranchFoundation: React.FC<Props> = ({ server }) => {
  const category = server.تصنيف_الفرع;
  
  const isFranchise = category === 'فرنشايز';
  const isFilanto = category === 'فيلانتو';
  const isFlorina = category === 'فلورينا';
  const isJomla = category === 'جملة';
  const isSketsher = category === 'اسكتشر';
  const isDistributor = category === 'موزع معتمد';

  if (!isFranchise && !isFilanto && !isFlorina && !isJomla && !isSketsher && !isDistributor) return null;

  const getTitle = () => {
    if (isJomla) return 'تأسيس جملة فلورينا';
    if (isDistributor) return 'تأسيس موزع معتمد';
    return `تأسيس فرع ${category}`;
  };

  return (
    <div id="printable-foundation" className="hidden print:block p-4 font-serif bg-white min-h-screen" dir="rtl">
      <h1 className="text-center text-5xl font-black underline mb-8 mt-4">
        {getTitle()}
      </h1>

      <table className="w-full mb-12">
        <tbody>
          <tr>
            <td className="p-2 font-black text-3xl text-right w-44 whitespace-nowrap">اسم الفرع:</td>
            <td className="p-2 text-2xl font-black">
              ( {server.اسم_الفرع_ar} ) ( {server.اسم_الفرع_en} )
            </td>
            <td className="p-2 font-black text-3xl text-right w-44 whitespace-nowrap">رقم الفرع:</td>
            <td className="p-2 text-2xl font-black font-sans">
              {server.رقم_الفرع}
            </td>
          </tr>
          {/* Row 2: Address and Tax No */}
          {!(isSketsher || isDistributor) && (
            <tr>
              <td className="p-2 font-black text-3xl text-right whitespace-nowrap">العنوان:</td>
              <td className="p-2 text-2xl font-black">
                ( {server.اسم_الشارع || '—'} )
              </td>
              {!(isFlorina || isJomla) && (
                <>
                  <td className="p-2 font-black text-3xl text-right whitespace-nowrap">رقم الضريبي:</td>
                  <td className="p-2 text-2xl font-black font-sans text-center">
                    {server.الرقم_الضريبي || '—'}
                  </td>
                </>
              )}
              {(isFlorina || isJomla) && (
                <>
                  <td className="p-2"></td>
                  <td className="p-2"></td>
                </>
              )}
            </tr>
          )}

          {/* Row 3: City */}
          {!(isFlorina || isJomla || isSketsher || isDistributor) && (
            <tr>
              <td className="p-2 font-black text-3xl text-right whitespace-nowrap">المدينة:</td>
              <td className="p-2 text-2xl font-black">
                ( {server.اسم_المدينة || '—'} )
              </td>
              <td className="p-2 font-black text-3xl text-right"></td>
              <td className="p-2"></td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="space-y-4 text-[21px] leading-tight font-bold whitespace-nowrap">
        {/* Case 1: Franchise */}
        {isFranchise && (
          <>
            <p>1- إنشاء مجلد باسم الفرع في كلا من (C:\prog) و (F:\data) ووضع قواعد البيانات فيها.</p>
            <p className="mr-6">ووضع ملفات ( sales – return - trans – messages - coupons ) .</p>
            <p>2- إضافة الفرع في User عملاء المؤسسة</p>
            <p>3- إضافة الفرع في قاعدة بيانات Data Updater ووضعه مقفلا .</p>
            <p>4- إضافة الفرع في قاعدة SQL بيانات LOGINSR</p>
            <div className="flex items-center gap-2 mr-8">
              <span>5- إضافة الفرع في User برنامج التقارير في RTNFR وإضافة رقم المنطقة</span>
              <span className="font-black px-2 font-sans">{server.المنطقة}</span>
            </div>
            <p>6- إضافة بيانات الفرع في كلا من :</p>
            <p className="mr-8">* Cgfdir</p>
            <div className="flex items-center gap-2 mr-8">
              <span>* Brn : رقم الفرع – اسم الفرع الطابعات .</span>
              <span className="font-black px-4 py-1">{server.طابعة_فواتير} &nbsp;&nbsp;&nbsp;&nbsp; {server.طابعة_a4}</span>
            </div>
            <p className="mr-8">* Hasbat : إضافة بطاقة قريب من افتتاح الفرع .</p>
            <div className="flex items-center gap-2 mr-8">
              <span>* UserFR : تعديل اسم الفرع ومسار قواعد البيانات . وإختيار النوع(Type)</span>
              <span className="font-black px-2">1 فرنشايز</span>
            </div>
            <div className="flex items-center gap-2 mr-8">
              <span>* إضافة رقم السيريال في قاعدة SQL</span>
              <span className="font-black px-2 font-sans">{server.serial_number}</span>
            </div>
            <p className="mr-8">* PIND : تغير رقم السري الخاص المرتجعات لمدير المنطقة</p>
            <p>7- عمل اسم مستخدم للفرع</p>
            <p>8- تحديد برنامج للمستخدم .</p>
            <p>9- تجربة البرنامج .</p>
          </>
        )}

        {/* Case 2: Filanto / Florina / Jomla / Sketsher */}
        {(isFilanto || isFlorina || isJomla || isSketsher) && (
          <>
            <p>1- إنشاء مجلد باسم الفرع في كلا من ({isFilanto ? 'C:\\prog' : 'F:\\prog'}) و (F:\data) ووضع قواعد البيانات فيها.</p>
            <p className="mr-6">ووضع ملفات ( sales – return - trans – messages - coupons ) .</p>
            <p>2- إضافة الفرع في جميع User المتواجدة في السيرفرات في RTN مجلد الفروع ومجلد اسد ووضع القفل على صفر</p>
            <div className="flex items-center gap-2">
              <span>3- إضافة الفرع في User برنامج التقارير في RTN وإضافة رقم المنطقة</span>
              <span className="font-black px-2 font-sans">{server.المنطقة}</span>
              <span>والقفل صفر .</span>
            </div>
            <p>4- إضافة الفرع في قاعدة بيانات Data Updater ووضعه مقفلا . بعد تحويل صنف لها</p>
            <p>5- إضافة الفرع في قاعدة SQL بيانات LOGINSR</p>
            <p>6- إضافة بيانات الفرع في كلا من :</p>
            <p className="mr-8">* Cgfdir :</p>
            <p className="mr-8">* Brn : رقم الفرع – اسم الفرع – صندوق الفرع – شبكة الفرع - هدايا الفرع - تالف الفرع</p>
            <div className="flex items-center gap-2 mr-8">
              <span>خصومات الفرع - الطابعات .</span>
              <span className="font-black px-4 py-1">{server.طابعة_فواتير} &nbsp;&nbsp;&nbsp;&nbsp; {server.طابعة_a4}</span>
            </div>
            <p className="mr-8">* Hasbat : إضافة بطاقة قريب من افتتاح الفرع .</p>
            <p className="mr-8">* User : تعديل اسم الفرع ومسار قواعد البيانات .</p>
            <p className="mr-8">* Months : إضافة رقم صندوق الفرع ورقم القيد والعنوان والمنطقة</p>
            <p className="mr-8">* العنوان :</p>
            <div className="flex items-center gap-2 mr-8">
              <span>* إضافة رقم السيريال في قاعدة SQL</span>
              <span className="font-black px-2 font-sans">{server.serial_number}</span>
            </div>
            <p className="mr-8">* NCS : إضافة المصاريف في masacc</p>
            <p className="mr-8">* PIND : تغير رقم السري الخاص المرتجعات لمدير المنطقة</p>
            <p>7- عمل مستوى ثاني في قاعدة بيانات (ACC) لمصاريف الفرع وجعل المستوى الاول رئيسي .</p>
            <p>8- عمل اسم مستخدم للفرع مع الغاء خاصية ربط الأجهزة بالسيرفر</p>
            <p>9- تحديد برنامج للمستخدم .</p>
            <p>10- تجربة البرنامج .</p>
          </>
        )}

        {/* Case 3: Authorized Distributor */}
        {isDistributor && (
          <>
            <p>1- إنشاء مجلد باسم الفرع في كلا من (C:\prog) و (F:\data) ووضع قواعد البيانات فيها.</p>
            <p className="mr-6">ووضع ملفات ( sales – return - trans – messages - coupons ) .</p>
            <div className="flex items-center gap-2">
              <span>2- إضافة الفرع في User الجملة الخاصة بها</span>
              <span className="font-black px-2 font-sans">جملة المدينة</span>
            </div>
            <div className="flex items-center gap-2">
              <span>3- إضافة الفرع في User تبع التقارير في RTNFR واضافة رقم المنطقة</span>
              <span className="font-black px-2 font-sans">1</span>
            </div>
            <p>4- إضافة الفرع في قاعدة SQL بيانات LOGINSR</p>
            <p>5- إضافة بيانات الفرع في كلا من :</p>
            <p className="mr-8">* Cgfdir *</p>
            <div className="flex items-center gap-2 mr-8">
              <span>* Brn : رقم الفرع – اسم الفرع . الطابعات .</span>
              <span className="font-black px-4 py-1">{server.طابعة_فواتير} &nbsp;&nbsp;&nbsp;&nbsp; {server.طابعة_a4}</span>
            </div>
            <p className="mr-8">* Hasbat : إضافة بطاقة قريب من افتتاح الفرع .</p>
            <div className="flex items-center gap-2 mr-8">
              <span>* UserFR : تعديل اسم الفرع ومسار قواعد البيانات . وإختيار النوع(Type)</span>
              <span className="font-black px-2">2 للعملاء</span>
            </div>
            <div className="flex items-center gap-2 mr-8">
              <span>* إضافة رقم السيريال في قاعدة SQL</span>
              <span className="font-black px-2 font-sans">{server.serial_number}</span>
            </div>
            <p className="mr-8">* PIND : تغير رقم السري الخاص بـ المرتجعات لمدير المنطقة</p>
            <p>6- إضافة (اسم المؤسسة – الرقم الضريبي – عنوان العميل ) في USERFR تبع الفرع في الجدول RTN</p>
            <p>7- عمل اسم مستخدم للفرع</p>
            <p>8- تحديد برنامج للمستخدم .</p>
            <p>9- تجربة البرنامج .</p>
            <p>10- إضافة الفرع في ملف التحديث RTNFR = UPDATER بعد تحويل صنف</p>
          </>
        )}
      </div>

      <div className="mt-8 flex justify-between text-xl font-black">
        <span>قفل الفروع = 0</span>
        <span>قفل تحديث الاسعار = 1</span>
        <span>الميزان لا يوجد ق</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4;
          margin: 0;
        }
        @media print {
          html, body {
            height: 100%;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden;
          }
          body * {
            visibility: hidden;
          }
          #printable-foundation, #printable-foundation * {
            visibility: visible;
          }
          #printable-foundation {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 10mm;
            box-sizing: border-box;
          }
        }
      ` }} />
    </div>
  );
};

export default PrintableBranchFoundation;
