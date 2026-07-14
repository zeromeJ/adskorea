import 'dart:async';
import 'dart:convert';
import 'dart:io';
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
  // Vercel의 첫 요청과 모바일 통신 환경에서는 10초를 넘길 수 있습니다.
  // 무한 대기는 막되 정상적인 콜드 스타트는 기다릴 수 있도록 여유를 둡니다.
  static const _timeout = Duration(seconds: 30);

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

  Future<Map<String, dynamic>> get(String path,
      [Map<String, String?>? query]) async {
    return _send(http.get(uri(path, query), headers: headers));
  }

  Future<Map<String, dynamic>> post(
      String path, Map<String, dynamic> body) async {
    return _send(
      http.post(
        uri(path),
        headers: headers,
        body: jsonEncode(body),
      ),
    );
  }

  Future<Map<String, dynamic>> patch(
      String path, Map<String, dynamic> body) async {
    return _send(
      http.patch(
        uri(path),
        headers: headers,
        body: jsonEncode(body),
      ),
    );
  }

  Future<Map<String, dynamic>> delete(String path) async {
    return _send(http.delete(uri(path), headers: headers));
  }

  Future<Map<String, dynamic>> multipart(
    String path, {
    required Map<String, String> fields,
    required List<http.MultipartFile> files,
  }) async {
    final request = http.MultipartRequest('POST', uri(path));
    if (token != null) request.headers['Authorization'] = 'Bearer $token';
    request.fields.addAll(fields);
    request.files.addAll(files);
    try {
      final streamed = await request.send().timeout(const Duration(minutes: 5));
      return _decode(await http.Response.fromStream(streamed));
    } on TimeoutException {
      throw const ApiException('파일 업로드가 지연되고 있습니다. 다시 시도해 주세요.');
    } on SocketException {
      throw const ApiException('서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.');
    }
  }

  Future<Map<String, dynamic>> put(
      String path, Map<String, dynamic> body) async {
    return _send(http.put(uri(path), headers: headers, body: jsonEncode(body)));
  }

  Future<Map<String, dynamic>> _send(Future<http.Response> request) async {
    try {
      final response = await request.timeout(_timeout);
      return _decode(response);
    } on TimeoutException {
      throw const ApiException('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.');
    } on SocketException {
      throw const ApiException('서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.');
    } on http.ClientException {
      throw const ApiException('서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.');
    } on FormatException {
      throw const ApiException('서버 응답 형식이 올바르지 않습니다.');
    }
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
