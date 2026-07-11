import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/api.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({this.token});

  String? token;

  Uri uri(String path, [Map<String, String?>? query]) {
    final filteredQuery = <String, String>{};
    query?.forEach((key, value) {
      if (value != null && value.isNotEmpty) {
        filteredQuery[key] = value;
      }
    });

    return Uri.parse('${ApiConfig.apiBaseUrl}$path').replace(
      queryParameters: filteredQuery.isEmpty ? null : filteredQuery,
    );
  }

  Map<String, String> get headers {
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  Future<Map<String, dynamic>> get(String path, [Map<String, String?>? query]) async {
    final response = await http.get(uri(path, query), headers: headers);
    return _decode(response);
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    final response = await http.post(
      uri(path),
      headers: headers,
      body: jsonEncode(body),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> patch(String path, Map<String, dynamic> body) async {
    final response = await http.patch(
      uri(path),
      headers: headers,
      body: jsonEncode(body),
    );
    return _decode(response);
  }

  Map<String, dynamic> _decode(http.Response response) {
    final json = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode >= 400 || json['success'] != true) {
      throw ApiException(
        json['message'] as String? ?? '요청 처리 중 문제가 발생했습니다.',
        statusCode: response.statusCode,
      );
    }

    return json;
  }
}
