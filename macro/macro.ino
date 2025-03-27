#include <EEPROM.h>
#include <Keyboard.h>

// EEPROM adres başlangıç noktası
#define EEPROM_START_ADDR 0
#define MAX_MACRO_LENGTH 50
#define BUTTON_PIN 2 // Buton pini

// Makro verileri
struct MacroStep {
  char key;
  uint16_t delay;
};

MacroStep macro[MAX_MACRO_LENGTH];
uint8_t macroCount = 0;
bool isRunning = false;

void setup() {
  Serial.begin(9600);
  Keyboard.begin();

  pinMode(BUTTON_PIN, INPUT_PULLUP); // Buton pini giriş olarak ayarlandı

  // EEPROM'dan makro verilerini yükle
  loadMacroFromEEPROM();
}

void loop() {
  // Serial'den gelen komutları işle
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    processCommand(command);
  }

  // Buton durumu kontrolü
  if (digitalRead(BUTTON_PIN) == LOW) {
    isRunning = true;
  } else {
    isRunning = false;
  }

  // Makroyu çalıştır
  if (isRunning) {
    runMacro();
  }
}

// EEPROM'dan makro yükle
void loadMacroFromEEPROM() {
  EEPROM.get(EEPROM_START_ADDR, macroCount);
  if (macroCount > MAX_MACRO_LENGTH) macroCount = 0; // Geçersiz veri koruması
  EEPROM.get(EEPROM_START_ADDR + 1, macro);
}

// EEPROM'a makro kaydet
void saveMacroToEEPROM() {
  EEPROM.put(EEPROM_START_ADDR, macroCount);
  EEPROM.put(EEPROM_START_ADDR + 1, macro);
}

// Gelen komutları işle
void processCommand(String command) {
  command.trim(); // Baştaki ve sondaki boşlukları kaldır

  if (command.startsWith("UPDATE")) {
    command.remove(0, 7); // "UPDATE " kısmını çıkar
    command.trim(); // Fazladan boşlukları temizle

    // Makro listesini sıfırla (tamamen güncelleniyor)
    macroCount = 0;

    while (command.length() > 0) {
      int separatorIndex = command.indexOf(',');
      String step = (separatorIndex == -1) ? command : command.substring(0, separatorIndex);
      command = (separatorIndex == -1) ? "" : command.substring(separatorIndex + 1);

      step.trim(); // Adımın başındaki ve sonundaki boşlukları kaldır

      int spaceIndex = step.indexOf(' ');
      if (spaceIndex != -1 && macroCount < MAX_MACRO_LENGTH) {
        char key = step.charAt(0);
        uint16_t delay = step.substring(spaceIndex + 1).toInt();

        macro[macroCount].key = key;
        macro[macroCount].delay = delay;
        macroCount++;
      }
    }
    saveMacroToEEPROM();
    Serial.println("UPDATED");
  } else if (command == "LIST") {
    if (macroCount == 0) {
      Serial.println("MacroListEmpty");
    } else {
      Serial.print("LIST:");
      for (int i = 0; i < macroCount; i++) {
        Serial.print(macro[i].key);
        Serial.print(" ");
        Serial.print(macro[i].delay);
        if (i < macroCount - 1) Serial.print(", ");
      }
      Serial.println();
    }
  } else if (command == "CLEAR") {
    macroCount = 0;
    saveMacroToEEPROM();
    Serial.println("MacroCleared");
  } else if (command == "START") {
    isRunning = true;
    Serial.println("STARTED");
  } else if (command == "STOP") {
    isRunning = false;
    Serial.println("STOPPED");
  } else {
    Serial.println("UNDEFINED");
  }
}

// Makro çalıştır
void runMacro() {
  for (int i = 0; i < macroCount; i++) {
    Keyboard.press(macro[i].key);
    delay(macro[i].delay);
    Keyboard.release(macro[i].key);
  }
  isRunning = false; // Tek döngü
}
