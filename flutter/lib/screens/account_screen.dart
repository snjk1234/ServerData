import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:serverdata/services/auth_notifier.dart';
import 'package:serverdata/services/metadata_notifier.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authNotif = ref.watch(authProvider.notifier);
    final metaAsync = ref.watch(metadataProvider);
    final user = Supabase.instance.client.auth.currentUser;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text('الحساب'),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: metaAsync.when(
          data: (metadata) {
            final subscription = metadata?.subscription;
            final planName = subscription?.prices?.products?.name;
            final status = subscription?.status;
            return ListView(
              children: [
                Card(
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20)),
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('البريد الإلكتروني',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(user?.email ?? 'غير معروف',
                            style: const TextStyle(fontSize: 14)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20)),
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('الخطة الحالية',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text(
                          subscription != null
                              ? 'أنت حالياً في خطة ${planName ?? 'غير معروفة'}'
                              : 'لا يوجد اشتراك نشط حالياً.',
                          style: const TextStyle(fontSize: 14),
                        ),
                        if (status != null) ...[
                          const SizedBox(height: 8),
                          Text('حالة الاشتراك: $status',
                              style: const TextStyle(
                                  fontSize: 14, color: Colors.grey)),
                        ],
                        const SizedBox(height: 18),
                        ElevatedButton(
                          onPressed: () => context.pushNamed('payments'),
                          child: const Text('إدارة الاشتراك'),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Card(
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20)),
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('الوصول السريع',
                            style: TextStyle(
                                fontSize: 16, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        ElevatedButton(
                          onPressed: authNotif.signOut,
                          style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.redAccent),
                          child: const Text('تسجيل الخروج'),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) =>
              const Center(child: Text('فشل تحميل بيانات الحساب')),
        ),
      ),
    );
  }
}
