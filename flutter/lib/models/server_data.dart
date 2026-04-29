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
    );
  }
}
