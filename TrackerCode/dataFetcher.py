#!/usr/bin/python           # This is client.py file

import socket
import sys
from dateutil.parser import parse
import time
import datetime
from config import Config as conf
import _mysql


end = ''
g_step=0
g_serverConnection=None
g_ElsterStartTime=None
g_PowerStartTime=None
g_RainStartTime=None
def parsePowerData(rawData):
    #h = ['"Timestamp"', '"TZ"', '"Active power: (k    W)"', '"Reactive power: (kvar)"', '"Apparent power: (kVA)"', '"Average power: (kW)"', '"Max Demand: (kWh)"', '"elster_kwhrs (Counts)"', '"rain_0.25mm/count (Counts)"', '"flow m3 (Counts)"', '"dam level (mm)"']
    #"Timestamp","TZ","Rainfall (mm)","dam level (mm)","Flow: (m3)"
    parsedData = []
    for line in rawData.split('\r\n'):
        if len(line)>0 and line[0] != '2':
            continue
        if len(line) < 10 :
            continue
        parsedData.append(line.split(','))
    return parsedData

def parseElsterData(rawData):
    parsedData = []
    for line in rawData.split('\r\n'):
        if len(line)>0 and line[0] != '2':
            continue
        if len(line) < 10 :
            continue
        parsedData.append(line.split(','))
    return parsedData
def parseRainData(rawData):
    parsedData = []
    for line in rawData.split('\r\n'):
        if len(line)>0 and line[0] != '2':
            continue
        if len(line) < 10 :
            continue
        parsedData.append(line.split(','))
    return parsedData

def insertPowerData(parsedData):
    
    global end
    global g_PowerStartTime
    headers = parsedData[0]
    q = "INSERT IGNORE INTO `readings`(`time_created`, `active_power`, `reactive_power`, `apparent_power`, `frequency`, `average_power`, `max_demand`) VALUES "
    values = []
    for row in parsedData[0:]:
        if len(row) != 8:
            if conf.DEBUG : print 'faulty row', row
            continue
        if 'DT80>' in row:
            if conf.DEBUG : print 'Row with DT80>'
            continue

        dataRow = [row[0]] + row[2:]
#         end = row[0].str()
        values.append('"' + '","'.join(dataRow) + '"')
#     g_PowerStartTime=[parsedData[len(parsedData)-1][0]]
    index=len(parsedData)-1
    potentialDate = parsedData[index][0]
    while True:
        if potentialDate[0]!= '2':
            index-=1
            if index<0: break
            continue
        g_PowerStartTime =potentialDate.split(' ')
        break
            
#     print "aaaaaaaa " + g_PowerStartTime
    q += '(' + '),('.join(values) + ')'
    try:
        mysql = _mysql.connect(host=conf.MYSQL_DATABASE_HOST, user=conf.MYSQL_DATABASE_USER, passwd=conf.MYSQL_DATABASE_PASSWORD, db=conf.MYSQL_DATABASE_DB)
    # cursor = mysql.cursor()
#         print q
        res = mysql.query(q)
#         print res
        mysql.commit()
    except Exception:
        if conf.DEBUG :  print "error with inserting elster! potentially didn't find any values!!"
        return False
    
def insertElsterData(parsedData):
    
    global end
    headers = parsedData[0]
    global g_ElsterStartTime
    q = "INSERT INTO `elster_readings`(`date_created`, `elster`) VALUES "
    values = []
    for row in parsedData[0:]:
        # print row
#         print len(row)
        if len(row) != 3:
            if conf.DEBUG :   print 'faulty row', row
            continue
        if 'DT80>' in row:
            if conf.DEBUG : print 'Row with DT80>'
            continue

        dataRow = [row[0]] + row[2:]
#         end = row[0].str()
        values.append('"' + '","'.join(dataRow) + '"')
    index=len(parsedData)-1
    potentialDate = parsedData[index][0]
    while True:
        if potentialDate[0]!= '2':
            index-=1
            if index<0: break
            continue
        g_ElsterStartTime =potentialDate.split(' ')
        break
#     print "finished parsing! \r"
    q += '(' + '),('.join(values) + ')'
    if conf.DEBUG : print "---------- \r"
    if conf.DEBUG : print q
    try:
        mysql = _mysql.connect(host=conf.MYSQL_DATABASE_HOST, user=conf.MYSQL_DATABASE_USER, passwd=conf.MYSQL_DATABASE_PASSWORD, db=conf.MYSQL_DATABASE_DB)
    # cursor = mysql.cursor()
#         print q
        res = mysql.query(q)
#         print res
        mysql.commit()
    except Exception,e:
        if conf.DEBUG : print "error with inserting elster! potentially didn't find any values!! \r " + str(e)
        return False
    
    
def insertRainData(parsedData):
    
    global end
    global g_RainStartTime
    headers = parsedData[0]
    if conf.DEBUG : print "headers!!!!!!!!! "
    if conf.DEBUG : print  headers
    q = "INSERT IGNORE INTO `rain_readings`(`date_created`,`rainfall`, `dam_level`, `flow` ) VALUES "
    values = []
    for row in parsedData[0:]:
        if conf.DEBUG : print len(row)
        if len(row) != 5:
            if conf.DEBUG : print 'faulty row', row
            continue
        if 'DT80>' in row:
            if conf.DEBUG : print 'Row with DT80>'
            continue
        dataRow = [row[0]] + row[2:]
        values.append('"' + '","'.join(dataRow) + '"')
    index=len(parsedData)-1
    potentialDate = parsedData[index][0]
    while True:
        if potentialDate[0]!= '2':
            index-=1
            if index<0: break
            continue
        g_RainStartTime =potentialDate.split(' ')
        break
    q += '(' + '),('.join(values) + ')'
    if conf.DEBUG : print q
    try:
        mysql = _mysql.connect(host=conf.MYSQL_DATABASE_HOST, user=conf.MYSQL_DATABASE_USER, passwd=conf.MYSQL_DATABASE_PASSWORD, db=conf.MYSQL_DATABASE_DB)
    # cursor = mysql.cursor()
#         print q
        res = mysql.query(q)
#         print res
        mysql.commit()
    except Exception:
        if conf.DEBUG : print "error with inserting elster! potentially didn't find any values!!"
        return False


        
        

def getFrom(startTime=None):
    startedToFetch = time.clock()
     
    global g_step
    global end
    buff = 4096
    
#     db = _mysql.connect("54.186.251.236", 
#                     "root", # your username
#                     "philiMYSQL", # your password
#                     "knoydart") # name of the data base
#     

#     mysql=_mysql.connect("54.200.176.141","knoydart","5dbrABGCp6FTWNyW","powerofknoydart") 
    

    complete = 'Unload complete.'
    global g_serverConnection
    s = g_serverConnection
    q=makeQuery()
    if conf.DEBUG : print q + "\r"
    try:
        s.sendall('Q \r')
        time.sleep(1)
        while 1:
            s.recv(buff)
    except Exception:
        pass
    s.sendall(q)
    time.sleep(0.5)
    i = 1
    rawData = ''

    while i < 50 and i >0:
        time.sleep(0.5)
        try:
            rawData += s.recv(buff)
            sys.stdout.write('#')
            if conf.DEBUG : print 'Received by iteration ', i, " (len)", len(rawData) # , ":", repr(rawData)
            i += 1

            if complete in rawData:
                rawData = rawData.split(complete)[0]
                if conf.DEBUG : print 'Reading Completed'
                i = -i
                continue

        except Exception:
            if complete in rawData:
                rawData = rawData.split(complete)[0]
                if conf.DEBUG : print 'output finished AND reading completed'
                i = -i
                continue
        if (time.clock() - startedToFetch)>=30 :
            setupConnection()
            return -1
             

    else:
        if conf.DEBUG : print 'OK, either completed or too many iterations'
        s.sendall('SIGNOFF \r')
        if conf.DEBUG : print "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        if conf.DEBUG : print rawData
        if g_step==0:
            d = parsePowerData(rawData)
            if len(d)>0:
                if conf.DEBUG : print "PowerData"
                if conf.DEBUG : print d[0][0]
                if conf.DEBUG : print d[-1][0]
                insertPowerData(d)
        elif g_step==1:
            d = parseElsterData(rawData)
            if len(d)>0:
                if conf.DEBUG : print "ElsterData"
                if conf.DEBUG : print d[0][0]
                if conf.DEBUG : print d[-1][0]
                insertElsterData(d)
        elif g_step==2:
            d = parseRainData(rawData)
            if len(d)>0:
                if conf.DEBUG : print "RainData"
                if conf.DEBUG : print d[0][0]
                if conf.DEBUG : print d[-1][0]
                insertRainData(d)
    if conf.DEBUG : print "returning true ! \r"
    return 1
    
    
def makeQuery():
    global g_step
    start=getStartTime()
    end = (parse('{}T{}'.format(start[0], start[1]))+ datetime.timedelta(minutes=20)).strftime('%Y-%m-%dT%H:%M:%S')
    job=None
    if g_step == 0 : job="B"
    elif g_step == 1 : job="A"
    elif g_step == 2 : job="C"
#     q='COPYD start={}T{}.00 end={}.00 sched={} \r'.format(start[0], start[1],end,job)
    q='COPYD start={}T{} end={}.00 sched={} \r'.format(start[0],start[1],end,job)
    return q
def getStartTime():
    start=None
    global g_PowerStartTime
    global g_ElsterStartTime
    global g_RainStartTime
    global g_step
    if g_step==0:
        if g_PowerStartTime is None:
            mysql = _mysql.connect(host=conf.MYSQL_DATABASE_HOST, user=conf.MYSQL_DATABASE_USER, passwd=conf.MYSQL_DATABASE_PASSWORD, db=conf.MYSQL_DATABASE_DB)
            q = "SELECT time_created FROM `readings`  ORDER BY time_created DESC LIMIT 1"
            mysql.query(q)
            result = mysql.use_result()
            item =result.fetch_row()[0][0]
            start = item.split(" ")
            g_PowerStartTime=start
        else:       
            start = g_PowerStartTime
    elif g_step==1:
        if g_ElsterStartTime is None:
            mysql = _mysql.connect(host=conf.MYSQL_DATABASE_HOST, user=conf.MYSQL_DATABASE_USER, passwd=conf.MYSQL_DATABASE_PASSWORD, db=conf.MYSQL_DATABASE_DB)
            q = "SELECT date_created FROM `elster_readings`   ORDER BY date_created DESC LIMIT 1"
            mysql.query(q)
            result = mysql.use_result()
            item =result.fetch_row()[0][0]
            g_ElsterStartTime = item.split(" ")
            start=g_ElsterStartTime
        else:       
            start = g_ElsterStartTime
    elif g_step==2:
        if g_RainStartTime is None:
            mysql = _mysql.connect(host=conf.MYSQL_DATABASE_HOST, user=conf.MYSQL_DATABASE_USER, passwd=conf.MYSQL_DATABASE_PASSWORD, db=conf.MYSQL_DATABASE_DB)
            q = "SELECT date_created FROM `rain_readings` ORDER BY date_created DESC LIMIT 1"
            mysql.query(q)
            result = mysql.use_result()
            item =result.fetch_row()[0][0]
            g_ElsterStartTime = item.split(" ")
            start = g_ElsterStartTime
        else:       
            start = g_RainStartTime
    return start

def setupConnection():
    global g_serverConnection
    host = conf.DATATAKER_HOST
    port = conf.DATATAKER_PORT
    user = conf.DATATAKER_USER
    password = conf.DATATAKER_PASS
    
    if g_serverConnection != None:
        g_serverConnection.shutdown(socket.SHUT_RDWR)
        g_serverConnection.close()
    g_serverConnection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = g_serverConnection.connect_ex((host, port))
    g_serverConnection.sendall(password + " \r")
    
    g_serverConnection.setblocking(0)
    
    if result > 0:
        print "problem with socket!"
    else:
        print "everything is ok!"

def main():
    while True:
        try:
            print time.ctime()
            setupConnection()
            global g_step
            while True:
                try:
                    result = getFrom()
                    if result==1:
                        g_step+=1
                        if g_step>=3 : 
                            g_step=0
                            time.sleep(3)
                except Exception:
                    pass
        except Exception:
            pass

if __name__ == "__main__":
    main()