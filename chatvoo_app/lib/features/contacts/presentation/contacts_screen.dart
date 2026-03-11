// lib/features/contacts/presentation/contacts_screen.dart
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';

class ContactsScreen extends StatefulWidget {
  const ContactsScreen({super.key});

  @override
  State<ContactsScreen> createState() => _ContactsScreenState();
}

class _ContactsScreenState extends State<ContactsScreen> {
  List<dynamic> _contacts = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final resp = await ApiClient.instance.dio.get(ApiConstants.contacts);
      if (mounted) {
        setState(() {
          _contacts = resp.data['data']?['contacts'] ?? resp.data['data'] ?? [];
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<dynamic> get _filtered {
    if (_search.isEmpty) return _contacts;
    return _contacts.where((c) {
      final name = (c['name'] ?? '').toLowerCase();
      final phone = (c['phone'] ?? '').toLowerCase();
      return name.contains(_search.toLowerCase()) ||
          phone.contains(_search.toLowerCase());
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.white,
        title: const Text('Contacts'),
        actions: [
          TextButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.upload_rounded, size: 18),
            label: const Text('Import'),
            style: TextButton.styleFrom(
              foregroundColor: AppTheme.primaryGreen,
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddContact(),
        backgroundColor: AppTheme.primaryGreen,
        child: const Icon(Icons.person_add_rounded, color: Colors.white),
      ),
      body: Column(
        children: [
          Container(
            color: AppTheme.white,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    onChanged: (v) => setState(() => _search = v),
                    style: const TextStyle(
                        fontSize: 14, color: AppTheme.neutral900),
                    decoration: InputDecoration(
                      hintText: 'Search contacts...',
                      prefixIcon: const Icon(Icons.search,
                          size: 20, color: AppTheme.neutral400),
                      filled: true,
                      fillColor: AppTheme.neutral100,
                      contentPadding:
                          const EdgeInsets.symmetric(vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${_filtered.length} contacts',
                  style: const TextStyle(
                      fontSize: 13,
                      color: AppTheme.neutral500,
                      fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                        color: AppTheme.primaryGreen))
                : _filtered.isEmpty
                    ? _buildEmpty()
                    : RefreshIndicator(
                        color: AppTheme.primaryGreen,
                        onRefresh: _load,
                        child: ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 90),
                          itemCount: _filtered.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 8),
                          itemBuilder: (ctx, i) =>
                              _buildContactCard(_filtered[i]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactCard(Map<String, dynamic> c) {
    final name = c['name'] ?? c['phone'] ?? 'Unknown';
    final phone = c['phone'] ?? '';
    final email = c['email'];

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.neutral200),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: _avatarColor(name),
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : '?',
              style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 16),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.neutral900,
                  ),
                ),
                const SizedBox(height: 2),
                Text(phone,
                    style: const TextStyle(
                        fontSize: 12, color: AppTheme.neutral500)),
                if (email != null && email.toString().isNotEmpty)
                  Text(email,
                      style: const TextStyle(
                          fontSize: 11, color: AppTheme.neutral400)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.message_rounded,
                color: AppTheme.primaryGreen, size: 20),
            onPressed: () {},
          ),
        ],
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
            child: const Icon(Icons.people_outline_rounded,
                size: 32, color: AppTheme.neutral400),
          ),
          const SizedBox(height: 16),
          const Text('No contacts yet',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.neutral700)),
          const SizedBox(height: 6),
          const Text('Add or import your contacts',
              style: TextStyle(fontSize: 14, color: AppTheme.neutral400)),
        ],
      ),
    );
  }

  Color _avatarColor(String name) {
    final colors = [
      AppTheme.primaryGreen,
      AppTheme.primaryBlue,
      const Color(0xFF8B5CF6),
      const Color(0xFFF59E0B),
      const Color(0xFFEF4444),
    ];
    if (name.isEmpty) return colors[0];
    return colors[name.codeUnitAt(0) % colors.length];
  }

  void _showAddContact() {
    // TODO: Bottom sheet add contact form
  }
}
