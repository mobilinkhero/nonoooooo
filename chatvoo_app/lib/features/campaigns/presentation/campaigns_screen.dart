// lib/features/campaigns/presentation/campaigns_screen.dart
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';

class CampaignsScreen extends StatefulWidget {
  const CampaignsScreen({super.key});

  @override
  State<CampaignsScreen> createState() => _CampaignsScreenState();
}

class _CampaignsScreenState extends State<CampaignsScreen>
    with SingleTickerProviderStateMixin {
  List<dynamic> _all = [];
  bool _loading = true;
  late TabController _tabCtrl;

  final _tabs = ['All', 'Active', 'Scheduled', 'Completed'];

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: _tabs.length, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final resp = await ApiClient.instance.dio.get(ApiConstants.campaigns);
      if (mounted) {
        setState(() {
          _all = resp.data['data']?['campaigns'] ?? resp.data['data'] ?? [];
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<dynamic> _filtered(String tab) {
    if (tab == 'All') return _all;
    return _all.where((c) {
      final s = (c['status'] ?? '').toString().toLowerCase();
      return s == tab.toLowerCase();
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        title: const Text('Campaigns'),
        bottom: TabBar(
          controller: _tabCtrl,
          isScrollable: true,
          labelColor: AppTheme.primaryGreen,
          unselectedLabelColor: AppTheme.neutral400,
          indicatorColor: AppTheme.primaryGreen,
          indicatorWeight: 2,
          labelStyle: const TextStyle(
              fontWeight: FontWeight.w600, fontSize: 13),
          tabs: _tabs.map((t) => Tab(text: t)).toList(),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: AppTheme.primaryGreen,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('New Campaign',
            style: TextStyle(fontWeight: FontWeight.w600)),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.primaryGreen))
          : TabBarView(
              controller: _tabCtrl,
              children: _tabs.map((tab) {
                final items = _filtered(tab);
                if (items.isEmpty) return _buildEmpty();
                return RefreshIndicator(
                  color: AppTheme.primaryGreen,
                  onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (ctx, i) => _buildCampaignCard(items[i]),
                  ),
                );
              }).toList(),
            ),
    );
  }

  Widget _buildCampaignCard(Map<String, dynamic> c) {
    final name = c['name'] ?? 'Untitled';
    final status = c['status'] ?? 'draft';
    final sent = c['sentCount'] ?? c['sent'] ?? 0;
    final delivered = c['deliveredCount'] ?? c['delivered'] ?? 0;
    final read = c['readCount'] ?? c['read'] ?? 0;
    final total = c['totalContacts'] ?? c['recipientCount'] ?? 0;

    final progress = total > 0 ? (sent / total).clamp(0.0, 1.0) as double : 0.0;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.neutral200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  name,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.neutral900,
                  ),
                ),
              ),
              _statusBadge(status),
            ],
          ),
          const SizedBox(height: 14),

          // Stats row
          Row(
            children: [
              _statPill('Sent', '$sent', Icons.send_rounded,
                  AppTheme.primaryBlue),
              const SizedBox(width: 8),
              _statPill('Delivered', '$delivered', Icons.done_all,
                  AppTheme.primaryGreen),
              const SizedBox(width: 8),
              _statPill(
                  'Read', '$read', Icons.visibility_rounded, AppTheme.warning),
            ],
          ),

          if (total > 0) ...[
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Progress',
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.neutral500),
                ),
                Text(
                  '$sent / $total',
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.neutral600),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: AppTheme.neutral100,
                color: AppTheme.primaryGreen,
                minHeight: 5,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _statPill(String label, String val, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(height: 3),
            Text(val,
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: color)),
            Text(label,
                style: const TextStyle(
                    fontSize: 10, color: AppTheme.neutral500)),
          ],
        ),
      ),
    );
  }

  Widget _statusBadge(String status) {
    Color color;
    Color bg;
    switch (status.toLowerCase()) {
      case 'active':
      case 'running':
        color = AppTheme.primaryGreen;
        bg = AppTheme.primaryGreenLight;
        break;
      case 'scheduled':
        color = AppTheme.primaryBlue;
        bg = const Color(0xFFEFF6FF);
        break;
      case 'completed':
        color = AppTheme.neutral500;
        bg = AppTheme.neutral100;
        break;
      case 'paused':
        color = AppTheme.warning;
        bg = const Color(0xFFFFFBEB);
        break;
      default:
        color = AppTheme.neutral400;
        bg = AppTheme.neutral100;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
          color: bg, borderRadius: BorderRadius.circular(20)),
      child: Text(
        status[0].toUpperCase() + status.substring(1),
        style: TextStyle(
            fontSize: 11, fontWeight: FontWeight.w600, color: color),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppTheme.neutral100,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(Icons.campaign_outlined,
                size: 32, color: AppTheme.neutral400),
          ),
          const SizedBox(height: 16),
          const Text('No campaigns',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.neutral700)),
          const SizedBox(height: 6),
          const Text('Tap + to create a new campaign',
              style: TextStyle(fontSize: 14, color: AppTheme.neutral400)),
        ],
      ),
    );
  }
}
