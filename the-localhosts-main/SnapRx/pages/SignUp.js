import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    ImageBackground,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {signupAPI, validateUserSessionAPI} from '../api/apihelper';
import Modal from "react-native-modal";


export default function SignUp({navigation}) {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [modalContent, setModalContent] = useState('')

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

    // password and email regex
    let passRegex = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
    let emailRegex = new RegExp("^\\S+@\\S+\\.\\S+$")

    // modal toggle
    const toggleModalVisible = () => setIsModalVisible(!isModalVisible)

    const signupHandler = async () => {
        // incomplete form data
        if (firstName.trim().length === 0 || lastName.trim().length === 0 || email.trim().length === 0 || password.trim().length === 0) {
            setModalContent('Form data incomplete. Please complete all fields.')
            toggleModalVisible()
            return
        }

        // invalid email address
        if (!emailRegex.test(email)) {
            setModalContent('Invalid email address. Please provide a valid email.')
            toggleModalVisible()
            return
        }

        // check whether password has valid format
        let isValidPassword = passRegex.test(password)

        // check whether password matches confirm password input
        let passwordsMatch = password === confirmPassword

        // invalid password
        if (!isValidPassword) {
            setModalContent('Your password does not fulfill the password requirements. Passwords must contain 1 uppercase char, 1 lowercase char, 1 number, 1 special char, and 8+ chars.')
            toggleModalVisible()
            return
        }

        // passwords don't match
        if (!passwordsMatch) {
            setModalContent('Passwords do not match.')
            toggleModalVisible()
            return
        }

        // attempt sign up
        signupAPI(firstName, lastName, email, password)
            .then(async data => {
                await AsyncStorage.setItem('userToken', data.token)
                await AsyncStorage.setItem('userId', JSON.stringify(data.userId))
                await AsyncStorage.setItem('isGuest', JSON.stringify(false))
                navigation.navigate('Main', {showSignupPopup: true})
            })
            .catch(err => {
                if (err.response.status === 403) {
                    setModalContent('An account with that email already exists. Please use another email.')
                } else {
                    setModalContent('Failed to create account. Please try again.')
                }
                toggleModalVisible()
            })
    }

    return (
        <ImageBackground source={require('../assets/background.jpg')} resizeMode="cover" style={styles.image}>
            <ScrollView alwaysBounceVertical={true} style={{width:'100%', paddingTop: 30}} contentContainerStyle={{flexWrap:'nowrap', alignItems:'center'}}>
                <TextInput
                    style={styles.inputLabel}
                    autoCorrect={false}
                    placeholder={'First name'}
                    placeholderTextColor='#000000'
                    backgroundColor="#ffffff"
                    autoFocus
                    onChangeText={setFirstName}
                    testID="first name"
                />
                <TextInput
                    style={styles.inputLabel}
                    autoCorrect={false}
                    placeholder={'Last name'}
                    placeholderTextColor='#000000'
                    backgroundColor="#ffffff"
                    onChangeText={setLastName}
                    testID="last name"
                />
                <TextInput
                    style={styles.inputLabel}
                    autoCorrect={false}
                    placeholder={'Email'}
                    placeholderTextColor='#000000'
                    backgroundColor="#ffffff"
                    autoCapitalize='none'
                    keyboardType='email-address'
                    onChangeText={setEmail}
                    testID="email"
                />
                <View style={{marginBottom: 10, width:'90%'}}>
                    <Text style={{fontStyle:'italic', color:'#fff'}}>Password requirements: 1 uppercase char, 1 lowercase char, 1 number, 1 special char, 8+ chars</Text>
                </View>
                <TextInput
                    style={styles.inputLabel}
                    placeholder={'Password'}
                    placeholderTextColor='#000000'
                    backgroundColor="#ffffff"
                    onChangeText={setPassword}
                    secureTextEntry
                    testID="password"
                />
                <TextInput
                    style={styles.inputLabel}
                    placeholder={'Confirm password'}
                    placeholderTextColor='#000000'
                    backgroundColor="#ffffff"
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    testID="confirm password"
                />

                <View style={styles.buttonView}>
                    <TouchableOpacity style={styles.press} onPress={signupHandler} >
                        <Text style={styles.buttonText}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

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
            marginBottom: 20,
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
            marginBottom: 20
        },
      },
    }),
  })
