import os
import unittest
import json
import apis
import db


class TestApiMethods(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """
        Initialize test environment for apis.py tests
        """
        # remove test users from db if they exists
        user, _ = db.read_user_by_email('test@email.com')
        if user is not None:
            db.delete_user(user['userId'])
        user2, _ = db.read_user_by_email('test2@email.com')
        if user2 is not None:
            db.delete_user(user2['userId'])
        user3, _ = db.read_user_by_email('signuptest@email.com')
        if user3 is not None:
            db.delete_user(user3['userId'])

        cls._tester = apis.app.test_client()
        cls._test_signup_user_data = {
            'email': 'signuptest@email.com',
            'password': 'testpass',
            'firstName': 'First',
            'lastName': 'Last'
        }
        cls._test_user_data = {
            'email': 'test@email.com',
            'password': 'testpass',
            'firstName': 'First',
            'lastName': 'Last'
        }
        cls._test_user2_data = {
            'email': 'test2@email.com',
            'password': 'testpass',
            'firstName': 'First',
            'lastName': 'Last'
        }
        cls._test_medication_data = {
            'rxString': '',
            'medName': 'Ibuprofen',
            'medDetails': '',
            'shape': 'round',
            'size': 10,
            'imprintFront': 'ABC',
            'imprintBack': 'XYZ',
            'color': 'white',
            'price': 9.99,
            'priceSource': 'Amazon'
        }
        cls._test_medication_class = 'ADALAT CC'

        # add test user to db
        test_user_pass_hash, test_user_pass_salt = apis.hash_password(cls._test_user_data['password'])
        user_id, err = db.create_user(
            cls._test_user_data['firstName'],
            cls._test_user_data['lastName'],
            cls._test_user_data['email'],
            test_user_pass_hash,
            test_user_pass_salt
        )
        if err is not None:
            raise RuntimeError(err)
        cls._test_user_data['userId'] = user_id

        # create session for test user
        cls._test_user_token = '4f4decb5-79e5-4910-b71b-8f9bbbf67a4b'
        db.create_session(user_id, cls._test_user_token)

        # add separate test user for delete API
        test_user_pass_hash, test_user_pass_salt = apis.hash_password(cls._test_user2_data['password'])
        user_id, err = db.create_user(
            cls._test_user2_data['firstName'],
            cls._test_user2_data['lastName'],
            cls._test_user2_data['email'],
            test_user_pass_hash,
            test_user_pass_salt
        )
        if err is not None:
            raise RuntimeError(err)
        cls._test_delete_user_data = {
            'userId': user_id
        }

        # create session for second user
        cls._test_user2_token = '7d7ea580-6e51-4a64-a735-f734df978f3f'
        db.create_session(user_id, cls._test_user2_token)

        # add test medication to db
        med_id, err = db.create_medication(
            cls._test_medication_data['rxString'],
            cls._test_medication_data['medName'],
            cls._test_medication_data['medDetails'],
            cls._test_medication_data['shape'],
            cls._test_medication_data['size'],
            cls._test_medication_data['imprintFront'],
            cls._test_medication_data['imprintBack'],
            cls._test_medication_data['color'],
            cls._test_medication_data['price'],
            cls._test_medication_data['priceSource']
        )
        if err is not None:
            raise RuntimeError(err)
        cls._test_medication_data['medId'] = med_id

        # add test medication to test user's saved medications
        db.create_user_medication_map(cls._test_user_data['userId'], med_id)

        # add separate test medication for delete API
        med_id, err = db.create_medication(
            cls._test_medication_data['rxString'],
            cls._test_medication_data['medName'],
            cls._test_medication_data['medDetails'],
            cls._test_medication_data['shape'],
            cls._test_medication_data['size'],
            cls._test_medication_data['imprintFront'],
            cls._test_medication_data['imprintBack'],
            cls._test_medication_data['color'],
            cls._test_medication_data['price'],
            cls._test_medication_data['priceSource']
        )
        if err is not None:
            raise RuntimeError(err)
        cls._test_delete_medication_data = {
            'medId': med_id
        }

    def test_hash_and_validate_password(self):
        """
        Test the hash_password and validate_password functions
        """
        test_pass = 'testpass'
        test_pass2 = 'testpass2'
        pass_hash, pass_salt = apis.hash_password(test_pass)
        self.assertTrue(apis.validate_password(test_pass, pass_hash, pass_salt))
        self.assertFalse(apis.validate_password(test_pass2, pass_hash, pass_salt))

    def test_generate_session_token(self):
        """
        Test generate_session_token function
        """
        session_token = apis.generate_session_token(int(self._test_user_data['userId']))
        self.assertIsNot(session_token, None) 
        
    def test_clear_temp(self):
        """
        Test clearing temp directory function
        """
        apis.clear_temp()
        self.assertFalse(next(os.scandir('./temp'), None))


    def test_signup(self):
        """
        Test user sign up API: /api/v1/users/signup {POST}
        """
        res = self._tester.post(
            '/api/v1/users/signup',
            data=json.dumps(self._test_signup_user_data))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')
        self.assertTrue(b'userId' in res.data)
        self.assertTrue(b'token' in res.data)
        user, _ = db.read_user_by_email('signuptest@email.com')
        if user is not None:
            db.delete_user(user['userId'])

    def test_login(self):
        """
        Test user login API: /api/v1/users/login {POST}
        """
        res = self._tester.post('/api/v1/users/login', data=json.dumps({
            'email': self._test_user_data['email'],
            'password': self._test_user_data['password']
        }))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')
        self.assertTrue(b'userId' in res.data)
        self.assertTrue(b'token' in res.data)

    def test_reset_password(self):
        """
        Test user reset password API: /api/v1/users/reset-password {POST} 
        """
        res = self._tester.post('/api/v1/users/reset-password', data=json.dumps({
            'email': self._test_user_data['email']
        }))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')
        self.assertTrue(b'message' in res.data)

    def test_validate_user_session(self):
        """
        Test user validating session API: /api/v1/users/<user_id>/validate-session {POST} 
        """
        res = self._tester.post(
            f'/api/v1/users/{self._test_user_data["userId"]}/validate-session',
            headers={
                'Authorization': self._test_user_token
            })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')
        self.assertTrue(b'message' in res.data)

    def test_update_password(self):
        """
        Test user update password API: /api/v1/users/<user_id>/update-password {POST}
        """
        res = self._tester.post(f'/api/v1/users/{self._test_user_data["userId"]}/update-password',
                                data=json.dumps({
                                    'oldPassword': self._test_user_data['password'],
                                    'newPassword': self._test_user_data['password']
                                }),
                                headers={
                                    'Authorization': self._test_user_token
                                })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')
        self.assertTrue(b'message' in res.data)

    def test_get_user_details(self):
        """
        Test get user details API: /api/v1/users/<user_id> {GET}
        """
        res = self._tester.get(
            f'/api/v1/users/{self._test_user_data["userId"]}',
            headers={
                'Authorization': self._test_user_token
            })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')
        self.assertTrue(b'firstName' in res.data)
        self.assertTrue(b'lastName' in res.data)
        self.assertTrue(b'email' in res.data)
        self.assertTrue(b'savedMedications' in res.data)

    def test_put_user_details(self):
        """
        Test update user details API: /api/v1/users/<user_id> {PUT}
        """
        res = self._tester.put(
            f'/api/v1/users/{self._test_user_data["userId"]}',
            data=json.dumps({
                'firstName': self._test_user_data['firstName'],
                'lastName': self._test_user_data['lastName'],
                'email': self._test_user_data['email']
            }),
            headers={
                'Authorization': self._test_user_token
            })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')
        self.assertTrue(b'message' in res.data)

    def test_delete_user(self):
        """
        Test delete user API: /api/v1/users/<user_id> {DELETE}
        """
        res = self._tester.delete(
            f'/api/v1/users/{self._test_delete_user_data["userId"]}',
            data=json.dumps({
                'password': self._test_user2_data['password']
            }),
            headers={
                'Authorization': self._test_user2_token
            })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')
        self.assertTrue(b'message' in res.data)

    def test_get_user_medications(self):
        """
        Test get user saved medications API: /api/v1/users/<user_id>/medications {GET}
        """
        res = self._tester.get(
            f'/api/v1/users/{self._test_user_data["userId"]}/medications',
            headers={
                'Authorization': self._test_user_token
            })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')
        self.assertTrue(b'medications' in res.data)

    def test_put_user_medications(self):
        """
        Test add user saved medication API: /api/v1/users/<user_id>/medications/<med_id> {PUT}
        """
        res = self._tester.put(
            f'/api/v1/users/{self._test_user_data["userId"]}/medications/{self._test_medication_data["medId"]}',
            headers={
                'Authorization': self._test_user_token
            })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')

    def test_post_user_medications(self):
        res = self._tester.post(f'/api/v1/users/{self._test_user_data["userId"]}/medications/check-saved',
                                data=json.dumps({
                                    'medId': self._test_medication_data['medId']
                                }),
                                headers={
                                    'Authorization': self._test_user_token
                                })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')
        self.assertTrue(b'isMedicationSaved' in res.data)

    def test_delete_user_medication(self):
        """
        Test delete user saved medication API: /api/v1/users/<user_id>/medications/<med_id> {DELETE}
        """
        res = self._tester.delete(
            f'/api/v1/users/{self._test_user_data["userId"]}/medications/{self._test_medication_data["medId"]}',
            headers={
                'Authorization': self._test_user_token
            })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')

    def test_get_medication(self):
        """
        Test get medication details API: /api/v1/medications/<med_id> {GET}
        """
        res = self._tester.get(f'/api/v1/medications/{self._test_medication_data["medId"]}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')
        self.assertTrue(b'medId' in res.data)

    def test_put_medication(self):
        """
        Test add medication API: /api/v1/medications {PUT}
        """
        res = self._tester.put('/api/v1/medications', data=json.dumps(self._test_medication_data))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')

    def test_delete_medication(self):
        """
        Test delete medication API: /api/v1/medications/<med_id> {DELETE}
        """
        res = self._tester.delete(f'/api/v1/medications/{self._test_delete_medication_data["medId"]}')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')

    def test_search_medications(self):
        """
        Test search medications API: /api/v1/medications/search {POST}
        """
        res = self._tester.post(f'/api/v1/medications/search', data=json.dumps({
            'query': 'Ibuprofen'
        }))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')

    def test_classify_medication_by_description(self):
        """
        Test classify medication by description API: /api/v1/medications/classify-by-description {POST}
        """
        res = self._tester.post(f'/api/v1/medications/classify-by-description', data=json.dumps({
            'shape': 'round',
            'size': 10,
            'imprintFront': 'ABC',
            'imprintBack': 'XYZ',
            'color': 'white'
        }))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.content_type, 'application/json')
        self.assertTrue(b'results' in res.data)

    def test_get_medication_image(self):
        """
        Test get medication details API: /api/v1/medications/img/<med_name> {GET}
        """
        res = self._tester.get(f'/api/v1/medications/img/{self._test_medication_class}')
        self.assertEqual(res.status_code, 200)
        self.assertIn('image/', res.content_type)
