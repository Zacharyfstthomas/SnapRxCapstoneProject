# apis.py
# Flask-RESTful API endpoints
import os
import smtplib
import hashlib
import hmac
import db
import uuid
import argparse
import secrets
import string
from flask import Flask, request, jsonify, send_file
from flask_restful import Resource, Api
from newclassifier import predict
from waitress import serve
from schema import *
from pydantic import ValidationError
from flask_swagger_ui import get_swaggerui_blueprint
from email.mime.text import MIMEText


def hash_password(password: str):
    """
    Hashes and salts plaintext password

    :param password: input password
    :return: hash, salt
    """
    salt = os.urandom(16)
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000), salt


def validate_password(password: str, password_hash: bytes, salt: bytes):
    """
    Validates password string against hash and salt values

    :param password: input password string
    :param password_hash: stored password hash
    :param salt: stored password salt
    :return: boolean indicating validation success
    """
    if password_hash is None or salt is None:
        return False
    return hmac.compare_digest(password_hash, hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000))


def generate_session_token(user_id: int):
    """
    Generates session token, writes session to db

    :param user_id: user's ID
    :return: session token
    """
    session_token = str(uuid.uuid4())
    res, err = db.create_session(user_id, session_token)
    if res is not None and err is None:
        return session_token
    else:
        return None


def clear_temp():
    """
    Clears temp directory
    """
    for f in os.listdir('./temp'):
        os.remove(f'./temp/{f}')


# User resources

class SignUp(Resource):
    def post(self):
        """
        /api/v1/users/signup {POST}

        Sign up for an account.

        Request:
            email: user's email address
            password: user's password
            firstName: user's first name
            lastName: user's last name

        Response:
            userId: user's ID
            token: session token
            [message]: status message
            [errors]: list of errors
        """
        try:
            # parse request
            req_json = request.get_json(force=True)
            req = SignUpReq(**req_json)

            # check that user with email doesn't already exist
            user, _ = db.read_user_by_email(req.email)
            if user is not None:
                res = jsonify({
                    'message': 'Another user with that email address already exists.'
                })
                res.status_code = 403
                return res

            # create new user record
            password_hash, salt = hash_password(req.password)
            user_id, err = db.create_user(req.firstName, req.lastName, req.email, password_hash, salt)

            if user_id is not None and err is None:
                res = jsonify({
                    'userId': user_id,
                    'token': generate_session_token(user_id)
                })
                res.status_code = 200
            else:
                res = jsonify({
                    'message': 'Unable to create account. Please try again.'
                })
                res.status_code = 500
            return res
        except ValidationError as e:
            res = jsonify({
                'errors': e.errors()
            })
            res.status_code = 400
            return res


class Login(Resource):
    def post(self):
        """
        /api/v1/users/login {POST}

        Login to existing account.

        Request:
            email: user's email address
            password: user's password

        Response:
            userId: user's ID
            token: session token
            [message]: status message
            [errors]: list of errors
        """
        try:
            # parse request
            req_json = request.get_json(force=True)
            req = LoginReq(**req_json)

            # validate login info
            user_data, err = db.read_user_by_email(req.email)
            if user_data is not None and 'passwordHash' in user_data and 'salt' in user_data and (validate_password(
                    req.password, user_data['passwordHash'], user_data['salt']) or validate_password(req.password, user_data['tempPasswordHash'], user_data['tempSalt'])) and err is None:
                # valid login details, produce session token
                res = jsonify({
                    'userId': user_data['userId'],
                    'token': generate_session_token(user_data['userId'])
                })
                res.status_code = 200
            else:
                # invalid login details, return error message
                res = jsonify({
                    'message': 'Invalid credentials.'
                })
                res.status_code = 403
            return res
        except ValidationError as e:
            res = jsonify({
                'errors': e.errors()
            })
            res.status_code = 400
            return res


class ResetPassword(Resource):
    def post(self):
        """
        /api/v1/users/reset-password {POST}

        Resets user's password to temporary password and sends email containing temporary password.

        Request:
            email: user's email address

        Response:
            [message]: status message
            [errors]: list of errors
        """
        try:
            # parse request
            req_json = request.get_json(force=True)
            req = ResetPasswordReq(**req_json)

            # validate req email
            user_data, err = db.read_user_by_email(req.email)
            if user_data is None or err is not None:
                # no user with given email exists, return success
                res = jsonify({
                    'message': 'Could not find an account matching the given email address.'
                })
                res.status_code = 404
                return res

            # compose password recovery email message
            sender_address = 'noreply.snaprx@gmail.com'
            temp_pass = ''.join(secrets.choice(string.ascii_uppercase + string.ascii_lowercase) for _ in range(15))
            msg = MIMEText(f'{user_data["firstName"]},\n\nA request has been made to reset your SnapRx account password. Please use the provided temporary password to access your account.\n\nTemporary password: {temp_pass}', 'plain')
            msg['Subject'] = 'Your SnapRx temporary password'
            msg['From'] = sender_address

            # connect to SMTP server
            conn = smtplib.SMTP('smtp-relay.sendinblue.com', 587)
            conn.starttls()
            conn.ehlo()
            conn.login(sender_address, os.environ.get('SMTP_PASS'))

            try:
                # send reset password email
                conn.sendmail(sender_address, [req.email], msg.as_string())

                # update temporary password details
                temp_password_hash, temp_salt = hash_password(temp_pass)
                db.update_user_temp_password(user_data['userId'], temp_password_hash, temp_salt)

                res = jsonify({
                    'message': 'success'
                })
                res.status_code = 200
                return res
            except Exception as e:
                # failed to send email - internal server error
                res = jsonify({
                    'message': str(e)
                })
                res.status_code = 500
                return res
            finally:
                conn.quit()
        except ValidationError as e:
            res = jsonify({
                'errors': e.errors()
            })
            res.status_code = 400
            return res
        except Exception as e:
            res = jsonify({
                'message': str(e)
            })
            res.status_code = 500
            return res


class ValidateUserSession(Resource):
    def post(self, user_id):
        """
        /api/v1/users/<user_id>/validate-session {POST}

        Validate user session token.

        Request:
            N/A

        Response:
            [message]: status message
            [errors]: list of errors
        """
        try:
            # validate session
            user_id = int(user_id)
            token = request.headers.get('Authorization')
            sess_user_id, err = db.read_session(token)
            if err is not None or sess_user_id != user_id:
                res = jsonify({
                    'message': 'Invalid session.'
                })
                res.status_code = 403
            else:
                res = jsonify({
                    'message': 'Session validated.'
                })
                res.status_code = 200
            return res
        except Exception as e:
            res = jsonify({
                'message': str(e)
            })
            res.status_code = 403
            return res


class UpdatePassword(Resource):
    def post(self, user_id):
        """
        /api/v1/users/<user_id>/update-password {POST}

        Update password of user account.

        Request:
            oldPassword: old password
            newPassword: new password

        Response:
            [message]: status message
            [errors]: list of errors
        """
        try:
            # parse request
            req_json = request.get_json(force=True)
            req = UpdatePasswordReq(**req_json)
            user_id = int(user_id)

            # validate session
            token = request.headers.get('Authorization')
            sess_user_id, err = db.read_session(token)
            if err is not None or sess_user_id != user_id:
                res = jsonify({
                    'message': 'Invalid session.'
                })
                res.status_code = 403
                return res

            # fetch user object
            user_data, err = db.read_user_by_id(user_id)
            if user_data is not None and (validate_password(req.oldPassword, user_data['passwordHash'], user_data['salt']) or validate_password(req.oldPassword, user_data['tempPasswordHash'], user_data['tempSalt'])) and err is None:
                # valid old password, update password
                password_hash, salt = hash_password(req.newPassword)
                db.update_user_password(user_data['userId'], password_hash, salt)
                db.update_user_temp_password(user_data['userId'], None, None)
                res = jsonify({
                    'message': 'User password updated.'
                })
                res.status_code = 200
            else:
                # invalid old password, return error message
                res = jsonify({
                    'message': 'Invalid credentials.'
                })
                res.status_code = 403
            return res
        except ValidationError as e:
            res = jsonify({
                'errors': e.errors()
            })
            res.status_code = 400
            return res


class User(Resource):
    def get(self, user_id=None):
        """
        /api/v1/users/<user_id> {GET}

        Get user details.

        Request:
            N/A

        Response:
            firstName: user's first name
            lastName: user's last name
            email: user's email address
            savedMedications: list of user's saved medications
            [message]: status message
        """
        # validate session
        user_id = int(user_id)
        token = request.headers.get('Authorization')
        sess_user_id, err = db.read_session(token)
        if err is not None or sess_user_id != user_id:
            res = jsonify({
                'message': 'Invalid session.'
            })
            res.status_code = 403
            return res

        user_data, err = db.read_user_by_id(user_id)
        if user_data is not None and err is None:
            res = jsonify({
                'firstName': user_data['firstName'],
                'lastName': user_data['lastName'],
                'email': user_data['email'],
                'savedMedications': db.read_user_medications(user_id)[0]
            })
            res.status_code = 200
        else:
            res = jsonify({
                'message': 'Invalid userId.'
            })
            res.status_code = 403
        return res

    def put(self, user_id=None):
        """
        /api/v1/users/<user_id> {PUT}

        Update user account details.

        Request:
            [firstName]: user's first name
            [lastName]: user's last name
            [email]: user's email address

        Response:
            [message]: status message
            [errors]: list of errors
        """
        try:
            # parse request
            req_json = request.get_json(force=True)
            req = UpdateUserDetailsReq(**req_json)
            user_id = int(user_id)

            # validate session
            token = request.headers.get('Authorization')
            sess_user_id, err = db.read_session(token)
            if err is not None or sess_user_id != user_id:
                res = jsonify({
                    'message': 'Invalid session.'
                })
                res.status_code = 403
                return res

            user_data, err = db.read_user_by_id(user_id)
            if user_data is not None and err is None:
                new_first_name = req.firstName if req.firstName is not None else user_data['firstName']
                new_last_name = req.lastName if req.lastName is not None else user_data['lastName']
                new_email = req.email if req.email is not None else user_data['email']

                # ensure that provided email address is not already in use
                if new_email != user_data['email']:
                    user_data, _ = db.read_user_by_email(new_email)
                    if user_data is not None:
                        res = jsonify({
                            'message': 'Another user with that email address already exists.'
                        })
                        res.status_code = 403
                        return res

                res, err = db.update_user(user_id, new_first_name, new_last_name, new_email)
                if res is not None and err is None:
                    res = jsonify({
                        'message': 'Successfully updated user details.'
                    })
                    res.status_code = 200
                else:
                    res = jsonify({
                        'message': 'An error occurred when updating user details.'
                    })
                    res.status_code = 500
            else:
                res = jsonify({
                    'message': f'Invalid userId {user_id}.'
                })
                res.status_code = 403
            return res
        except ValidationError as e:
            res = jsonify({
                'errors': e.errors()
            })
            res.status_code = 400
            return res

    def delete(self, user_id=None):
        """
        /api/v1/users/<user_id> {DELETE}

        Delete user account.

        Request:
            password: user's password

        Response:
            [message]: status message
            [errors]: list of errors
        """
        try:
            # parse request
            req_json = request.get_json(force=True)
            req = DeleteUserReq(**req_json)
            user_id = int(user_id)

            # validate session
            token = request.headers.get('Authorization')
            sess_user_id, err = db.read_session(token)
            if err is not None or sess_user_id != user_id:
                res = jsonify({
                    'message': 'Invalid session.'
                })
                res.status_code = 403
                return res

            user_data, err = db.read_user_by_id(user_id)
            if user_data is not None and validate_password(req.password, user_data['passwordHash'], user_data['salt']) and err is None:
                # valid password, delete user
                db.delete_user(user_id)
                res = jsonify({
                    'message': 'User account deleted.'
                })
                res.status_code = 200
            else:
                # invalid password, return error message
                res = jsonify({
                    'message': 'Invalid credentials.'
                })
                res.status_code = 403
            return res
        except ValidationError as e:
            res = jsonify({
                'errors': e.errors()
            })
            res.status_code = 400
            return res


class UserMedications(Resource):
    def get(self, user_id):
        """
        /api/v1/users/<user_id>/medications {GET}

        Get user medication data.

        Request:
            N/A

        Response:
            medications: list of user's saved medications
            [message]: status message
        """
        # validate session
        user_id = int(user_id)
        token = request.headers.get('Authorization')
        sess_user_id, err = db.read_session(token)
        if err is not None or sess_user_id != user_id:
            res = jsonify({
                'message': 'Invalid session.'
            })
            res.status_code = 403
            return res

        user_medications, err = db.read_user_medications(user_id)
        if user_medications is not None and err is None:
            # retrieved user medication data, return success
            res = jsonify({
                'medications': user_medications
            })
            res.status_code = 200
        else:
            # failed to retrieve user medication data, return error message
            res = jsonify({
                'message': 'Unable to retrieve user medication data.'
            })
            res.status_code = 500
        return res

    def put(self, user_id, med_id):
        """
        /api/v1/users/<user_id>/medications/<med_id> {PUT}

        Add medication to user's saved medications.

        Request:
            N/A

        Response:
            [message]: status message
        """
        # validate session
        user_id = int(user_id)
        token = request.headers.get('Authorization')
        sess_user_id, err = db.read_session(token)
        if err is not None or sess_user_id != user_id:
            res = jsonify({
                'message': 'Invalid session.'
            })
            res.status_code = 403
            return res

        res, err = db.create_user_medication_map(user_id, med_id)
        if res is not None and err is None:
            res = jsonify({
                'message': 'Created user:medication mapping.'
            })
            res.status_code = 200
        else:
            res = jsonify({
                'message': 'An error occurred when creating user:medication mapping.'
            })
            res.status_code = 500
        return res

    def post(self, user_id):
        """
        /api/v1/users/<user_id>/medications/check-saved {POST}

        Check whether medication exists in user's saved medications.

        Request:
            medId: ID of medication to search for in user's saved medications

        Response:
            isMedicationSaved: boolean flag for whether user has medication saved
            [message]: status message
        """
        try:
            # parse request
            req_json = request.get_json(force=True)
            req = CheckSavedMedicationReq(**req_json)
            user_id = int(user_id)

            # validate session
            token = request.headers.get('Authorization')
            sess_user_id, err = db.read_session(token)
            if err is not None or sess_user_id != user_id:
                res = jsonify({
                    'message': 'Invalid session.'
                })
                res.status_code = 403
                return res

            user_med_map, err = db.read_user_medication(user_id, req.medId)
            if user_med_map is not None and err is None:
                # confirmed user-med mapping exists, user has medication saved
                res = jsonify({
                    'isMedicationSaved': True
                })
            else:
                # failed to retrieve user-med mapping, user does not have medication saved
                res = jsonify({
                    'isMedicationSaved': False
                })
            res.status_code = 200
            return res
        except ValidationError as e:
            res = jsonify({
                'errors': e.errors()
            })
            res.status_code = 400
            return res

    def delete(self, user_id, med_id):
        """
        /api/v1/users/<user_id>/medications/<med_id> {DELETE}

        Delete medication from user's saved medications.

        Request:
            N/A

        Response:
            [message]: status message
        """
        # validate session
        user_id = int(user_id)
        token = request.headers.get('Authorization')
        sess_user_id, err = db.read_session(token)
        if err is not None or sess_user_id != user_id:
            res = jsonify({
                'message': 'Invalid session.'
            })
            res.status_code = 403
            return res

        res, err = db.delete_user_medication_map(user_id, med_id)
        if res is not None and err is None:
            res = jsonify({
                'message': 'Deleted user:medication mapping'
            })
            res.status_code = 200
        else:
            res = jsonify({
                'message': 'An error occurred when deleting user:medication mapping.'
            })
            res.status_code = 500
        return res


# Medication resources

class Medication(Resource):
    def get(self, med_id=None):
        """
        /api/v1/medications/<med_id> {GET}

        Get medication details.

        Request:
            N/A

        Response:
            medName: medication name
            medDetails: details string
            [rxString]: prescription string
            [shape]: shape of medication
            [size]: size of medication
            [imprintFront]: imprint on front of medication
            [imprintBack]: imprint on back of medication
            [color]: color of medication
            [price]: medication price
            [priceSource]: source of medication price data
            [message]: status message
        """
        med_data, err = db.read_medication(med_id)
        if med_data is not None and err is None:
            res = jsonify(med_data)
            res.status_code = 200
        else:
            res = jsonify({
                'message': 'Unable to fetch medication data.'
            })
            res.status_code = 403
        return res

    def put(self):
        """
        /api/v1/medications {PUT}

        Add new medication.
        # TODO: this may not need to be a user-facing API
        # TODO: do something with active/inactive ingredient data

        Request:
            medName: medication name
            medDetails: details string
            [rxString]: prescription string
            [shape]: shape of medication
            [size]: size of medication
            [imprintFront]: imprint on front of medication
            [imprintBack]: imprint on back of medication
            [color]: color of medication
            [price]: medication price
            [priceSource]: source of medication price data

        Response:
            [message]: status message
            [errors]: list of errors
        """
        try:
            req_json = request.get_json(force=True)
            req = PutMedicationReq(**req_json)

            # create medication entry
            med_id, err = db.create_medication(
                req.rxString,
                req.medName,
                req.medDetails,
                req.shape,
                req.size,
                req.imprintFront,
                req.imprintBack,
                req.color,
                req.price,
                req.priceSource
            )

            if med_id is not None and err is None:
                res = jsonify({
                    'medId': med_id
                })
                res.status_code = 200
            else:
                res = jsonify({
                    'message': 'An error occurred when creating medication entry.'
                })
                res.status_code = 500
            return res
        except ValidationError as e:
            res = jsonify({
                'errors': e.errors()
            })
            res.status_code = 400
            return res

    def delete(self, med_id=None):
        """
        /api/v1/medications/<med_id> {DELETE}

        Delete medication by ID.
        # TODO: this may not need to be a user-facing API

        Request: N/A

        Response:
            [message]: status message
        """
        res, err = db.delete_medication(med_id)
        if res is not None and err is None:
            res = jsonify({
                'message': 'Medication entry deleted.'
            })
            res.status_code = 200
        else:
            res = jsonify({
                'message': 'An error occurred when deleting medication entry.'
            })
            res.status_code = 500
        return res


class SearchMedications(Resource):
    def post(self):
        """
        /api/v1/medications/search {POST}

        Search medications by query string.

        Request:
            query: query string

        Response:
            results: list of medications matching search query
            [message]: status message
            [errors]: list of errors
        """
        try:
            req_json = request.get_json(force=True)
            req = SearchMedicationsReq(**req_json)
            res, err = db.search_medication(req.query)
            if err is None:
                if res is not None:
                    res = jsonify({
                        'results': res
                    })
                else:
                    res = jsonify({
                        'results': []
                    })
                res.status_code = 200
            else:
                res = jsonify({
                    'message': 'Unable to get medication results for provided query.'
                })
                res.status_code = 404
            return res
        except ValidationError as e:
            res = jsonify({
                'errors': e.errors()
            })
            res.status_code = 400
            return res


class ClassifyMedicationByImage(Resource):
    def post(self):
        """
        /api/v1/medications/classify-by-image {POST}

        Classify uploaded medication image.

        Request:
            img: uploaded image

        Response:
            predMedClass: predicted medication class
            predConfidence: confidence of prediction (0-1)
            results: list of meds matching predicted class
            [message]: status message
            [errors]: list of errors
        """
        img = request.files['img']
        img_path = f'temp/{img.filename}'
        img.save(img_path)
        prediction, confidence = predict(img_path)
        clear_temp()
        results, err = db.search_medication(prediction.split(' ')[0])
        if results is not None and err is None and len(results) != 0:
            res = jsonify({
                'predMedClass': prediction,
                'predConfidence': str(round(confidence, 2)),
                'results': results[:5]
            })
            res.status_code = 200
        else:
            res = jsonify({
                'message': 'An error occurred when labeling pill image.'
            })
            res.status_code = 500
        return res


class MedicationImage(Resource):
    def get(self, med_name=None):
        """
        /api/v1/medications/img/<med_name> {GET}

        Get sample image for medication (only for med names recognized by image classifier).

        Request:
            N/A

        Response:
            [message]: status message
        """
        try:
            return send_file(f'./static/img/{med_name}.JPG'.replace('%20', ' '))
        except FileNotFoundError:
            try:
                return send_file(f'./static/img/{med_name}.PNG'.replace('%20', ' '))
            except FileNotFoundError:
                res = jsonify({
                    'message': 'Unable to find image for provided medication.'
                })
                res.status_code = 404
                return res


class ClassifyMedicationByDescription(Resource):
    def post(self):
        """
        /api/v1/medications/classify-by-description {POST}

        Classify medication by physical description.

        Request:
            [shape]: shape of medication
            [size]: size of medication
            [imprintFront]: imprint on front of medication
            [imprintBack]: imprint on back of medication
            [color]: color of medication
            [color2]: secondary color of medication

        Response:
            results: list of classifier predictions
            [message]: status message
            [errors]: list of errors
        """
        try:
            req_json = request.get_json(force=True)
            req = ClassifyMedicationByDescriptionReq(**req_json)

            res, err = db.search_medication_by_attributes(
                req.shape,
                req.size,
                req.imprintFront,
                req.imprintBack,
                req.color,
                req.color2
            )
            if res is not None and err is None:
                res = jsonify({
                    'results': res
                })
                res.status_code = 200
            else:
                res = jsonify({
                    'message': 'Unable to get medication results for provided physical description.'
                })
                res.status_code = 404
            return res
        except ValidationError as e:
            res = jsonify({
                'errors': e.errors()
            })
            res.status_code = 400
            return res


# init app and api objects
app = Flask(__name__)
api = Api(app)

# swagger documentation setup
SWAGGER_URL = '/docs'
API_URL = '/static/swagger.json'
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "SnapRx"
    }
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

# endpoint constants
API_BASE = '/api/v1/'

# Attach user resource endpoints
api.add_resource(User,
                 API_BASE + 'users/<user_id>')
api.add_resource(SignUp,
                 API_BASE + 'users/signup')
api.add_resource(Login,
                 API_BASE + 'users/login')
api.add_resource(ResetPassword,
                 API_BASE + 'users/reset-password')
api.add_resource(ValidateUserSession,
                 API_BASE + 'users/<user_id>/validate-session')
api.add_resource(UpdatePassword,
                 API_BASE + 'users/<user_id>/update-password')
api.add_resource(UserMedications,
                 API_BASE + 'users/<user_id>/medications',
                 API_BASE + 'users/<user_id>/medications/<med_id>',
                 API_BASE + 'users/<user_id>/medications/check-saved')

# Attach medication resource endpoints
api.add_resource(Medication,
                 API_BASE + 'medications',
                 API_BASE + 'medications/<med_id>')
api.add_resource(SearchMedications,
                 API_BASE + 'medications/search')
api.add_resource(ClassifyMedicationByImage,
                 API_BASE + 'medications/classify-by-image')
api.add_resource(MedicationImage,
                 API_BASE + 'medications/img/<med_name>')
api.add_resource(ClassifyMedicationByDescription,
                 API_BASE + 'medications/classify-by-description')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-prod', action='store_true')
    args = parser.parse_args()

    # determine whether to run production or dev environment
    if args.prod:
        serve(app, host='0.0.0.0', port='8080')
    else:
        app.run(debug=True)
