// lib/features/auth/data/auth_service.dart
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';

class AuthService {
  final _dio = ApiClient.instance.dio;

  Future<Map<String, dynamic>> login(String email, String password) async {
    final resp = await _dio.post(ApiConstants.login, data: {
      'email': email,
      'password': password,
    });
    if (resp.statusCode == 200 && resp.data['success'] == true) {
      return resp.data;
    }
    throw Exception(resp.data['message'] ?? 'Login failed');
  }

  Future<Map<String, dynamic>?> getMe() async {
    try {
      final resp = await _dio.get(ApiConstants.me);
      if (resp.statusCode == 200) return resp.data;
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
