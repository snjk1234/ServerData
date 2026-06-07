import 'package:serverdata/services/metadata_notifier.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:serverdata/services/auth_notifier.dart';
import 'package:url_launcher/url_launcher.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key, required this.title});

  final String title;

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    final authNotif = ref.watch(authProvider.notifier);
    final metaAsync = ref.watch(metadataProvider);
    final pricingUrl = Uri.parse(
        "https://github.com/ServerData/mvp-boilerplate/blob/main/flutter/README.md");
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
        actions: [
          TextButton(
            onPressed: () => context.pushNamed('account'),
            child: const Text('الحساب', style: TextStyle(color: Colors.white)),
          ),
          TextButton(
              onPressed: authNotif.signOut,
              child: const Text("خروج", style: TextStyle(color: Colors.white))),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              metaAsync.when(
                data: (metadata) {
                  final subscription = metadata?.subscription;
                  final planName = subscription?.prices?.products?.name;
                  final status = subscription?.status;
                  return Column(
                    children: [
                      Text(
                        subscription != null
                            ? 'أنت مشترك حالياً في خطة ${planName ?? 'غير معروفة'}'
                            : 'أنت غير مشترك في أي خطة حالياً.',
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      if (status != null)
                        Text(
                          'حالة الاشتراك: $status',
                          style:
                              const TextStyle(fontSize: 14, color: Colors.grey),
                        ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: () => context.pushNamed('payments'),
                        child: const Text('إدارة الاشتراك'),
                      ),
                    ],
                  );
                },
                loading: () => const CircularProgressIndicator(),
                error: (_, __) => const Text('فشل تحميل حالة الاشتراك'),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => launchUrl(pricingUrl),
                child: const Text('عرض صفحة التسعير'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
