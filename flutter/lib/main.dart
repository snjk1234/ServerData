import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:devtodollars/services/router_notifier.dart';

void main() async {
  usePathUrlStrategy();
  await Supabase.initialize(
    url: const String.fromEnvironment('SUPABASE_URL', defaultValue: 'https://jsmdegkfnmsvtzjyfcio.supabase.co'),
    anonKey: const String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzbWRlZ2tmbm1zdnR6anlmY2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODQ1MDYsImV4cCI6MjA5MjM2MDUwNn0.C3EyRBrxt-dHE_NBNTbfJ_X5HUbv6mGDtDTwDzh-ouc'),
  );
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(context, ref) {
    final goRouter = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'DevToDollars',
      debugShowCheckedModeBanner: false,
      routerConfig: goRouter,
      locale: const Locale('ar'), // لغة عربية
      supportedLocales: const [Locale('ar')],
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        textTheme: GoogleFonts.cairoTextTheme(ThemeData.light().textTheme),
        useMaterial3: true,
      ),
    );
  }
}
