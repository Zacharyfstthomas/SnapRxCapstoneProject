# db.py
# Interfaces with MySQL database

import pymysql
import base64
import os

# connection object
conn = pymysql.connect(host=os.environ.get('DB_HOST'),
                       user=os.environ.get('DB_USER'),
                       password=os.environ.get('DB_PASS'),
                       db='snaprx',
                       cursorclass=pymysql.cursors.DictCursor)


# USERS
def create_user(first_name: str, last_name: str, email: str, password_hash: bytes, salt: bytes):
    try:
        conn.ping()
        with conn.cursor() as curs:
            password_hash = base64.b64encode(password_hash)
            salt = base64.b64encode(salt)
            sql = 'INSERT INTO Users (`firstName`, `lastName`, `email`, `passwordHash`, `salt`) VALUES (%s, %s, %s, %s, %s)'
            curs.execute(sql, (first_name, last_name, email, password_hash, salt))
            conn.commit()
            return curs.lastrowid, None
    except Exception as e:
        print(e)
        return None, {
            'err': 'Unable to create user.'
        }


def read_user_by_id(user_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = 'SELECT * FROM Users WHERE `userId`=%s'
            curs.execute(sql, (user_id,))
            conn.commit()
            res = curs.fetchone()
            res['passwordHash'] = base64.b64decode(res['passwordHash'])
            res['salt'] = base64.b64decode(res['salt'])
            if res['tempPasswordHash'] is not None:
                res['tempPasswordHash'] = base64.b64decode(res['tempPasswordHash'])
            if res['tempSalt'] is not None:
                res['tempSalt'] = base64.b64decode(res['tempSalt'])
            return res, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to read user with ID {user_id}'
        }


def read_user_by_email(email: str):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = 'SELECT * FROM Users WHERE `email`=%s'
            curs.execute(sql, (email,))
            conn.commit()
            res = curs.fetchone()
            res['passwordHash'] = base64.b64decode(res['passwordHash'])
            res['salt'] = base64.b64decode(res['salt'])
            if res['tempPasswordHash'] is not None:
                res['tempPasswordHash'] = base64.b64decode(res['tempPasswordHash'])
            if res['tempSalt'] is not None:
                res['tempSalt'] = base64.b64decode(res['tempSalt'])
            return res, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to read user with email {email}'
        }


def update_user(user_id: int, first_name: str, last_name: str, email: str):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            UPDATE Users 
            SET `firstName`=%s, `lastName`=%s, `email`=%s
            WHERE `userId`=%s
            '''
            curs.execute(sql, (first_name, last_name, email, user_id))
            conn.commit()
            return True, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to update user with ID {user_id}'
        }


def update_user_password(user_id: int, password_hash: bytes, salt: bytes):
    try:
        conn.ping()
        with conn.cursor() as curs:
            password_hash = base64.b64encode(password_hash)
            salt = base64.b64encode(salt)
            sql = '''
            UPDATE Users
            SET `passwordHash`=%s, `salt`=%s
            WHERE `userId`=%s
            '''
            curs.execute(sql, (password_hash, salt, user_id))
            conn.commit()
            return None, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to update password for user with ID {user_id}'
        }


def update_user_temp_password(user_id: int, temp_password_hash: [bytes, None], temp_salt: [bytes, None]):
    try:
        conn.ping()
        with conn.cursor() as curs:
            password_hash = base64.b64encode(temp_password_hash) if temp_password_hash is not None else None
            salt = base64.b64encode(temp_salt) if temp_salt is not None else None
            sql = '''
            UPDATE Users
            SET `tempPasswordHash`=%s, `tempSalt`=%s
            WHERE `userId`=%s
            '''
            curs.execute(sql, (password_hash, salt, user_id))
            conn.commit()
            return None, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to update password for user with ID {user_id}'
        }


def delete_user(user_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = 'DELETE FROM Users WHERE `userId`=%s'
            curs.execute(sql, (user_id,))
            conn.commit()
            return None, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to delete user with ID {user_id}'
        }


# SESSIONS
def create_session(user_id: int, token: str):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = 'INSERT INTO Sessions (`userId`, `token`) VALUES (%s, %s)'
            curs.execute(sql, (user_id, token))
            conn.commit()
            return True, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to create session for user with ID {user_id}'
        }


def read_session(token: str):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = 'SELECT userId FROM Sessions WHERE `token`=%s'
            curs.execute(sql, (token,))
            conn.commit()
            return curs.fetchone()['userId'], None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to read session with token {token}'
        }


def delete_session(user_id: int, token: str):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = 'DELETE FROM Sessions WHERE `userId`=%s AND `token`=%s'
            curs.execute(sql, (user_id, token))
            conn.commit()
            return None, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to delete session with user ID {user_id} and token {token}'
        }


# MEDICATIONS
def create_medication(rx_string: str, med_name: str, med_details: str, shape: str, size: int, imprint_front: str, imprint_back: str, color: str, price: float, price_source: str):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            INSERT INTO Medications (`rxString`, `medName`, `medDetails`, `shape`, `size`, `imprintFront`, `imprintBack`, `color`, `price`, `priceSource`)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            '''
            curs.execute(sql, (
                rx_string, med_name, med_details, shape, size, imprint_front, imprint_back, color, price, price_source))
            conn.commit()
            return curs.lastrowid, None
    except Exception as e:
        print(e)
        return None, {
            'err': 'Unable to create medication'
        }


def read_medication(med_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = 'SELECT * FROM Medications WHERE `medId`=%s'
            curs.execute(sql, (med_id,))
            conn.commit()
            return curs.fetchone(), None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to read medication with ID {med_id}'
        }


def update_medication(med_id: int, rx_string: str, med_name: str, med_details: str, shape: str, size: int, imprint_front: str, imprint_back: str, color: str, price: float, price_source: str):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            UPDATE Medications
            SET `rxString`=%s, `medName`=%s, `medDetails`=%s, `shape`=%s, `size`=%s, `imprintFront`=%s, `imprintBack`=%s, `color`=%s, `price`=%s, `priceSource`=%s
            WHERE `medId`=%s
            '''
            curs.execute(sql, (rx_string, med_name, med_details, shape, size, imprint_front, imprint_back, color, price, med_id, price_source))
            conn.commit()
            return None, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to update medication with ID {med_id}'
        }


def delete_medication(med_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = 'DELETE FROM Medications WHERE `medId`=%s'
            curs.execute(sql, (med_id,))
            conn.commit()
            return True, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to delete medication with ID {med_id}'
        }


def search_medication(query: str):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            SELECT * FROM Medications
            WHERE 
                `rxString` LIKE CONCAT('%%', %s, '%%') OR 
                `medName` LIKE CONCAT('%%', %s, '%%') OR 
                `shape` LIKE CONCAT('%%', %s, '%%') OR 
                `size` LIKE CONCAT('%%', %s, '%%') OR 
                `imprintFront` LIKE CONCAT('%%', %s, '%%') OR 
                `imprintBack` LIKE CONCAT('%%', %s, '%%') OR 
                `color` LIKE CONCAT('%%', %s, '%%') OR 
                `price` LIKE CONCAT('%%', %s, '%%')
            LIMIT 10
            '''
            curs.execute(sql, (query, query, query, query, query, query, query, query))
            conn.commit()
            return curs.fetchall(), None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to perform medication query: {query}'
        }


def search_medication_by_attributes(shape: str, size: int, imprint_front: str, imprint_back: str, color: str, color2: str):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = f'''
            SELECT * FROM Medications
            WHERE
                {"`shape` LIKE CONCAT('%%', %s, '%%')" if shape is not None else ""}
                {"AND" if size is not None and shape is not None else ""}
                {"`size` LIKE CONCAT('%%', %s, '%%')" if size is not None else ""}
                {"AND" if imprint_front is not None and (shape is not None or size is not None) else ""}
                {"`imprintFront` LIKE CONCAT('%%', %s, '%%')" if imprint_front is not None else ""}
                {"AND" if imprint_back is not None and (shape is not None or size is not None or imprint_front is not None) else ""}
                {"`imprintBack` LIKE CONCAT('%%', %s, '%%')" if imprint_back is not None else ""}
                {"AND" if color is not None and (shape is not None or size is not None or imprint_front is not None or imprint_back is not None) else ""}
                {"`color` LIKE CONCAT('%%', %s, '%%')" if color is not None else ""}
                {"AND" if color2 is not None and (shape is not None or size is not None or imprint_front is not None or imprint_back is not None or color is not None) else ""}
                {"`color` LIKE CONCAT('%%', %s, '%%')" if color2 is not None else ""}
                LIMIT 50
            '''
            args_tup = ()
            if shape is not None:
                args_tup = args_tup + (shape.upper(),)
            if size is not None:
                args_tup = args_tup + (size,)
            if imprint_front is not None:
                args_tup = args_tup + (imprint_front.upper(),)
            if imprint_back is not None:
                args_tup = args_tup + (imprint_back.upper(),)
            if color is not None:
                args_tup = args_tup + (color.upper(),)
            if color2 is not None:
                args_tup = args_tup + (color2.upper(),)
            curs.execute(sql, args_tup)
            conn.commit()
            return curs.fetchall(), None
    except Exception as e:
        print(e)
        return None, {
            'err': 'Unable to perform medication search by physical attributes.'
        }


# INGREDIENTS
def create_ingredient(ingredient_name: str):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            INSERT INTO Ingredients (`ingredientName`)
            VALUES (%s)
            '''
            curs.execute(sql, (ingredient_name,))
            conn.commit()
            return None, None
    except Exception as e:
        print(e)
        return None, {
            'err': 'Unable to create ingredient'
        }


def delete_ingredient(ingredient_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            DELETE FROM Ingredients
            WHERE `ingredientId`=%s
            '''
            curs.execute(sql, (ingredient_id,))
            conn.commit()
            return None, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to delete ingredient with ID {ingredient_id}'
        }


# USER:IMAGE MAP
def create_user_image_map(user_id: int, image_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            INSERT INTO UserImageMap (`userId`, `imageId`)
            VALUES (%s, %s)
            '''
            curs.execute(sql, (user_id, image_id))
            conn.commit()
            return None, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to create user:image mapping {user_id}:{image_id}'
        }


def read_user_images(user_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            SELECT 
                Images.URL
            FROM UserImageMap
            INNER JOIN Images ON UserImageMap.imageId = Images.imageId
            WHERE UserImageMap.userId=%s
            '''
            curs.execute(sql, (user_id,))
            conn.commit()
            return curs.fetchall(), None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to read user images for user with ID {user_id}'
        }


def delete_user_image_map(user_id: int, image_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            DELETE FROM UserImageMap
            WHERE `userId`=%s AND `imageId`=%s
            '''
            curs.execute(sql, (user_id, image_id))
            conn.commit()
            return None, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to delete user:image mapping {user_id}:{image_id}'
        }


# USER:MEDICATION MAP
def create_user_medication_map(user_id: int, med_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            INSERT INTO UserMedMap (`userId`, `medId`)
            VALUES (%s, %s)
            '''
            curs.execute(sql, (user_id, med_id))
            conn.commit()
            return curs.lastrowid, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to create user:medication mapping {user_id}:{med_id}'
        }


def read_user_medications(user_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            SELECT
                Medications.medId, 
                Medications.rxString, 
                Medications.medName, 
                Medications.medDetails, 
                Medications.shape, 
                Medications.size, 
                Medications.imprintFront, 
                Medications.imprintBack, 
                Medications.color, 
                Medications.price,
                Medications.priceSource
            FROM UserMedMap
            INNER JOIN Medications on UserMedMap.medId=Medications.medId
            WHERE UserMedMap.userId=%s
            '''
            curs.execute(sql, (user_id,))
            conn.commit()
            return curs.fetchall(), None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to read user saved medications for user with ID {user_id}'
        }


def read_user_medication(user_id: int, med_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            SELECT *
            FROM UserMedMap
            WHERE userId=%s AND medId=%s
            '''
            curs.execute(sql, (user_id, med_id))
            conn.commit()
            return curs.fetchone(), None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to read user saved medications for user with ID {user_id}'
        }


def delete_user_medication_map(user_id: int, med_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            DELETE FROM UserMedMap
            WHERE `userId`=%s AND `medId`=%s
            '''
            curs.execute(sql, (user_id, med_id))
            conn.commit()
            return True, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to delete user:medication mapping {user_id}:{med_id}'
        }


# MEDICATION:INGREDIENT MAP
def create_medication_ingredient_map(med_id: int, ingredient_id: int, is_active: bool):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            INSERT INTO MedIngredientMap (`medId`, `ingredientId`, `isActiveIngredient`)
            VALUES (%s, %s, %s)
            '''
            curs.execute(sql, (med_id, ingredient_id, is_active))
            conn.commit()
            return None, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to create medication:ingredient mapping {med_id}:{ingredient_id}'
        }


def read_medication_ingredients(med_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            SELECT `ingredientId`, `isActiveIngredient` FROM MedIngredientMap
            WHERE `medId`=%s
            '''
            curs.execute(sql, (med_id,))
            conn.commit()
            return curs.fetchall(), None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to read medication ingredients for medication with ID {med_id}'
        }


def delete_medication_ingredient_map(med_id: int, ingredient_id: int):
    try:
        conn.ping()
        with conn.cursor() as curs:
            sql = '''
            DELETE FROM MedIngredientMap
            WHERE `medId`=%s AND `ingredientId`=%s
            '''
            curs.execute(sql, (med_id, ingredient_id))
            conn.commit()
            return None, None
    except Exception as e:
        print(e)
        return None, {
            'err': f'Unable to delete medication:ingredient mapping {med_id}:{ingredient_id}'
        }
