import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:posthog_flutter/posthog_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supa;
// ignore: depend_on_referenced_packages
import 'package:path/path.dart' as p;
import 'package:supabase_flutter/supabase_flutter.dart';

part 'auth_notifier.g.dart';

@Riverpod(keepAlive: true)
class Auth extends _$Auth {
  Auth();

  @override
  Stream<supa.Session?> build() async* {
    // Emit the current session immediately so it isn't lost before the stream listener attaches
    yield client.auth.currentSession;

    await for (final authState in client.auth.onAuthStateChange) {
      final session = authState.session;

      // capture posthog events for analytics
      if (session != null) {
        await Posthog().identify(
          userId: session.user.id,
          userProperties: {"email": session.user.email ?? ""},
        );
      } else {
        await Posthog().reset();
      }

      yield session;
    }
  }

  supa.SupabaseClient get client => supa.Supabase.instance.client;
  supa.Session? get currentSession => client.auth.currentSession;

  Future<void> signInWithPassword(String email, String password) async {
    await client.auth.signInWithPassword(password: password, email: email);
  }

  Future<void> signInWithOAuth(supa.OAuthProvider provider) async {
    String? baseUrl = (kIsWeb) ? Uri.base.origin : null;
    await client.auth.signInWithOAuth(
      provider,
      redirectTo: baseUrl,
      queryParams: {
        'access_type': 'offline',
        'prompt': 'consent',
      },
    );
  }

  Future<void> signUp(String email, String password) async {
    await client.auth.signUp(password: password, email: email);
  }

  Future<void> recoverPassword(String email) async {
    final resetUrl = p.join(Uri.base.origin, "reset");
    await client.auth.resetPasswordForEmail(email, redirectTo: resetUrl);
  }

  Future<void> updatePassword(String password) async {
    await client.auth.updateUser(
      supa.UserAttributes(
        password: password,
      ),
    );
  }

  Future<Uri?> getUserStripeLink({String? price}) async {
    String? baseUrl = (kIsWeb) ? Uri.base.origin : null;

    var res = await client.functions.invoke("get_stripe_url", body: {
      "return_url": baseUrl,
      "price": price,
    });
    String? redirectUrl = res.data["redirect_url"];
    if (redirectUrl is String) {
      return Uri.parse(redirectUrl);
    }
    return null;
  }

  Future<void> signOut() async {
    await client.auth.signOut();
  }
}
