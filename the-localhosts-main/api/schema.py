# schema.py
# Pydantic models for request and response validation

from pydantic import BaseModel
from typing import Optional


class Medication(BaseModel):
    """
    Medication object schema

    Attributes:
        medName: medication name
        medDetails: details string
        [brandId]: manufacturing brand ID
        [rxString]: prescription string
        [shape]: shape of medication
        [size]: size of medication
        [imprintFront]: imprint on front of medication
        [imprintBack]: imprint on back of medication
        [color]: color of medication
        [price]: medication price
    """
    medName: str
    medDetails: str
    brand: Optional[str]
    rxString: Optional[str]
    shape: Optional[str]
    size: Optional[int]
    imprintFront: Optional[str]
    imprintBack: Optional[str]
    color: Optional[str]
    price: Optional[float]


class SignUpReq(BaseModel):
    """
    Req schema /api/v1/users/signup {POST}

    Request:
        email: user's email address
        password: user's password
        firstName: user's first name
        lastName: user's last name
    """
    email: str
    password: str
    firstName: str
    lastName: str


class LoginReq(BaseModel):
    """
    Req schema /api/v1/users/login {POST}

    Request:
        email: user's email address
        password: user's password
    """
    email: str
    password: str


class ResetPasswordReq(BaseModel):
    """
    Req schema /api/v1/users/reset-password {POST}

    Request:
        email: user's email address
    """
    email: str


class UpdatePasswordReq(BaseModel):
    """
    Req schema /api/v1/users/<user_id>/update-password {POST}

    Request:
        oldPassword: old password
        newPassword: new password
    """
    oldPassword: str
    newPassword: str


class UpdateUserDetailsReq(BaseModel):
    """
    Req schema /api/v1/users/<user_id> {PUT}

    Request:
        [firstName]: user's first name
        [lastName]: user's last name
        [email]: user's email address
    """
    firstName: Optional[str]
    lastName: Optional[str]
    email: Optional[str]


class DeleteUserReq(BaseModel):
    """
    Req schema /api/v1/users/<user_id> {DELETE}

    Request:
        password: user's password
    """
    password: str


class PutMedicationReq(BaseModel):
    """
    Req schema /api/v1/medications {PUT}

    Request:
        medName: medication name
        medDetails: details string
        [brandId]: manufacturing brand ID
        [rxString]: prescription string
        [shape]: shape of medication
        [size]: size of medication
        [imprintFront]: imprint on front of medication
        [imprintBack]: imprint on back of medication
        [color]: color of medication
        [price]: medication price
    """
    medName: str
    medDetails: str
    brandId: Optional[int]
    rxString: Optional[str]
    shape: Optional[str]
    size: Optional[int]
    imprintFront: Optional[str]
    imprintBack: Optional[str]
    color: Optional[str]
    price: Optional[float]
    priceSource: Optional[str]


class CheckSavedMedicationReq(BaseModel):
    """
    Req schema /api/v1/users/<user_id>/medications/check-saved {POST}

    Request:
        medId: ID of medication to search for in user's saved medications
    """
    medId: int


class SearchMedicationsReq(BaseModel):
    """
    Req schema /api/v1/medications/search {POST}

    Request:
        query: query string
    """
    query: str


class ClassifyMedicationByImageReq(BaseModel):
    """
    Req schema /api/v1/medications/classify-by-image {POST}

    Request:
        img: binary image data
    """
    img: str


class ClassifyMedicationByDescriptionReq(BaseModel):
    """
    Req schema /api/v1/medications/classify-by-description {POST}

    Request:
        [shape]: shape of medication
        [size]: size of medication
        [imprintFront]: imprint on front of medication
        [imprintBack]: imprint on back of medication
        [color]: color of medication
        [color2]: secondary color of medication
    """
    shape: Optional[str]
    size: Optional[int]
    imprintFront: Optional[str]
    imprintBack: Optional[str]
    color: Optional[str]
    color2: Optional[str]
