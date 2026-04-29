import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/server_data.dart';

final serverDataProvider = FutureProvider<List<ServerData>>((ref) async {
  final supabase = Supabase.instance.client;
  final response = await supabase
      .from('server_data')
      .select()
      .order('id', ascending: false);

  return (response as List).map((e) => ServerData.fromMap(e)).toList();
});
