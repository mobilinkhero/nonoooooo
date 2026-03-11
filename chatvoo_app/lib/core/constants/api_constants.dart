// lib/core/constants/api_constants.dart

class ApiConstants {
  // Change this to your production server URL
  static const String baseUrl = 'https://dash.chatvoo.com';

  // Auth
  static const String login = '/api/auth/login';
  static const String logout = '/api/auth/logout';
  static const String me = '/api/auth/me';

  // Dashboard
  static const String dashboardStats = '/api/dashboard/stats';
  static const String analyticsMessages = '/api/analytics/messages';
  static const String analyticsCampaigns = '/api/analytics/campaigns';

  // Conversations
  static const String conversations = '/api/conversations';
  static String conversationMessages(String id) => '/api/conversations/$id/messages';
  static String markConversationRead(String id) => '/api/conversations/$id/read';

  // Messages
  static const String messages = '/api/messages';

  // Contacts
  static const String contacts = '/api/contacts';
  static const String groups = '/api/groups';

  // Campaigns
  static const String campaigns = '/api/campaigns';

  // Templates
  static const String templates = '/api/templates';

  // Channels
  static const String channels = '/api/channels';
  static const String activeChannel = '/api/channels/active';

  // Subscriptions
  static String userSubscription(String userId) => '/api/subscriptions/user/$userId';
  static const String plans = '/api/plans';

  // Notifications
  static const String notifications = '/api/notifications';

  // Support
  static const String tickets = '/api/tickets';

  // WebSocket
  static const String wsUrl = 'wss://dash.chatvoo.com/ws';
}
