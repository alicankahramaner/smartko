#include <Arduino.h>
int incomingByte = 0;
void setup()
{
  Serial.begin(9600);
  Serial.println("KoMacro Initiliaze...");

  Serial.println("KoMacro Ready...");
}

void loop()
{
  if (Serial.available() > 0)
  {
    // read the incoming byte:
    incomingByte = Serial.read();

    // say what you got:
    Serial.print("I received: ");
    Serial.println(incomingByte, DEC);
  }
}
