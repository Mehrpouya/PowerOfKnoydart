/*
 * Copyright (C) 2015 Hadi Mehrpouya
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


#include <SoftwareSerial.h>
#include "RGBdriver.h"
//#include "CapacitiveSensor.h"

////// TOUCH //////
int lastTouch = 0;
int touchDelay = 3000;  // rate limit the touches
int capacitiveThreshold = 500;
//CapacitiveSensor cs_3_4 = CapacitiveSensor(A0,A1);        // Pin 4 and ink at one end of resistor, pin 3 on other (was 4,2)


//const int IMP_SERIAL_RX = 8;
//const int IMP_SERIAL_TX = 9;
// Create an instance of software serial.
//SoftwareSerial impSerial(IMP_SERIAL_RX, IMP_SERIAL_TX);

#define CLK 2//pins definitions for the driver        
#define DIO 3
RGBdriver Driver(CLK,DIO);

//
int bInt;
int bBuffer [6];

void setup()
{  
  Serial.begin(9600);

  //pinMode (ledPin, OUTPUT);
  // set the data rate for the SoftwareSerial port
  Serial1.begin(19200);
  Driver.begin(); // begin
  Driver.SetColor(0,0,0); //Red. first node data
  Driver.end(); // begin
}
int r=0,g=0,b=0;
char inData[9]; // Allocate some space for the string
char inChar; // Where to store the character read

long touch;
void loop()
{  
  int index = 0; // Index into array; where to store the character
//  touch  =  cs_3_4.capacitiveSensor(30);
//  Serial.println(touch);  
  boolean HadiSmells  =true;

//  if( touch > capacitiveThreshold ){

 // } // END TOUCH EVENT
//  else{
  //  Driver.begin(); // begin
  //  Driver.SetColor(0, 0, 0); //Red. first node data
  //  Driver.end();
  //}
  //
  boolean hasChanged=false;
  while (Serial.available() > 0) {
    hasChanged=true;
    if(index < 9) // One less than the size of the array
    {
      inChar = Serial.read(); // Read a character
      inData[index] = inChar; // Store it
      index++; // Increment where to write next

      inData[index] = '\0'; // Null terminate the string
    }
/*    else{
      Serial1.flush();
      index=0;
      break;
    }*/

      
  }
  if(hasChanged){
    String s = String(inData);
//    Serial.print("b: ");
//    Serial.println(s);
    r = atoi(s.substring(0, 3).c_str());
    g = atoi(s.substring(3, 6).c_str());
    b = atoi(s.substring(6, 9).c_str());
    hasChanged=false;
        Driver.begin(); // begin
    Driver.SetColor(r, g, b); //Red. first node data
    Driver.end();
    Serial.print("r ");
    Serial.println(r);
    Serial.print("g ");
    Serial.println(g);
    Serial.print("b ");
    Serial.println(b);

  }
  delay(2000);
}





