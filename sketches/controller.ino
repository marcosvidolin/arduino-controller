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
  myservo.write(calculateServoVal(0.06));

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
  if (client) {
    char button = ' ';
    String value = "";
    unsigned int characters = 0;
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();               
        // 1234567890123456789
        // GET /?T=0.87&_=1361232861758 HTTP/1.1
        characters++;
        if (characters == 7) {
          button = c;
        } else if (characters > 8 && characters <= 12) {
          value += c;
        } else if (characters >= 12) {
          Serial.println(value);
          //myservo.write(calculateServoVal(stringToFloat(value)));
          setArduino(button, stringToFloat(value));
          // close the connection:
          client.stop();
          lastTime = millis();
          break;
        }
      }
    }
  }
  // stops the servo when there is no activity
  if ((millis() - lastTime) > 200) {
    myservo.write(calculateServoVal(0.06));
  }  
}


/**
 * Sends the command to Arduino.
 *
 */
void setArduino(char button, float value) {
  switch(button) {
    case BUTTON_1:
      break;
    case STICK_2_AXIS_Y:
      myservo.write(calculateServoVal(value));
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

/**
 * Convert the coordinate received from gamepad API in speed and direction
 * to the Servo.
 * This will set the speed of the servo (with 0 being full-speed in one
 * direction, 180 being full speed in the other, and a value near 90
 * being no movement).
 *
 * @see http://arduino.cc/en/Reference/ServoWrite
 *
 * @param val
 *        - a float value bettwen -1 and 1
 *
 * @return float value to be setted to servo.write(angle)
 *
 */
float calculateServoVal(float val) {
  return (val * 90) + 90;
}