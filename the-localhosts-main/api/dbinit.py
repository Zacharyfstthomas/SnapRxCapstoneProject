# dbinit.py
# Initializes SnapRx MySQL database and tables

import pymysql
import argparse
import os
from pymysql.constants import CLIENT

INIT_DB_SQL = '''
        DROP DATABASE IF EXISTS snaprx;
        CREATE DATABASE snaprx;
        USE snaprx;
        
        SET GLOBAL event_scheduler = ON;
        
        CREATE TABLE Users(
            `userId` INT NOT NULL AUTO_INCREMENT, 
            `firstName` TEXT NOT NULL,
            `lastName` TEXT NOT NULL,
            `email` TEXT NOT NULL, 
            `passwordHash` VARCHAR(60) NOT NULL, 
            `salt` VARCHAR(60) NOT NULL,
            PRIMARY KEY (`userId`)
        );
        
        CREATE TABLE Sessions(
            `userId` INT NOT NULL, 
            `token` VARCHAR(36) NOT NULL, 
            `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`userId`, `token`),
            CONSTRAINT fk_sessions_user FOREIGN KEY (`userId`)
                REFERENCES Users(`userId`)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
        
        CREATE TABLE Medications(
            `medId` INT NOT NULL AUTO_INCREMENT,
            `rxString` TEXT,
            `medName` TEXT,
            `medDetails` TEXT,
            `shape` TEXT,
            `size` INT,
            `imprintFront` TEXT,
            `imprintBack` TEXT,
            `color` TEXT,
            `price` FLOAT,
            `priceSource` TEXT,
            PRIMARY KEY (`medId`)
        );
        
        CREATE TABLE Ingredients(
            `ingredientId` INT NOT NULL AUTO_INCREMENT,
            `ingredientName` TEXT,
            PRIMARY KEY (`ingredientId`)
        );
        
        CREATE TABLE MedIngredientMap(
            `medId` INT NOT NULL,
            `ingredientId` INT NOT NULL,
            `isActiveIngredient` BOOL NOT NULL,
            PRIMARY KEY (`medId`, `ingredientId`),
            CONSTRAINT fk_medIngredientMap_med FOREIGN KEY (`medId`)
                REFERENCES Medications(`medId`)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            CONSTRAINT fk_medIngredientMap_ingredient FOREIGN KEY (`ingredientId`)
                REFERENCES Ingredients(`ingredientId`)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
        
        CREATE TABLE UserMedMap(
            `userId` INT NOT NULL,
            `medId` INT NOT NULL,
            PRIMARY KEY (`userId`, `medId`),
            CONSTRAINT fk_userMedMap_user FOREIGN KEY (`userId`)
                REFERENCES Users(`userId`)
                ON DELETE CASCADE
                ON UPDATE CASCADE,
            CONSTRAINT fk_userMedMap_med FOREIGN KEY (`medId`)
                REFERENCES Medications(`medId`)
                ON DELETE CASCADE
                ON UPDATE CASCADE
        );
        
        CREATE EVENT delete_sessions
        ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 1 HOUR
        ON COMPLETION PRESERVE
        DO BEGIN
              DELETE FROM Sessions WHERE `timestamp` < DATE_SUB(NOW(), INTERVAL 1 HOUR);
        END;
        '''

INSERT_DUMMY_DATA_SQL = '''
                INSERT INTO Users (`firstName`, `lastName`, `email`, `passwordHash`, `salt`)
                        VALUES ('Andrew', 'Eldridge', 'eldridga@email.sc.edu', 'Q7VTXYMd13CH7OmU6s2Ag2MHYw+HufkxerMG+5VrRxE=', 'lCPo1UMZzW5a1bvVO+ZEDg==');
                INSERT INTO Users (`firstName`, `lastName`, `email`, `passwordHash`, `salt`)
                        VALUES ('Manish', 'Chaudhary', 'manishc@email.sc.edu', 'A5Raj4azhWN+704+U4RKCqY2RK7Dgs29/u2sa8t1CP4=', 'sW6Q7I6Kb+31yNKoyHoE0w==');
                INSERT INTO Users (`firstName`, `lastName`, `email`, `passwordHash`, `salt`)
                        VALUES ('Zachary', 'St. Thomas', 'zfs@email.sc.edu', 'cQaRN0iGRvGB/AuOLEWplBl27+OlbuJeh070wtdTGdU=', 'AKbQxzes9P+P/GZzoJMauw==');
                INSERT INTO Users (`firstName`, `lastName`, `email`, `passwordHash`, `salt`)
                        VALUES ('Linh', 'Nguyen', 'lhnguyen@email.sc.edu', 'zVORQXNEGsU7L1vxiZG2gnPAuJsXwRp2i/w/zJjGs/U=', 'cfnxE9GssiwX+bXkSdMCEQ==');

                INSERT INTO Medications (`brandId`, `rxString`, `medName`, `medDetails`, `shape`, `size`, `imprintFront`, `imprintBack`, `color`, `price`)
                            VALUES (
                                1,
                                'ibuprofen 200 MG Oral Tablet',
                                'Ibuprofen',
                                'Example details on ibuprofen. This value should be retrieved by web scraping',
                                'ROUND',
                                10,
                                'I2',
                                '',
                                'ORANGE',
                                5.00
                            );
                INSERT INTO Medications (`rxString`, `medName`, `medDetails`, `shape`, `size`, `imprintFront`, `imprintBack`, `color`, `price`)
                            VALUES (
                                'Dexamethasone 6 MG Oral Tablet',
                                'Dexamethasone',
                                'Example details on desxamethasone. This value should be retrieved by web scraping',
                                'PENTAGON',
                                7,
                                'par',
                                '129',
                                'GREEN',
                                10.00
                            );
                INSERT INTO Medications (`rxString`, `medName`, `medDetails`, `shape`, `size`, `imprintFront`, `imprintBack`, `color`, `price`)
                            VALUES (
                                'iloperidone 12 MG Oral Tablet',
                                'Iloperidone',
                                'Example details on iloperidone. This value should be retrieved by web scraping',
                                'ROUND',
                                12,
                                'T',
                                '12',
                                'WHITE',
                                12.00
                            );
                INSERT INTO Medications (`rxString`, `medName`, `medDetails`, `shape`, `size`, `imprintFront`, `imprintBack`, `color`, `price`)
                            VALUES (
                                'benzonatate 200 MG Oral Capsule',
                                'Benzonatate',
                                'Example details on benzonatate. This value should be retrieved by web scraping',
                                'CAPSULE',
                                12,
                                'PA83',
                                '',
                                'ORANGE',
                                9.00
                            );

                INSERT INTO UserMedMap(`userId`, `medId`)
                            VALUES (1, 1);
                INSERT INTO UserMedMap(`userId`, `medId`)
                            VALUES (1, 3);
                INSERT INTO UserMedMap(`userId`, `medId`)
                            VALUES (2, 2);
                INSERT INTO UserMedMap(`userId`, `medId`)
                            VALUES (2, 3);
                INSERT INTO UserMedMap(`userId`, `medId`)
                            VALUES (2, 4);
                INSERT INTO UserMedMap(`userId`, `medId`)
                            VALUES (3, 1);

                INSERT INTO Ingredients (`ingredientName`)
                            VALUES ('Example ingredient 1');
                INSERT INTO Ingredients (`ingredientName`)
                            VALUES ('Example ingredient 2');
                INSERT INTO Ingredients (`ingredientName`)
                            VALUES ('Example ingredient 3');
                INSERT INTO Ingredients (`ingredientName`)
                            VALUES ('Example ingredient 4');

                INSERT INTO MedIngredientMap (`medId`, `ingredientId`, `isActiveIngredient`)
                            VALUES (1, 1, FALSE);
                INSERT INTO MedIngredientMap (`medId`, `ingredientId`, `isActiveIngredient`)
                            VALUES (1, 2, TRUE);
                INSERT INTO MedIngredientMap (`medId`, `ingredientId`, `isActiveIngredient`)
                            VALUES (2, 2, TRUE);
                INSERT INTO MedIngredientMap (`medId`, `ingredientId`, `isActiveIngredient`)
                            VALUES (3, 3, TRUE);
                INSERT INTO MedIngredientMap (`medId`, `ingredientId`, `isActiveIngredient`)
                            VALUES (4, 4, TRUE);
                '''


if __name__ == '__main__':
    # parse args
    parser = argparse.ArgumentParser()
    parser.add_argument('-dummydata', action='store_true')
    args = parser.parse_args()

    # connection object
    conn = pymysql.connect(host=os.environ.get('DB_HOST'),
                           user=os.environ.get('DB_USER'),
                           password=os.environ.get('DB_PASS'),
                           client_flag=CLIENT.MULTI_STATEMENTS)

    # query to create SnapRx DB with tables
    with conn.cursor() as curs:
        curs.execute(INIT_DB_SQL)
        conn.commit()

        # check for dummy data flag, insert dummy data if present
        if args.dummydata:
            curs.execute(INSERT_DUMMY_DATA_SQL)
            conn.commit()

        conn.close()
