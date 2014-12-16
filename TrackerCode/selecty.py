'''
Created on 12 Nov 2014

@author: loki
'''

from config import Config as conf
import _mysql



def main():
    mysql = _mysql.connect(host=conf.MYSQL_DATABASE_HOST, user=conf.MYSQL_DATABASE_USER, passwd=conf.MYSQL_DATABASE_PASSWORD, db=conf.MYSQL_DATABASE_DB)
    q = "SELECT time_created FROM `readings`  ORDER BY time_created DESC LIMIT 1"
    mysql.query(q)
    result = mysql.use_result()
    item =result.fetch_row()[0][0]
    parts=item.split(" ") 
    print parts[0] + " !! " + parts[1]

if __name__ == "__main__":
    main()