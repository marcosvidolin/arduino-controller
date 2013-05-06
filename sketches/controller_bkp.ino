#include <Servo.h> 
#include <Ethernet.h>
#include <SPI.h>

////////////////////////////////////////////////////////////////////////
//CONFIGURE
////////////////////////////////////////////////////////////////////////
  byte ip[] = { 192, 168, 1, 199 };   //ip address to assign the arduino
  byte gateway[] = { 192, 168, 1, 1 }; //ip address of the gatewa or router

  //Rarly need to change this
  byte subnet[] = { 255, 255, 255, 0 };

  // if need to change the MAC address (Very Rare)
  byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };

  EthernetServer server = EthernetServer(80); //port 80
////////////////////////////////////////////////////////////////////////

// create servo object to control a servo 
// a maximum of eight servo objects can be created 
Servo myservo;  

char button = ' ';
String value = "";
  
/**
 * The setup() function.
 *
 */
void setup(){
  myservo.attach(9);  // attaches the servo on pin 9 to the servo object 
  Ethernet.begin(mac, ip, gateway, subnet);
  server.begin();
  Serial.begin(9600);
}

/**
 * The loop() function.
 *
 */
void loop(){
  EthernetClient client = server.available();
  value = "";
  if (client) {
    int characters = 0;
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
        } else if (characters > 12) {
          client.stop();
          break;
        }
        
      }
    }
    Serial.print(button);
    Serial.println(value);
  }
  // listen for incoming clients, and process request.
  //checkForClient();
}

/**
 * 
 *
 */
void checkForClient() {

  EthernetClient client = server.available();

  if (client) {
    int characters = 0;
    while (client.connected()) {
      if (client.available()) {

        char c = client.read();

        value += c;

        if (characters == 7) {
          // send a standard http response header
          client.println("HTTP/1.1 200 OK");
          client.println("Content-Type: text/html");
          client.println("Connection: close");
          client.println();
          

          // give the web browser time to receive the data
          delay(1);
          // close the connection:
          client.stop();

          // TODO: set the values to servo
          
          
          break;
        }
      }
    }
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

/**
 * Gets the button name from the text "stick-1-axis-x=0.8676".
 * @param text - sample "stick-1-axis-x=0.8676"
 * @return String - sample "stick-1-axis-x"
 *
String getButtonName(String text) {
    int limit = text.indexOf("=");
    return text.substring(0, limit);
}

float getButtonValue(String text) {
  int init = text.indexOf("=");
  return strToFloat(text.substring(init, text.length()));
}*/
