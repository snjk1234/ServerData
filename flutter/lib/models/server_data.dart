class ServerData {
  final int id;
  final String branchNo;
  final String branchNameAr;
  final String branchNameEn;
  final String username;
  final String encryptedPassword;
  final DateTime createdAt;
  final String status;
  final String category;
  final String? streetName;
  final String? cityName;
  final String? taxNo;
  final String? region;
  final String? printerA4;
  final String? printerBill;
  final int serialNumber;

  ServerData({
    required this.id,
    required this.branchNo,
    required this.branchNameAr,
    required this.branchNameEn,
    required this.username,
    required this.encryptedPassword,
    required this.createdAt,
    required this.status,
    required this.category,
    required this.serialNumber,
    this.streetName,
    this.cityName,
    this.taxNo,
    this.region,
    this.printerA4,
    this.printerBill,
  });

  factory ServerData.fromMap(Map<String, dynamic> map) {
    return ServerData(
      id: map['id'] as int,
      branchNo: map['رقم_الفرع'] ?? '',
      branchNameAr: map['اسم_الفرع_ar'] ?? '',
      branchNameEn: map['اسم_الفرع_en'] ?? '',
      username: map['اسم_اليوزر'] ?? '',
      encryptedPassword: map['باسوورد'] ?? '',
      createdAt: DateTime.parse(map['تاريخ_الانشاء'] ?? DateTime.now().toIso8601String()),
      status: map['حالة_اليوزر'] ?? '',
      category: map['تصنيف_الفرع'] ?? 'الكل',
      serialNumber: map['serial_number'] ?? 100000,
      streetName: map['اسم_الشارع'],
      cityName: map['اسم_المدينة'],
      taxNo: map['الرقم_الضريبي'],
      region: map['المنطقة'],
      printerA4: map['طابعة_a4'],
      printerBill: map['طابعة_فواتير'],
    );
  }
}
