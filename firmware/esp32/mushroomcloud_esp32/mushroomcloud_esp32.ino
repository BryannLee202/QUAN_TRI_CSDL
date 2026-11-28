// ===== FIRMWARE ESP32 MUSHROOMCLOUD: đọc cảm biến -> gửi lên server -> nhận lệnh bật/tắt relay =====
// Gửi dữ liệu tới backend Express của MushroomCloud (cổng 5000).
//
// Cảm biến:
//   - DHT22 (nhiệt độ + độ ẩm)           : DATA -> GPIO 33, VCC -> 3V3
//   - MQ-135 (CO2 ước lượng)          : AO -> cầu chia áp 2 điện trở bằng nhau -> GPIO 32 (ADC1), nguồn 5V
// Relay (module 4 kênh): phun sương GPIO 14, quạt GPIO 27, đèn LED GPIO 26, sưởi (LED) GPIO 25
// Thư viện (Library Manager): "DHT sensor library" (Adafruit), "Adafruit Unified Sensor", "ArduinoJson" (v7)
//
// Luồng hoạt động:
//   - Mỗi 2 giây : đọc cảm biến, POST /api/iot/readings (header x-device-key), áp dụng lệnh server trả về
//   - Mỗi 1 giây : GET /api/iot/commands để lệnh bật/tắt từ web đến nhanh
//   - Server lưu số đo vào SensorData -> trigger SQL sinh cảnh báo, tự bật quạt khi CO2 vượt ngưỡng,
//     sp_IngestDeviceReading tự bật phun sương khi độ ẩm thấp, bật sưởi khi nhiệt độ thấp
//   - Mất Wi-Fi  : tự kết nối lại; mất server quá FAILSAFE_MS thì tắt hết relay

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define FIRMWARE_VERSION "mc-esp32-1.0"

// ---------- CẤU HÌNH: sửa 4 dòng này ----------
const char* WIFI_SSID  = "TEN_WIFI";                     // ESP32 chỉ hỗ trợ Wi-Fi 2.4 GHz
const char* WIFI_PASS  = "MAT_KHAU_WIFI";
const char* SERVER     = "http://192.168.1.10:5000";     // IP LAN của máy chạy backend (ipconfig), KHÔNG dùng localhost
const char* DEVICE_KEY = "MC-ESP32-RM03-DEMO";           // key demo gắn buồng RM03 (database/06_iot_devices.sql)

// ---------- CHÂN KẾT NỐI ----------
#define DHT_PIN 33                     // D33
#define MQ_PIN 32                      // D32 (ADC1). Không dùng chân ADC2 (0, 2, 4, 12-15, 25-27) vì bị Wi-Fi chiếm
const int RELAY_MIST = 14, RELAY_FAN = 27, RELAY_LIGHT = 26, RELAY_HEATER = 25;
const bool RELAY_ACTIVE_LOW = false;   // module đang dùng bật khi chân ở mức HIGH; đổi true nếu thiết bị chạy ngược
const bool LED_DIRECT = false;         // true nếu LED đèn/sưởi cắm THẲNG vào GPIO 26/25 (không qua relay)

// ---------- QUY ĐỔI MQ-135 ----------
// MQ-135 đo chung nhiều loại khí nên chỉ là ƯỚC LƯỢNG. Mặc định lấy mức nền trong lúc làm nóng (không khí sạch)
// làm mốc ~420 ppm, rồi quy đổi tuyến tính phần tăng thêm lên tới 5000 ppm. Thổi hơi vào sẽ thấy CO2 tăng rõ.
const bool MQ_AUTO_BASELINE = true;    // false: quy đổi thẳng ADC 0..4095 -> 400..5000 ppm
const int MQ_RAW_MIN = 50;             // dưới mức này coi như chưa cắm dây AO
const int CO2_BASE_PPM = 420, CO2_MIN_PPM = 400, CO2_MAX_PPM = 5000;

// ---------- THỜI GIAN ----------
const unsigned long SEND_EVERY_MS   = 2000;    // gửi dữ liệu mỗi 2 giây (DHT22 cần tối thiểu 2 giây)
const unsigned long POLL_EVERY_MS   = 1000;    // hỏi lệnh mỗi 1 giây
const unsigned long WIFI_TIMEOUT_MS = 15000;   // chờ Wi-Fi tối đa 15 giây mỗi lần thử
const unsigned long FAILSAFE_MS     = 120000;  // mất server 2 phút -> tắt hết relay
const unsigned long CO2_WARMUP_MS   = 30000;   // MQ-135: dùng thời gian này để lấy mức nền
const int HTTP_RETRIES = 3;

DHT dht(DHT_PIN, DHT22);
unsigned long lastSend = 0, lastPoll = 0, lastServerOk = 0, bootAt = 0;
long mqBaseSum = 0;
int mqBaseCount = 0, mqBaseline = -1;

// ---------- RELAY ----------
void relayWrite(int pin, bool on) {
  bool activeLow = RELAY_ACTIVE_LOW;
  if (LED_DIRECT && (pin == RELAY_LIGHT || pin == RELAY_HEATER)) activeLow = false;  // GPIO -> LED -> GND: HIGH = sáng
  digitalWrite(pin, (on ^ activeLow) ? HIGH : LOW);
}

void allRelaysOff() {
  int pins[] = {RELAY_MIST, RELAY_FAN, RELAY_LIGHT, RELAY_HEATER};
  for (int p : pins) relayWrite(p, false);
}

// kind = mist | fan | light | heater (khớp sp_GetRoomDeviceCommands)
void applyCommand(const char* kind, bool on, const char* mode) {
  if (!kind) return;
  if (!strcmp(kind, "mist"))        relayWrite(RELAY_MIST, on);
  else if (!strcmp(kind, "fan"))    relayWrite(RELAY_FAN, on);
  else if (!strcmp(kind, "light"))  relayWrite(RELAY_LIGHT, on);
  else if (!strcmp(kind, "heater")) relayWrite(RELAY_HEATER, on);
  else return;
  Serial.printf("  Lenh: %-6s -> %s (%s)\n", kind, on ? "BAT" : "TAT", mode);
}

// Đọc JSON {"commands":[{"kind":"mist","state":true,"mode":"auto"}, ...]} và đặt trạng thái relay.
// Đặt trạng thái (không đảo) nên nhận trùng lệnh nhiều lần cũng không sao.
void applyCommands(const String& json) {
  JsonDocument res;
  if (deserializeJson(res, json)) return;
  for (JsonObject c : res["commands"].as<JsonArray>()) {
    applyCommand(c["kind"], c["state"] | false, c["mode"] | "auto");
  }
  lastServerOk = millis();
}

// ---------- CẢM BIẾN CO2 ----------
bool co2WarmingUp() { return millis() - bootAt < CO2_WARMUP_MS; }

// Lấy trung bình 10 lần đọc analog, trả ppm ước lượng hoặc -1 nếu lỗi / đang lấy mức nền
int readCO2() {
  long sum = 0;
  for (int i = 0; i < 10; i++) { sum += analogRead(MQ_PIN); delay(5); }
  int raw = sum / 10;                           // 0..4095
  if (raw < MQ_RAW_MIN) {
    Serial.printf("MQ-135 doc raw=%d (gan 0V) -> kiem tra day AO, cau chia ap, chan D32\n", raw);
    return -1;
  }
  if (!MQ_AUTO_BASELINE) return map(raw, 0, 4095, CO2_MIN_PPM, CO2_MAX_PPM);

  if (co2WarmingUp()) {                         // đang làm nóng: cộng dồn để lấy mức nền
    mqBaseSum += raw;
    mqBaseCount++;
    return -1;
  }
  if (mqBaseline < 0) {
    mqBaseline = mqBaseCount > 0 ? mqBaseSum / mqBaseCount : raw;
    if (mqBaseline >= 4000) mqBaseline = 3000;  // tránh chia cho số quá nhỏ khi cảm biến bão hòa
    Serial.printf("MQ-135 muc nen raw=%d ~ %d ppm\n", mqBaseline, CO2_BASE_PPM);
  }
  long ppm = CO2_BASE_PPM + (long)(raw - mqBaseline) * (CO2_MAX_PPM - CO2_BASE_PPM) / (4095 - mqBaseline);
  return constrain(ppm, CO2_MIN_PPM, CO2_MAX_PPM);
}

void co2Setup() {
  analogReadResolution(12);                     // ADC 0..4095
  analogSetPinAttenuation(MQ_PIN, ADC_11db);    // đo được tới ~3.1V
}

// ---------- WI-FI ----------
// Thử kết nối trong WIFI_TIMEOUT_MS, không chặn mãi; loop() sẽ thử lại lần sau
bool ensureWifi() {
  if (WiFi.status() == WL_CONNECTED) return true;
  Serial.print("Dang ket noi WiFi");
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < WIFI_TIMEOUT_MS) {
    delay(500);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" OK, IP: " + WiFi.localIP().toString());
    return true;
  }
  Serial.println(" that bai, se thu lai");
  return false;
}

// ---------- GỬI DỮ LIỆU ----------
// Bảng SensorData bắt buộc đủ nhiệt độ, độ ẩm và CO2 nên thiếu 1 số đo là bỏ qua lần gửi
void sendReading() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  // DHT22 hở dây thường trả 0°C và 0% (vẫn đúng checksum) -> coi như lỗi
  if ((t == 0 && h == 0) || t < -10 || t > 60 || h <= 0 || h > 100) { t = NAN; h = NAN; }
  int co2 = readCO2();

  if (isnan(t) || isnan(h)) {
    Serial.println("Loi doc DHT22 (kiem tra day DAT -> D33, VCC -> 3V3, GND) -> bo qua lan gui nay");
    return;
  }
  if (co2 < 0) {
    if (co2WarmingUp()) {
      Serial.printf("Cam bien CO2 dang lam nong (%lus/%lus) -> chua gui\n",
                    (millis() - bootAt) / 1000, CO2_WARMUP_MS / 1000);
    }
    return;
  }

  JsonDocument doc;
  doc["temperature"] = round(t * 10) / 10.0;
  doc["humidity"] = round(h * 10) / 10.0;
  doc["co2"] = co2;
  String body;
  serializeJson(doc, body);

  for (int attempt = 1; attempt <= HTTP_RETRIES; attempt++) {
    HTTPClient http;
    http.setTimeout(5000);
    http.begin(String(SERVER) + "/api/iot/readings");
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", DEVICE_KEY);
    http.addHeader("x-firmware-version", FIRMWARE_VERSION);
    int code = http.POST(body);
    Serial.printf("Gui %s -> HTTP %d (lan %d)\n", body.c_str(), code, attempt);
    if (code == 201) {
      applyCommands(http.getString());
      http.end();
      return;
    }
    if (code == 400 || code == 401) {   // dữ liệu sai hoặc sai API key: gửi lại cũng vô ích
      Serial.println(http.getString());
      http.end();
      return;
    }
    http.end();
    delay(1000);
  }
}

// ---------- HỎI LỆNH ----------
void pollCommands() {
  HTTPClient http;
  http.setTimeout(3000);
  http.begin(String(SERVER) + "/api/iot/commands");
  http.addHeader("x-device-key", DEVICE_KEY);
  http.addHeader("x-firmware-version", FIRMWARE_VERSION);
  int code = http.GET();
  if (code == 200) applyCommands(http.getString());
  else if (code == 401) Serial.println("HTTP 401: sai DEVICE_KEY hoac thiet bi bi khoa");
  http.end();
}

void setup() {
  Serial.begin(115200);
  int pins[] = {RELAY_MIST, RELAY_FAN, RELAY_LIGHT, RELAY_HEATER};
  for (int p : pins) {
    relayWrite(p, false);        // đặt mức TẮT trước khi bật OUTPUT để relay không giật lúc khởi động
    pinMode(p, OUTPUT);
  }
  allRelaysOff();
  dht.begin();
  co2Setup();
  bootAt = millis();
  WiFi.mode(WIFI_STA);
  ensureWifi();
  lastServerOk = millis();
  Serial.println("MushroomCloud ESP32 " FIRMWARE_VERSION);
}

void loop() {
  if (!ensureWifi()) {
    delay(2000);
  } else {
    unsigned long now = millis();
    if (now - lastSend >= SEND_EVERY_MS) {
      lastSend = now;
      sendReading();
    } else if (now - lastPoll >= POLL_EVERY_MS) {
      lastPoll = now;
      pollCommands();
    }
  }
  // An toàn: mất liên lạc server quá lâu thì tắt hết thiết bị
  if (millis() - lastServerOk > FAILSAFE_MS) {
    allRelaysOff();
    lastServerOk = millis();
    Serial.println("Mat ket noi server qua lau -> tat het relay");
  }
}
