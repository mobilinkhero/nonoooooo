// lib/features/inbox/presentation/inbox_screen.dart
import 'package:flutter/material.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/api_client.dart';
import 'chat_screen.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key});

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  List<dynamic> _conversations = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadConversations();
  }

  Future<void> _loadConversations() async {
    try {
      final resp = await ApiClient.instance.dio.get(ApiConstants.conversations);
      if (mounted) {
        setState(() {
          _conversations = resp.data['data'] ?? [];
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<dynamic> get _filtered {
    if (_search.isEmpty) return _conversations;
    return _conversations.where((c) {
      final name = (c['contactName'] ?? '').toLowerCase();
      final phone = (c['contactPhone'] ?? '').toLowerCase();
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
        title: const Text('Inbox'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list_rounded),
            onPressed: () {},
            color: AppTheme.neutral600,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search
          Container(
            color: AppTheme.white,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
            child: TextField(
              onChanged: (v) => setState(() => _search = v),
              style:
                  const TextStyle(fontSize: 14, color: AppTheme.neutral900),
              decoration: InputDecoration(
                hintText: 'Search conversations...',
                prefixIcon: const Icon(Icons.search,
                    size: 20, color: AppTheme.neutral400),
                filled: true,
                fillColor: AppTheme.neutral100,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
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
          const Divider(height: 1),
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(
                        color: AppTheme.primaryGreen))
                : _filtered.isEmpty
                    ? _buildEmpty()
                    : RefreshIndicator(
                        color: AppTheme.primaryGreen,
                        onRefresh: _loadConversations,
                        child: ListView.separated(
                          itemCount: _filtered.length,
                          separatorBuilder: (_, __) =>
                              const Divider(height: 1, indent: 80),
                          itemBuilder: (ctx, i) =>
                              _buildConversationTile(_filtered[i]),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildConversationTile(Map<String, dynamic> conv) {
    final name = conv['contactName'] ?? conv['contactPhone'] ?? 'Unknown';
    final lastMsg = conv['lastMessageText'] ?? '';
    final lastAt = conv['lastMessageAt'];
    final unread = (conv['unreadCount'] ?? 0) as int;
    final status = conv['status'] ?? 'open';
    final isOpen = status == 'open';

    DateTime? dt;
    if (lastAt != null) {
      try {
        dt = DateTime.parse(lastAt).toLocal();
      } catch (_) {}
    }

    return Material(
      color: unread > 0 ? AppTheme.primaryGreenLight.withOpacity(0.3) : AppTheme.white,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ChatScreen(conversation: conv),
            ),
          ).then((_) => _loadConversations());
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              // Avatar
              Stack(
                children: [
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: _avatarColor(name),
                    child: Text(
                      name.isNotEmpty ? name[0].toUpperCase() : '?',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  if (isOpen)
                    Positioned(
                      bottom: 1,
                      right: 1,
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: AppTheme.primaryGreen,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppTheme.white, width: 2),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 12),

              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            name,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: unread > 0
                                  ? FontWeight.w600
                                  : FontWeight.w500,
                              color: AppTheme.neutral900,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (dt != null)
                          Text(
                            timeago.format(dt, locale: 'en_short'),
                            style: TextStyle(
                              fontSize: 11,
                              color: unread > 0
                                  ? AppTheme.primaryGreen
                                  : AppTheme.neutral400,
                              fontWeight: unread > 0
                                  ? FontWeight.w600
                                  : FontWeight.w400,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            lastMsg.isEmpty ? 'No messages yet' : lastMsg,
                            style: TextStyle(
                              fontSize: 13,
                              color: unread > 0
                                  ? AppTheme.neutral700
                                  : AppTheme.neutral400,
                              fontWeight: unread > 0
                                  ? FontWeight.w500
                                  : FontWeight.w400,
                            ),
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                          ),
                        ),
                        if (unread > 0) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryGreen,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '$unread',
                              style: const TextStyle(
                                fontSize: 11,
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
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
            child: const Icon(Icons.chat_bubble_outline_rounded,
                size: 32, color: AppTheme.neutral400),
          ),
          const SizedBox(height: 16),
          const Text('No conversations yet',
              style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.neutral700)),
          const SizedBox(height: 6),
          const Text('Messages will appear here',
              style:
                  TextStyle(fontSize: 14, color: AppTheme.neutral400)),
        ],
      ),
    );
  }

  Color _avatarColor(String name) {
    final colors = [
      const Color(0xFF25C665),
      const Color(0xFF3B82F6),
      const Color(0xFF8B5CF6),
      const Color(0xFFF59E0B),
      const Color(0xFFEF4444),
      const Color(0xFF06B6D4),
    ];
    if (name.isEmpty) return colors[0];
    return colors[name.codeUnitAt(0) % colors.length];
  }
}
