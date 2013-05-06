#include <Servo.h> 
#include <SPI.h>

// create servo object to control a servo 
// a maximum of eight servo objects can be created 
Servo myservo;  

void setup(){
  // attaches the servo on pin 9 to the servo object 
  myservo.attach(9);
  Serial.begin(9600);
}


void loop(){
  // 180.0
  float v1 = calculateServoVal(1.0);
  myservo.write(v1); 
  Serial.println(v1);
  delay(5000);

  // 95.4
  float v2 = calculateServoVal(0.06);                
  myservo.write(v2); 
  Serial.println(v2);
  delay(5000);
    
  // 0.0
  float v3 = calculateServoVal(-1.0);
  myservo.write(v3); 
  Serial.println(v3);
  delay(5000);
}


float calculateServoVal(float val) {
  return (val * 90) + 90;
}