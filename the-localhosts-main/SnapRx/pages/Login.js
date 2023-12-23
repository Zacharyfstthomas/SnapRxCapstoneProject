import React, { useState, useEffect } from 'react';
import { StyleSheet,TouchableOpacity, ScrollView, Alert, View, TextInput, Button, Text, ImageBackground, useWindowDimensions, KeyboardAvoidingView, Pressable } from 'react-native';
import Modal from 'react-native-modal'
import { SafeAreaView } from 'react-native-safe-area-context';
import useAsyncStorage from "../hooks/useAsyncStorage";
import {loginAPI, resetPasswordAPI, validateUserSessionAPI} from '../api/apihelper';
import { AspectRatio } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NotificationPopup from 'react-native-push-notification-popup';
const esc = encodeURIComponent


export default function Login({navigation}) {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [isResetPasswordModalVisible, setIsResetPasswordModalVisible] = useState(false)
    const [modalContent, setModalContent] = useState('')
    const [resetPasswordEmail, setResetPasswordEmail] = useState('')

    let emailRegex = new RegExp("^\\S+@\\S+\\.\\S+$")

    const checkUserSession = async () => {
        validateUserSessionAPI()
            .then(async _ => {
                await AsyncStorage.setItem('isGuest', JSON.stringify(false))
                navigation.navigate('Main')
            })
            .catch(_ => {
                // invalid session, do nothing
            })
    }

    useEffect(() => {
        checkUserSession()
    }, [])

    const toggleModalVisible = () => setIsModalVisible(!isModalVisible)
    const toggleResetPasswordModalVisible = () => setIsResetPasswordModalVisible(!isResetPasswordModalVisible)

    const loginHandler = async () => {
	    if (email.trim().length === 0 || password.trim().length === 0) {
	        setModalContent('Form data incomplete. Please provide an email and password.')
            toggleModalVisible()
            return
        }

        loginAPI(email, password)
            .then(async data => {
                await AsyncStorage.setItem('userToken', data.token)
                await AsyncStorage.setItem('userId', JSON.stringify(data.userId))
                await AsyncStorage.setItem('isGuest', JSON.stringify(false))
                navigation.navigate("Main")
            })
            .catch(_ => {
                setModalContent('Invalid email or password. Please try again.')
                toggleModalVisible()
            })
	}

	const resetPasswordHandler = async () => {
	    // check that email field is not blank
	    if (resetPasswordEmail.trim().length === 0) {
	        setModalContent('Please enter an email address for account recovery.')
            toggleModalVisible()
            return
        }

	    // check that valid email was provided
        if (!emailRegex.test(resetPasswordEmail)) {
            setModalContent('Invalid email address. Please provide a valid email.')
            toggleModalVisible()
            return
        }

        // attempt to send reset password email
	    resetPasswordAPI(resetPasswordEmail)
            .then(_ => {
                toggleResetPasswordModalVisible()
                setModalContent('Temporary login details have been sent to your email.')
                toggleModalVisible()
            })
            .catch(err => {
                if (err.response.status === 404) {
                    setModalContent('Could not find an account matching the given email address.')
                } else {
                    setModalContent('An error occurred while resetting your password. Please try again.')
                }
                toggleModalVisible()
            })
    }

	return (
        <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.image}>
            <View style={{flex: 1, alignItems: 'center', paddingTop: 30}}>
                <TextInput
                    style={styles.inputLabel}
                    autoCorrect={false}
                    placeholder={'Email'}
                    placeholderTextColor='#000000'
                    backgroundColor="#ffffff"
                    autoCapitalize="none"
                    autoFocus
                    keyboardType='email-address'
                    onChangeText={setEmail}
                    testID="email"
                />
                <TextInput
                    style={styles.inputLabel}
                    placeholder={'Password'}
                    placeholderTextColor='#000000'
                    backgroundColor="#ffffff"
                    onChangeText={setPassword}
                    secureTextEntry
                    testID="password"
                />
                <View style={{width: '90%', alignItems: 'center', marginBottom: 30}}>
                    <TouchableOpacity onPress={toggleResetPasswordModalVisible}>
                        <Text style={{color: '#fff'}}>Forgot your password? Click here to reset.</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonView}>
                    <TouchableOpacity style={styles.press} onPress={loginHandler} >
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                </View>

                <Modal isVisible={isModalVisible}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <View style={{backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 5}}>
                            <Text style={{marginBottom: 20}}>{modalContent}</Text>
                            <TouchableOpacity style={{backgroundColor: '#2979ff', borderRadius: 10, padding: 10}} onPress={toggleModalVisible}>
                                <Text style={{color: '#fff'}}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal isVisible={isResetPasswordModalVisible}>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                        <View style={{backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 5}}>
                            <Text style={{marginBottom: 20}}>An email will be sent to you with a temporary password for your account. Please enter your email to proceed:</Text>
                            <TextInput style={styles.inputResetPasswordEmail} backgroundColor='#ffffff' placeholder={"Email"} placeholderTextColor='#000000' keyboardType='email-address' autoCapitalize="none" onChangeText={setResetPasswordEmail}/>
                            <TouchableOpacity style={{backgroundColor: '#ad101d', borderRadius: 10, padding: 10, marginBottom: 15, width: 200}} onPress={resetPasswordHandler}>
                                <Text style={{color: '#fff', textAlign: 'center'}}>Reset password</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{backgroundColor: '#2979ff', borderRadius: 10, padding: 10, width: 200}} onPress={toggleResetPasswordModalVisible}>
                                <Text style={{color: '#fff', textAlign: 'center'}}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </ImageBackground>
	)
}


const styles = StyleSheet.create({
    image: {
      flex: 1,
      justifyContent: "center",
    },
    ...Platform.select({
      ios: {
        inputLabel: {
            borderColor: '#2979ff',
            height: 60,
            padding: 20,
            marginTop: 30,
            borderRadius: 10,
            borderWidth: 2,
            textAlign: 'center',
            fontSize: 20,
        },
        titleText: {
            fontSize: 60,
            color: '#2979ff',
            fontFamily: 'Avenir-Medium',
            textAlign: 'center',
      
        },
        VGrid: {
            flexDirection: 'column',
            flex: 1,
            padding: 30,
            paddingTop:10,
        },
        infoText: {
            paddingTop: 30,
            textAlign: 'center',
            padding: 15,
            fontSize: 18,
        },
        press: {
            backgroundColor: '#2979ff',
            bottom: 80,
            height: 40,
            width: 285,
            borderColor: '#000000',
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 5,
    
        },
        buttonText: {
            fontSize: 20,
            color: '#ffffff',
            textAlign: 'center',
        },
        appBar: {
            backgroundColor: '#73000a',
        },
        errorPopUp: {
            alignItems: 'center',
            bottom: '10%',
            position: 'absolute', left: 0, right: 0,
        },
        root: {
            padding: 20,
            width: "100%",
            height: "100%",
        },
        input: {
            marginBottom: 25
        },
        title: {
            fontSize: 55,
            marginBottom: 25,
            textAlign: "center",
            color:"#2979ff"
        },
        buttonView:{
            alignItems: 'center',
        },
  
      },
  
      android: {
        inputLabel: {
            borderColor: '#2979ff',
            padding: 20,
            marginBottom: 30,
            borderRadius: 10,
            borderWidth: 2,
            textAlign: 'center',
            fontSize: 20,
            width: '90%'
        },
        titleText: {
            fontSize: 60,
            color: '#2979ff',
            fontFamily: 'normal',
            textAlign: 'center',
            textShadowColor: 'cyan',
            textShadowOffset: {width: -1, height: 1},
            textShadowRadius: 10
        },
        VGrid: {
            flexDirection: 'column',
            flex: 1,
            padding: 30,
            paddingTop:10,
            paddingBottom:80
        },
        infoText: {
            paddingTop: 30,
            textAlign: 'center',
            padding: 15,
            fontSize: 18,
        },
        press: {
            backgroundColor: '#2979ff',
            height: 60,
            width: '100%',
            borderColor: '#000000',
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 5,
        },
        buttonText: {
            fontSize: 24,
            color: '#ffffff',
            textAlign: 'center',
        },
        appBar: {
            backgroundColor: '#73000a',
        },
        errorPopUp: {
            alignItems: 'center',
            bottom: '1%',
            position: 'absolute', left: 0, right: 0,
        },
        root: {
            padding: 20,
            width: "100%",
            height: "100%",
        },
        input: {
            marginBottom: 25
        },
        title: {
            fontSize: 60,
            color: '#2979ff',
            fontFamily: 'Roboto',
            textAlign: 'center',
        },
        link: {
            fontSize: 14,
            textAlign: "center",
            marginBottom: 25,
            color: "rgba(0, 0, 255, 0.5)"
        },
        buttonView:{
            alignItems: 'center',
            width: '90%'
        },
        header: {
            marginTop:"10%",
            marginBottom: 30
        },
        inputResetPasswordEmail: {
            borderColor: '#2979ff',
            height: 60,
            alignItems:'center',
            alignContent:'center',
            marginTop: 5,
            borderRadius: 10,
            borderWidth: 2,
            textAlign: 'center',
            fontSize: 18,
            marginBottom: 30,
            paddingLeft: 20,
            paddingRight: 20,
            width: 200
        },
      },
    }),
  })
