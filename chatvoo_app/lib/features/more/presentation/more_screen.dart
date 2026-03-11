// lib/features/more/presentation/more_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/providers/auth_provider.dart';

class MoreScreen extends ConsumerWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final name = '${user?['firstName'] ?? ''} ${user?['lastName'] ?? ''}'.trim();
    final email = user?['email'] ?? '';
    final role = user?['role'] ?? 'user';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        title: const Text('More'),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile card
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppTheme.primaryGreen, AppTheme.primaryGreenDark],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryGreen.withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 28,
                    backgroundColor: Colors.white.withOpacity(0.2),
                    child: Text(
                      name.isNotEmpty ? name[0].toUpperCase() : 'U',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name.isEmpty ? 'User' : name,
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          email,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.white.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      role,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Menu sections
            _buildSection('Tools', [
              _MenuItem(Icons.description_rounded, 'Templates',
                  AppTheme.primaryBlue, () {}),
              _MenuItem(Icons.campaign_rounded, 'Campaigns',
                  AppTheme.primaryGreen, () {}),
              _MenuItem(Icons.smart_toy_rounded, 'Automation',
                  const Color(0xFF8B5CF6), () {}),
              _MenuItem(Icons.bar_chart_rounded, 'Analytics',
                  const Color(0xFFF59E0B), () {}),
            ]),

            _buildSection('Account', [
              _MenuItem(Icons.phone_android_rounded, 'Channels',
                  AppTheme.primaryGreen, () {}),
              _MenuItem(Icons.credit_card_rounded, 'Billing & Plans',
                  const Color(0xFF0EA5E9), () {}),
              _MenuItem(Icons.vpn_key_rounded, 'API Keys',
                  const Color(0xFF8B5CF6), () {}),
              _MenuItem(Icons.notifications_rounded, 'Notifications',
                  const Color(0xFFF59E0B), () {}),
            ]),

            _buildSection('Support', [
              _MenuItem(Icons.support_agent_rounded, 'Support Tickets',
                  AppTheme.primaryBlue, () {}),
              _MenuItem(Icons.info_outline_rounded, 'About',
                  AppTheme.neutral400, () {}),
            ]),

            // Logout
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 40),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () async {
                    final confirm = await showDialog<bool>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                        title: const Text('Sign Out',
                            style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: AppTheme.neutral900)),
                        content: const Text(
                            'Are you sure you want to sign out?',
                            style: TextStyle(color: AppTheme.neutral600)),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(ctx, false),
                            child: const Text('Cancel',
                                style:
                                    TextStyle(color: AppTheme.neutral500)),
                          ),
                          TextButton(
                            onPressed: () => Navigator.pop(ctx, true),
                            child: const Text('Sign Out',
                                style: TextStyle(color: AppTheme.error)),
                          ),
                        ],
                      ),
                    );
                    if (confirm == true) {
                      ref.read(authProvider.notifier).logout();
                    }
                  },
                  icon: const Icon(Icons.logout_rounded,
                      color: AppTheme.error, size: 18),
                  label: const Text('Sign Out',
                      style: TextStyle(
                          color: AppTheme.error, fontWeight: FontWeight.w600)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: const BorderSide(color: AppTheme.error, width: 1),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(String title, List<_MenuItem> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 8),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppTheme.neutral400,
              letterSpacing: 0.5,
            ),
          ),
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: AppTheme.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.neutral200),
          ),
          child: Column(
            children: items.asMap().entries.map((entry) {
              final i = entry.key;
              final item = entry.value;
              return Column(
                children: [
                  Material(
                    color: Colors.transparent,
                    child: InkWell(
                      borderRadius: BorderRadius.vertical(
                        top: Radius.circular(i == 0 ? 16 : 0),
                        bottom:
                            Radius.circular(i == items.length - 1 ? 16 : 0),
                      ),
                      onTap: item.onTap,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: item.color.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Icon(item.icon,
                                  color: item.color, size: 18),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Text(
                                item.label,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                  color: AppTheme.neutral800,
                                ),
                              ),
                            ),
                            const Icon(Icons.chevron_right_rounded,
                                color: AppTheme.neutral300, size: 20),
                          ],
                        ),
                      ),
                    ),
                  ),
                  if (i < items.length - 1)
                    const Divider(height: 1, indent: 66),
                ],
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 8),
      ],
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  _MenuItem(this.icon, this.label, this.color, this.onTap);
}
