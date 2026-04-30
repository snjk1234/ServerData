import 'package:flutter/material.dart';
import 'package:serverdata/components/email_form.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final bool showEmailForm = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.indigo[900]!, Colors.indigo[600]!, Colors.indigo[400]!],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Logo & Header
                Icon(Icons.terminal_rounded, size: 80, color: Colors.indigo[100]),
                const SizedBox(height: 16),
                const Text(
                  'لوحة تحكم السيرفرات',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'أهلاً بك مجدداً، يرجى تسجيل الدخول',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.indigo[100],
                  ),
                ),
                const SizedBox(height: 32),

                // Auth Card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      )
                    ],
                  ),
                  child: const EmailForm(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
