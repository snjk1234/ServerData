import 'package:serverdata/models/stripe.dart';
import 'package:serverdata/models/user_metadata.dart';
import 'package:serverdata/services/auth_notifier.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

part 'metadata_notifier.g.dart';

@riverpod
class Metadata extends _$Metadata {
  SupabaseClient get client => Supabase.instance.client;

  @override
  Future<UserMetadata?> build() async {
    final session = ref.watch(authProvider).value;
    if (session == null) return null;

    final (metadata, subscription) =
        await (getUserDetails(), getSubscription()).wait;
    metadata.subscription = subscription;
    return metadata;
  }

  Future<UserMetadata> getUserDetails() async {
    final res = await client.from('users').select('*').single();
    return UserMetadata.fromJson(res);
  }

  Future<SubscriptionWithPrice?> getSubscription() async {
    final res = await client
        .from('subscriptions')
        .select('*, prices(*, products(*))')
        .inFilter('status', ['trialing', 'active'])
        .order('created', ascending: false)
        .limit(1)
        .maybeSingle();
    return (res == null) ? null : SubscriptionWithPrice.fromJson(res);
  }
}
