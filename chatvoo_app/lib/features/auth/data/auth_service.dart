// lib/features/auth/data/auth_service.dart
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

class AuthService {
  final _dio = ApiClient.instance.dio;

  /// Server expects { username, password }
  /// Server returns { message: "Login successful", user: { ... } }
  Future<Map<String, dynamic>> login(String username, String password) async {
    final resp = await _dio.post(ApiConstants.login, data: {
      'username': username,
      'password': password,
    });

    final data = resp.data as Map<String, dynamic>? ?? {};

    if (resp.statusCode == 200 && data.containsKey('user')) {
      return data;
    }

    // Extract the error message from the response
    final errMsg = data['error'] ?? data['message'] ?? 'Login failed';
    throw Exception(errMsg);
  }

  /// Server returns the user object directly (not wrapped in { data: ... })
  /// Returns null if not authenticated (401) or on any error
  Future<Map<String, dynamic>?> getMe() async {
    try {
      final resp = await _dio.get(ApiConstants.me);
      if (resp.statusCode == 200) {
        final data = resp.data as Map<String, dynamic>?;
        // Server returns user directly: { id, username, email, role, ... }
        return data;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post(ApiConstants.logout);
    } finally {
      await ApiClient.instance.clearCookies();
    }
  }
}
