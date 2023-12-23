import axios from "axios"
import  AsyncStorage  from '@react-native-async-storage/async-storage'
import { Platform } from "react-native"
import React, { useState, useEffect } from 'react'

// local (dev) host paths
// const ios_api = `http://127.0.0.1:5000`;  // Use on IOS Local Testing
// const android_api = `http://10.0.2.2:5000`;  // Use on ANDROID Local Testing

// prod host paths
const ios_api = `http://ec2-54-161-200-70.compute-1.amazonaws.com:8080`
const android_api = `http://ec2-54-161-200-70.compute-1.amazonaws.com:8080`
const apiHost = Platform.OS == 'ios' ? ios_api : android_api

// API header for JSON Data
const getHeader = async () => {
    if (typeof window !== "undefined") {
      let token = await AsyncStorage.getItem("userToken")
      return {
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
      }
    }
}


// API header for Form Data
const getHeaderFormData = async () => {
  if (typeof window !== "undefined") {
    let token = await AsyncStorage.getItem("userToken")
    return {
        "Authorization": token,
        "Content-Type": "multipart/form-data"
    }
  }
}


// log API errors
const logError = (err) => {
    if (err) {
      console.log("[ERR] res", err.response.status, JSON.stringify(err.response))
    }
}


// Sign Up API
const signupAPI = async (firstName, lastName, email, password) => {
    const params = JSON.stringify({
      "firstName": firstName,
      "lastName": lastName,
      "email": email,
      "password": password
    })

    const url = `${apiHost}/api/v1/users/signup`
    const header = await getHeader()

    console.log("{POST}", url)
    console.log("Req body", params)
    console.log("Req headers", header)

    return new Promise((resolve, reject) => {
      axios
        .post(url, params, header)
        //  fetch(url,options)
        .then((res) => {
          resolve(res.data)
          console.log("Sign up res", res.data)
        })
        .catch((err) => {
          logError(err)
          reject(err)
        })
    })
}


// Login In API
const loginAPI = async (email, password) => {
  const params = JSON.stringify({
    "email": email,
    "password": password
  })

  const url = `${apiHost}/api/v1/users/login`
  const header = await getHeader()

  console.log("{POST}", url)
  console.log("Req body", params)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios
      .post(url, params, header)
      .then((res) => {
        resolve(res.data)
        console.log("Login res", res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Reset password API
const resetPasswordAPI = async (email) => {
  const params = JSON.stringify({
    "email": email
  })
  const url = `${apiHost}/api/v1/users/reset-password`
  const header = await getHeader()

  console.log('{POST}', url)
  console.log('Req body', params)
  console.log('Req headers', header)

  return new Promise((resolve, reject) => {
    axios
      .post(url, params, header)
      .then((res) => {
        resolve(res.data)
        console.log("Reset password res", res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Validate user session API
const validateUserSessionAPI = async () => {
  const userId = await AsyncStorage.getItem('userId')
  const url = `${apiHost}/api/v1/users/${userId}/validate-session`
  const header = await getHeader()

  console.log('{POST}', url)
  console.log('Req headers', header)

  return new Promise((resolve, reject) => {
    axios
      .post(url, JSON.stringify({}), header)
      .then((res) => {
        resolve(res.data)
        console.log('Validate session res', res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Update Password API
const updatePasswordAPI = async (oldPassword, newPassword) => {
  const params = JSON.stringify({
    "oldPassword": oldPassword,
    "newPassword": newPassword
  })

  const userID = await AsyncStorage.getItem("userId")
  const url = `${apiHost}/api/v1/users/${userID}/update-password`
  const header = await getHeader()

  console.log("{POST}", url)
  console.log("Req body", params)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios
      .post(url, params, header)
      .then((res) => {
        resolve(res.data)
        console.log("Update password res", res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Get User Details
const getUserDetailsAPI = async () => {
  let userID = await AsyncStorage.getItem("userId")
  const url = `${apiHost}/api/v1/users/${userID}`
  const header = await getHeader()

  console.log("{GET}", url)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios
      .get(url, header)
      .then((res) => {
        resolve(res.data)
        console.log("Get user details res", res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Update User Details
const putUserDetailsAPI = async(firstName, lastName, email) => {
  const params = JSON.stringify({
    "firstName": firstName,
    "lastName": lastName,
    "email": email,
  })

  let userID = await AsyncStorage.getItem("userId")
  const url = `${apiHost}/api/v1/users/${userID}`
  const header = await getHeader()

  console.log("{PUT}", url)
  console.log("Req body", params)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios
      .put(url, params, header)
      .then((res) => {
        resolve(res.data)
        console.log("Update user details res", res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Delete User Medication
const deleteUserAPI = async (password) => {
  const userID = await AsyncStorage.getItem("userId")
  const url = `${apiHost}/api/v1/users/${userID}`
  const header = await getHeader()
  let token = await AsyncStorage.getItem("userToken")

  console.log("{DELETE}", url)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios
      .delete(url, {
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
        data: {
          "password": password
        }
      })
      .then((res) => {
        resolve(res.data)
        console.log("Delete user res", res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Get All of User Medications API
const getUserMedsAPI = async () => {
  let userID = await AsyncStorage.getItem("userId")
  const url = `${apiHost}/api/v1/users/${userID}/medications`
  const header = await getHeader()

  console.log("{GET}", url)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios
      .get(url, header)
      .then((res) => {
        resolve(res.data)
        console.log("Get user medications res", res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Update User Medications
const putUserMedAPI = async (medId) => {
  let userID = await AsyncStorage.getItem("userId")
  const url = `${apiHost}/api/v1/users/${userID}/medications/${medId}`
  const header = await getHeader()

  console.log("{PUT}", url)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios
      .put(url, {}, header)
      .then((res) => {
        resolve(res.data)
        console.log("Add user medication res", res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Check user saved medication
const checkUserSavedMedAPI = async (medId) => {
  const params = JSON.stringify({
    "medId": medId
  })

  const userID = await AsyncStorage.getItem("userId")
  const url = `${apiHost}/api/v1/users/${userID}/medications/check-saved`
  const header = await getHeader()

  console.log("{POST}", url)
  console.log("Req body", params)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios
      .post(url, params, header)
      .then((res) => {
        resolve(res.data)
        console.log("Post check user saved medication res", res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Delete User Medication
const deleteUserMedAPI = async (medID) => {
  const userID = await AsyncStorage.getItem("userId")
  const url = `${apiHost}/api/v1/users/${userID}/medications/${medID}`
  const header = await getHeader()

  console.log("{DELETE}", url)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios
      .delete(url, header)
      .then((res) => {
        resolve(res.data)
        console.log("Delete user medication res", res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Get Medication Details via MedID
const getMedDetailsAPI = async (medId) => {
  const url = `${apiHost}/api/v1/medications/${medId}`
  const header = await getHeader()

  console.log("{GET}", url)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios
      .get(url, header)
      .then((res) => {
        resolve(res.data)
        console.log("Get medication details res", res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Search Medication via generic search query
const searchMedsAPI = async (query) => {
  const params = JSON.stringify({
    "query": query,
  })

  const url = `${apiHost}/api/v1/medications/search`
  const header = await getHeader()

  console.log("{POST}", url)
  console.log("Req body", params)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios
      .post(url, params, header)
      .then((res) => {
        resolve(res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Classify Medication by given description
const classifyMedByDescriptionAPI = async (shape, size, imprintFront, imprintBack, color, color2) => {
  let paramsObj = {}
  if (shape) {
    paramsObj['shape'] = shape
  }
  if (size) {
    paramsObj['size'] = size
  }
  if (imprintFront) {
    paramsObj['imprintFront'] = imprintFront
  }
  if (imprintBack) {
    paramsObj['imprintBack'] = imprintBack
  }
  if (color) {
    paramsObj['color'] = color
  }
  if (color2) {
    paramsObj['color2'] = color2
  }
  const params = JSON.stringify(paramsObj)

  const url = `${apiHost}/api/v1/medications/classify-by-description`
  const header = await getHeader()

  console.log("{POST}", url)
  console.log("Req body", params)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios
      .post(url, params, header)
      .then((res) => {
        resolve(res.data)
        console.log("Classify medication by description res", res.data)
      })
      .catch((err) => {
        logError(err)
        reject(err)
      })
  })
}


// Classify medication by uploaded image
const classifyMedByImageAPI = async (imageURI) => {
  let formData = new FormData();
  formData.append('img', {uri: imageURI, name: 'photo.png', filename :'imageName.png', type: 'image/png'});

  const url = `${apiHost}/api/v1/medications/classify-by-image`
  const header = await getHeaderFormData()

  console.log("{POST}", url)
  console.log("Req img URI", imageURI)
  console.log("Req headers", header)

  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: url,
      data: formData,
      headers: header
    })
      .then(res => {
        resolve(res.data)
        console.log('Classify medication by image res', res.data)
      })
      .catch(err => {
        logError(err)
        reject(err)
      })
  })
}


// Get sample image corresponding to medication class (image classifier results only)
const getMedicationImageAPI = async (medName) => {
  const url = `${apiHost}/api/v1/medications/img/${medName}`

  console.log("{GET}", url)

  return new Promise((resolve, reject) => {
    axios({
      method: "get",
      url: url,
      responseType: 'blob'
    })
    .then((res) => {
      const href = URL.createObjectURL(res.data)
      resolve(href)
    })
    .catch((err) => {
      logError(err)
      reject(err)
    })
  })
}


export {
  signupAPI,
  loginAPI,
  resetPasswordAPI,
  validateUserSessionAPI,
  updatePasswordAPI,
  getUserMedsAPI,
  getUserDetailsAPI,
  deleteUserAPI,
  deleteUserMedAPI,
  checkUserSavedMedAPI,
  putUserDetailsAPI,
  putUserMedAPI,
  getMedDetailsAPI,
  searchMedsAPI,
  classifyMedByDescriptionAPI,
  classifyMedByImageAPI,
  getMedicationImageAPI
}
