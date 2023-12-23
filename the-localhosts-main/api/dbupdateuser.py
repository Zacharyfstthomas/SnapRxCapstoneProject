# dbupdateuser.py
# Updates Users table to include `tempPasswordHash` and `tempSalt` attributes for account recovery

import pymysql
import os
from pymysql.constants import CLIENT

UPDATE_USERS_SQL = '''
        USE snaprx;
        
        ALTER TABLE Users
        ADD `tempPasswordHash` VARCHAR(60),
        ADD `tempSalt` VARCHAR(60);
        '''

if __name__ == '__main__':
    # connection object
    conn = pymysql.connect(host=os.environ.get('DB_HOST'),
                           user=os.environ.get('DB_USER'),
                           password=os.environ.get('DB_PASS'),
                           client_flag=CLIENT.MULTI_STATEMENTS)

    # query to create SnapRx DB with tables
    with conn.cursor() as curs:
        curs.execute(UPDATE_USERS_SQL)
        conn.commit()

        conn.close()
