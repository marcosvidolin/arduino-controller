/**
 * Server.
 * @author Marcos Alexandre Vidolin de Lima
 * @since 28/02/2013
 *
 */

#include <SPI.h>
#include <Ethernet.h>
#include <Servo.h>

const char BUTTON_1 = 'A';
//const char BUTTON_2 = 'B';
//const char BUTTON_3 = 'C';
//const char BUTTON_4 = 'D';
//const char BUTTON_LEFT_SHOULDER_TOP = 'E';
//const char BUTTON_LEFT_SHOULDER_BOTTOM = 'F';
//const char BUTTON_RIGHT_SHOULDER_TOP = 'G';
//const char BUTTON_RIGHT_SHOULDER_BOTTOM = 'H';
//const char BUTTON_SELECT = 'I';
//const char BUTTON_START = 'J';
//const char STICK_1 = 'K';
//const char STICK_2 = 'L';
//const char BUTTON_DPAD_TOP = 'M';
//const char BUTTON_DPAD_BOTTOM = 'N';
//const char BUTTON_DPAD_LEFT = 'O';
//const char BUTTON_DPAD_RIGHT = 'P';
const char STICK_1_AXIS_X = 'Q';
const char STICK_1_AXIS_Y = 'R';
const char STICK_2_AXIS_X = 'S';
const char STICK_2_AXIS_Y = 'T';

EthernetServer server = EthernetServer(80);
byte ip[] = {192, 168, 1, 199};
byte gateway[] = {192, 168, 1, 1}; 
byte subnet[] = {255, 255, 255, 0};
byte mac[] = {0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED};

Servo myservo;

unsigned long lastTime = 0;
boolean isRunning = false;

/**
 * Setup method.
 *
 */
void setup() {
  // start the Ethernet connection and the server:
  Ethernet.begin(mac, ip, gateway, subnet);
  server.begin();
  
  // attaches the servo on pin 9 to the servo object 
  myservo.attach(9);
  // stops the servo
  myservo.write(90);

  Serial.begin(9600);
  pinMode(13, OUTPUT);
}

/**
 * Loop method.
 *
 */
void loop() {
  // listen for incoming clients
  EthernetClient client = server.available();

  char button = ' ';
  String value = "";
  unsigned int characters = 0;
 
  if (client) {
    while (client.connected()) {
             
      // executes this code just only cliente send data
      if (client.available()) {

        char c = client.read();
        
        // 1234567890
        // R=999
        ++characters;
        if (characters == 1) {
          button = c;
        } else if (characters > 2 && characters < 6) {
          value += c;
          if (characters == 5) {
            //Serial.print(button);Serial.println(value.toInt());
            sendCommandToArduino(button, value.toInt());
            characters = 0;
            value = "";
            lastTime = millis();
          }
        } 
      }
      
      // stops the servo when there is no activity
      //Serial.print(millis()); Serial.print("  >  "); Serial.println(lastTime);
      if (isRunning && (millis() - lastTime) > 250) {
        myservo.write(90);
        Serial.println("Parou");
        isRunning = false;
      }
      
    }
    client.stop();
  }
}


/**
 * Sends the command to Arduino.
 *
 */
void sendCommandToArduino(char button, int value) {
  switch(button) {
    case BUTTON_1:
      break;
    case STICK_2_AXIS_Y:
      Serial.println(value);
      myservo.write(value);
      isRunning = true;     
      //delay(1);
      break;
    case STICK_2_AXIS_X:
      break;
  }
}

/**
 * Convert a String to float value.
 * 
 * @param text
 *      - the String
 *
 * @return float value
 *
 */
float stringToFloat(String text) {
  char carray[text.length() + 1];
  text.toCharArray(carray, sizeof(carray));
  return atof(carray);
}