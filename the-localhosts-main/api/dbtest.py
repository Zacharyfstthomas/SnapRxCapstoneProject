import unittest
import db
import apis


class TestDBMethods(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """
        Initialize test environment for apis.py tests
        """
        cls._tester = apis.app.test_client()
        cls._test_user_data = {
            'userId': 1,
            'email': 'test@email.com',
            'password': 'testpass',
            'firstName': 'First',
            'lastName': 'Last'
        }
        cls._test_medication_data = {
            'medId': 1,
            'rxString': '',
            'medName': 'Ibuprofen',
            'medDetails': '',
            'shape': 'round',
            'size': 10,
            'imprintFront': 'ABC',
            'imprintBack': 'XYZ',
            'color': 'white'
        }
    
    def test_create_user(self):
        test_pass, test_salt = apis.hash_password('testpass')
        res, err = db.create_user('First', 'Last', 'test@email.com', test_pass, test_salt)
        self.assertIsInstance(res, int)
        self.assertIsNone(err)

    def test_read_user_by_id(self):
        # create user to test
        new_user_pass = 'testpass'
        new_user_pass_hash, new_user_pass_salt = apis.hash_password(new_user_pass)
        new_user_id = db.create_user('First', 'Last', 'test@email.com', new_user_pass_hash, new_user_pass_salt)

        # read user by ID
        res, err = db.read_user_by_id(new_user_id)
        self.assertIsInstance(res, dict)
        self.assertIsNone(err)

    def test_read_user_by_email(self):
        # create user to test
        new_user_email = 'test@email.com'
        new_user_pass = 'testpass'
        new_user_pass_hash, new_user_pass_salt = apis.hash_password(new_user_pass)
        db.create_user('First', 'Last', new_user_email, new_user_pass_hash, new_user_pass_salt)

        # read user by email
        res, err = db.read_user_by_email(new_user_email)
        self.assertIsInstance(res, dict)
        self.assertIsNone(err)

    def test_update_user(self):
        # create user to test
        new_user_email = 'test@email.com'
        new_user_pass = 'testpass'
        new_user_pass_hash, new_user_pass_salt = apis.hash_password(new_user_pass)
        db.create_user('First', 'Last', new_user_email, new_user_pass_hash, new_user_pass_salt)

        test_id = 1
        updated_user_first_name = 'First2'
        updated_user_last_name = 'Last2'
        updated_user_email = 'test2@email.com'
        res, err = db.update_user(test_id, updated_user_first_name, updated_user_last_name, updated_user_email)
        self.assertIsInstance(res, bool)
        self.assertIsNone(err)

    def test_update_user_password(self):
        # create user to test
        new_user_pass = 'testpass'
        new_user_pass_hash, new_user_pass_salt = apis.hash_password(new_user_pass)
        new_user_id = db.create_user('First', 'Last', 'test@email.com', new_user_pass_hash, new_user_pass_salt)

        # change new user's password
        updated_pass = 'testpass2'
        updated_pass_hash, updated_pass_salt = apis.hash_password(updated_pass)
        _, err = db.update_user_password(new_user_id, updated_pass_hash, updated_pass_salt)
        self.assertIsNone(err)
