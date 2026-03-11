// lib/features/home/presentation/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import '../../../shared/providers/auth_provider.dart';
import '../../../shared/widgets/stat_card.dart';
import '../../../shared/widgets/section_header.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  Map<String, dynamic>? _stats;
  Map<String, dynamic>? _channel;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final dio = ApiClient.instance.dio;
      final results = await Future.wait([
        dio.get(ApiConstants.dashboardStats),
        dio.get(ApiConstants.activeChannel),
      ]);
      if (mounted) {
        setState(() {
          _stats = results[0].data['data'];
          _channel = results[1].data['data'];
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;
    final username = user?['username'] ?? user?['firstName'] ?? 'there';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        elevation: 0,
        scrolledUnderElevation: 0,
        titleSpacing: 20,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Good ${_greeting()} 👋',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w400,
                color: AppTheme.neutral500,
              ),
            ),
            Text(
              username,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppTheme.neutral900,
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            child: Stack(
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined,
                      color: AppTheme.neutral700),
                  onPressed: () {},
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: AppTheme.primaryGreen,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppTheme.primaryGreen,
        onRefresh: _loadData,
        child: _loading
            ? _buildShimmer()
            : CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  SliverToBoxAdapter(
                    child: Column(
                      children: [
                        // Channel status banner
                        if (_channel != null) _buildChannelCard(),
                        const SizedBox(height: 20),

                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SectionHeader(title: 'Overview'),
                              const SizedBox(height: 12),

                              // KPI Grid
                              GridView.count(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                crossAxisCount: 2,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                                childAspectRatio: 1.5,
                                children: [
                                  StatCard(
                                    title: 'Messages',
                                    value: _fmt(_stats?['totalMessages']),
                                    icon: Icons.message_rounded,
                                    color: AppTheme.primaryGreen,
                                    bgColor: AppTheme.primaryGreenLight,
                                  ),
                                  StatCard(
                                    title: 'Campaigns',
                                    value: _fmt(_stats?['totalCampaigns']),
                                    icon: Icons.campaign_rounded,
                                    color: const Color(0xFF8B5CF6),
                                    bgColor: const Color(0xFFF3F0FF),
                                  ),
                                  StatCard(
                                    title: 'Contacts',
                                    value: _fmt(_stats?['totalContacts']),
                                    icon: Icons.people_rounded,
                                    color: AppTheme.primaryBlue,
                                    bgColor: const Color(0xFFEFF6FF),
                                  ),
                                  StatCard(
                                    title: 'Delivery',
                                    value: _deliveryRate(),
                                    icon: Icons.check_circle_rounded,
                                    color: const Color(0xFFF59E0B),
                                    bgColor: const Color(0xFFFFFBEB),
                                  ),
                                ],
                              ),

                              const SizedBox(height: 24),
                              const SectionHeader(title: 'Quick Actions'),
                              const SizedBox(height: 12),
                              _buildQuickActions(),

                              const SizedBox(height: 24),
                              const SectionHeader(title: 'Delivery Rate'),
                              const SizedBox(height: 12),
                              _buildDeliveryCard(),

                              const SizedBox(height: 100),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildChannelCard() {
    final isActive = _channel?['isActive'] == true;
    return Container(
      margin: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive
              ? AppTheme.primaryGreen.withOpacity(0.2)
              : AppTheme.error.withOpacity(0.2),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: isActive
                  ? AppTheme.primaryGreenLight
                  : AppTheme.error.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.phone_android_rounded,
              color: isActive ? AppTheme.primaryGreen : AppTheme.error,
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _channel?['name'] ?? 'WhatsApp Channel',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.neutral900,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  _channel?['phoneNumber'] ?? '',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.neutral500,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: isActive
                  ? AppTheme.primaryGreenLight
                  : AppTheme.error.withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: isActive ? AppTheme.primaryGreen : AppTheme.error,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  isActive ? 'Active' : 'Offline',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: isActive ? AppTheme.primaryGreen : AppTheme.error,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      _QuickAction('New Campaign', Icons.campaign_rounded, AppTheme.primaryGreen),
      _QuickAction('Add Contact', Icons.person_add_rounded, AppTheme.primaryBlue),
      _QuickAction('Templates', Icons.description_rounded, const Color(0xFF8B5CF6)),
      _QuickAction('Analytics', Icons.bar_chart_rounded, const Color(0xFFF59E0B)),
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: actions
          .map((a) => _buildActionBtn(a.label, a.icon, a.color))
          .toList(),
    );
  }

  Widget _buildActionBtn(String label, IconData icon, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        child: Material(
          color: AppTheme.white,
          borderRadius: BorderRadius.circular(14),
          child: InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: () {},
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14),
              decoration: BoxDecoration(
                border: Border.all(color: AppTheme.neutral200),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Column(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, color: color, size: 18),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    label,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.neutral700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDeliveryCard() {
    final total = int.tryParse('${_stats?['totalMessages'] ?? 0}') ?? 0;
    final delivered = int.tryParse('${_stats?['messagesDelivered'] ?? 0}') ?? 0;
    final read = int.tryParse('${_stats?['messagesRead'] ?? 0}') ?? 0;
    final deliveryRate = total > 0 ? (delivered / total).clamp(0.0, 1.0) : 0.0;
    final readRate = total > 0 ? (read / total).clamp(0.0, 1.0) : 0.0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.neutral200),
      ),
      child: Column(
        children: [
          _progressRow('Delivered', deliveryRate, AppTheme.primaryGreen,
              '$delivered of $total'),
          const SizedBox(height: 16),
          _progressRow(
              'Read', readRate, AppTheme.primaryBlue, '$read of $total'),
        ],
      ),
    );
  }

  Widget _progressRow(
      String label, double value, Color color, String subtitle) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppTheme.neutral700)),
            Text('${(value * 100).toStringAsFixed(1)}%',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: color)),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: value,
            backgroundColor: AppTheme.neutral100,
            color: color,
            minHeight: 6,
          ),
        ),
        const SizedBox(height: 4),
        Align(
          alignment: Alignment.centerLeft,
          child: Text(subtitle,
              style: const TextStyle(
                  fontSize: 11, color: AppTheme.neutral400)),
        ),
      ],
    );
  }

  Widget _buildShimmer() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.only(top: 60),
        child: CircularProgressIndicator(color: AppTheme.primaryGreen),
      ),
    );
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  String _fmt(dynamic val) {
    if (val == null) return '0';
    final n = int.tryParse('$val') ?? 0;
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return '$n';
  }

  String _deliveryRate() {
    final total = int.tryParse('${_stats?['totalMessages'] ?? 0}') ?? 0;
    final delivered = int.tryParse('${_stats?['messagesDelivered'] ?? 0}') ?? 0;
    if (total == 0) return '0%';
    return '${((delivered / total) * 100).toStringAsFixed(1)}%';
  }
}

class _QuickAction {
  final String label;
  final IconData icon;
  final Color color;
  _QuickAction(this.label, this.icon, this.color);
}
