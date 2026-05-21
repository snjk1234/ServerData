import 'package:serverdata/models/stripe.dart';

class UserMetadata {
  final String? avatarUrl;
  final Map<String, dynamic>? billingAddress;
  final String? fullName;
  final String id;
  final Map<String, dynamic>? paymentMethod;
  SubscriptionWithPrice? subscription;
  final String? role;
  final bool? isActive;

  UserMetadata({
    this.avatarUrl,
    this.billingAddress,
    this.fullName,
    required this.id,
    this.paymentMethod,
    this.subscription,
    this.role,
    this.isActive,
  });

  factory UserMetadata.fromJson(Map<String, dynamic> json) {
    return UserMetadata(
      avatarUrl: json['avatar_url'],
      billingAddress: json['billing_address'],
      fullName: json['full_name'],
      id: json['id'],
      paymentMethod: json['payment_method'],
      role: json['role'],
      isActive: json['is_active'],
      subscription: json['subscription'] != null
          ? SubscriptionWithPrice.fromJson(json['subscription'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'avatar_url': avatarUrl,
      'billing_address': billingAddress,
      'full_name': fullName,
      'id': id,
      'payment_method': paymentMethod,
      'role': role,
      'is_active': isActive,
      'subscription': subscription?.toJson(),
    };
  }
}
