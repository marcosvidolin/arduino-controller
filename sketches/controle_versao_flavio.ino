#include <Servo.h> 
#include <Ethernet.h>
#include <SPI.h>
boolean reading = false;


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

Servo myservo;  // create servo object to control a servo 
                // a maximum of eight servo objects can be created 
 
int pos = 0;    // variable to store the servo position 
int val;    // variable to read the value from the analog pin 


void setup(){
  //Pins 10,11,12 & 13 are used by the ethernet shield

  myservo.attach(9);  // attaches the servo on pin 9 to the servo object 

  Ethernet.begin(mac, ip, gateway, subnet);
  server.begin();
}



void loop(){
  // listen for incoming clients, and process qequest.
  checkForClient();
}

void checkForClient(){

  EthernetClient client = server.available();

  if (client) {

    // an http request ends with a blank line
    boolean currentLineIsBlank = true;
    boolean sentHeader = false;

    while (client.connected()) {
      if (client.available()) {

        if(!sentHeader){
          // send a standard http response header
          client.println("HTTP/1.1 200 OK");
          client.println("Content-Type: text/html");
          client.println();
          sentHeader = true;
        }
        
        // 
        char c = client.read();

        if(reading && c == ' ') reading = false;
        if(c == '?') reading = true; //found the ?, begin reading the info

        if(reading){
          Serial.print(c);

           switch (c) {
            case '2':
              //add code here to trigger on 2
              val = 100;
              myservo.write(val);                  // sets the servo position according to the scaled value 
              delay(15);  
              
              break;
            case '3':
              //add code here to trigger on 3
              val = 190;
              myservo.write(val); 
              delay(15); 

              break;
            case '4':
              //add code here to trigger on 3
              val = 10;
              myservo.write(val); 
              delay(15); 
              break;       

        }

        if (c == '\n' && currentLineIsBlank)  break;

        if (c == '\n') {
          currentLineIsBlank = true;
        }else if (c != '\r') {
          currentLineIsBlank = false;
        }

      }
    }

    delay(1); // give the web browser time to receive the data
    client.stop(); // close the connection:

  } 

}

void triggerPin(int pin, EthernetClient client){
//blink a pin - Client needed just for HTML output purposes.  
  client.print("Turning on pin ");
  client.println(pin);
  client.print("<br>");

  digitalWrite(pin, HIGH);
  delay(25);
  digitalWrite(pin, LOW);
  delay(25);
}

