import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/server_data.dart';

part 'server_notifier.g.dart';

@riverpod
class ServerDataNotifier extends _$ServerDataNotifier {
  SupabaseClient get client => Supabase.instance.client;

  @override
  Future<List<ServerData>> build() async {
    return _fetchServers();
  }

  Future<List<ServerData>> _fetchServers() async {
    final response = await client
        .from('server_data')
        .select()
        .order('created_at', ascending: false);
    return (response as List).map((e) => ServerData.fromMap(e)).toList();
  }

  Future<void> refreshServers() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchServers());
  }

  Future<void> addServer(Map<String, dynamic> data) async {
    await client.from('server_data').insert(data);
    await refreshServers();
  }

  Future<void> deleteServer(int id) async {
    await client.from('server_data').delete().eq('id', id);
    await refreshServers();
  }
}
