// lib/shared/providers/auth_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/data/auth_service.dart';

class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final Map<String, dynamic>? user;

  const AuthState({
    this.isLoading = true,
    this.isAuthenticated = false,
    this.user,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    Map<String, dynamic>? user,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _service = AuthService();

  AuthNotifier() : super(const AuthState()) {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final user = await _service.getMe();
    state = AuthState(
      isLoading: false,
      isAuthenticated: user != null,
      user: user,
    );
  }

  /// Login with username (NOT email — server uses username field)
  Future<void> login(String username, String password) async {
    final data = await _service.login(username, password);
    // Server returns { message: "Login successful", user: { ... } }
    final user = data['user'] as Map<String, dynamic>?;

    // Fetch fresh /me to get the full session-backed user object
    final freshUser = await _service.getMe();

    state = AuthState(
      isLoading: false,
      isAuthenticated: freshUser != null || user != null,
      user: freshUser ?? user,
    );
  }

  Future<void> logout() async {
    await _service.logout();
    state = const AuthState(isLoading: false, isAuthenticated: false);
  }

  Future<void> refresh() => _checkAuth();
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
