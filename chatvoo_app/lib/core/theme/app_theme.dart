// lib/core/theme/app_theme.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors — matches Chatvoo web design
  static const Color primaryGreen = Color(0xFF25C665); // WhatsApp green
  static const Color primaryGreenDark = Color(0xFF1DA851);
  static const Color primaryGreenLight = Color(0xFFE8F9F1);
  static const Color primaryBlue = Color(0xFF3B82F6);

  static const Color white = Color(0xFFFFFFFF);
  static const Color background = Color(0xFFF8FAFC);
  static const Color cardBg = Color(0xFFFFFFFF);

  // Neutrals
  static const Color neutral50 = Color(0xFFF8FAFC);
  static const Color neutral100 = Color(0xFFF1F5F9);
  static const Color neutral200 = Color(0xFFE2E8F0);
  static const Color neutral300 = Color(0xFFCBD5E1);
  static const Color neutral400 = Color(0xFF94A3B8);
  static const Color neutral500 = Color(0xFF64748B);
  static const Color neutral600 = Color(0xFF475569);
  static const Color neutral700 = Color(0xFF334155);
  static const Color neutral800 = Color(0xFF1E293B);
  static const Color neutral900 = Color(0xFF0F172A);

  // Semantic
  static const Color success = Color(0xFF22C55E);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  static ThemeData get lightTheme {
    // Use Google Fonts Inter — no local font files needed
    final interTextTheme = GoogleFonts.interTextTheme(
      const TextTheme(
        displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: neutral900, letterSpacing: -0.5),
        displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: neutral900, letterSpacing: -0.5),
        headlineLarge: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: neutral900),
        headlineMedium: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: neutral900),
        headlineSmall: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: neutral900),
        titleLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: neutral900),
        titleMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: neutral800),
        titleSmall: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: neutral700),
        bodyLarge: TextStyle(fontSize: 15, fontWeight: FontWeight.w400, color: neutral800),
        bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: neutral700),
        bodySmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: neutral500),
        labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: neutral900),
        labelMedium: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: neutral600),
        labelSmall: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: neutral500),
      ),
    );

    return ThemeData(
      useMaterial3: true,
      textTheme: interTextTheme,
      brightness: Brightness.light,
      scaffoldBackgroundColor: background,

      colorScheme: ColorScheme.light(
        primary: primaryGreen,
        onPrimary: white,
        primaryContainer: primaryGreenLight,
        onPrimaryContainer: primaryGreenDark,
        secondary: primaryBlue,
        background: background,
        surface: cardBg,
        onSurface: neutral900,
        outline: neutral200,
        surfaceVariant: neutral100,
        onSurfaceVariant: neutral600,
        error: error,
      ),

      // AppBar
      appBarTheme: AppBarTheme(
        backgroundColor: white,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        shadowColor: neutral200,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: neutral900,
        ),
        iconTheme: const IconThemeData(color: neutral700),
        centerTitle: false,
      ),

      // Cards
      cardTheme: CardThemeData(
        color: cardBg,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: neutral200, width: 1),
        ),
        margin: EdgeInsets.zero,
      ),

      // Bottom Navigation
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: white,
        selectedItemColor: primaryGreen,
        unselectedItemColor: neutral400,
        elevation: 0,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w400,
        ),
      ),

      // Input
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: neutral50,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: neutral200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: neutral200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryGreen, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: error),
        ),
        hintStyle: GoogleFonts.inter(color: neutral400, fontSize: 14),
        labelStyle: GoogleFonts.inter(color: neutral600, fontSize: 14),
      ),

      // ElevatedButton
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: white,
          elevation: 0,
          shadowColor: Colors.transparent,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // OutlinedButton
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: neutral800,
          side: const BorderSide(color: neutral200),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: GoogleFonts.inter(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Divider
      dividerTheme: const DividerThemeData(
        color: neutral100,
        thickness: 1,
        space: 0,
      ),

      // Chip
      chipTheme: ChipThemeData(
        backgroundColor: neutral100,
        selectedColor: primaryGreenLight,
        labelStyle: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w500, color: neutral700),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        side: BorderSide.none,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      ),
    );
  }
}
