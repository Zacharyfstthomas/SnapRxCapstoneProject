import React, { useState, useEffect } from 'react';
import { ScrollView, ImageBackground, Pressable, View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { putUserDetailsAPI, deleteUserAPI } from '../api/apihelper';
import {Appbar} from "react-native-paper";
import Modal from "react-native-modal";

export default function Profile({navigation}) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [getLoad, setLoad] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [modalContent, setModalContent] = useState('')
    const [isDeleteUserModalVisible, setIsDeleteUserModalVisible] = useState(false)
    const [verifyPassword, setVerifyPassword] = useState('')

    // email regex
    let emailRegex = new RegExp("^\\S+@\\S+\\.\\S+$")

    // modal toggles
    const toggleModalVisible = () => setIsModalVisible(!isModalVisible)
    const toggleDeleteUserModalVisible = () => setIsDeleteUserModalVisible(!isDeleteUserModalVisible)

    // get user details from async storage
    const getUserDetails = async() => {
        if (!getLoad) {
            const userFN = await AsyncStorage.getItem("userFirstName")
            setFirstName(userFN)
            const userLN = await AsyncStorage.getItem("userLastName")
            setLastName(userLN)
            const userEmail = await AsyncStorage.getItem("userEmail")
            setEmail(userEmail)
            const userID1 = await AsyncStorage.getItem("userId")
            await AsyncStorage.setItem("userId", userID1);
        }
    }

    useEffect( () => {
        getUserDetails()
    }, [])

    const updateUserDetailsHandler = async (firstName, lastName, email) => {
        // form incomplete
        if (firstName.trim().length === 0 || lastName.trim().length === 0 || email.trim().length === 0) {
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

        // attempt to update user details
        putUserDetailsAPI(firstName, lastName, email)
            .then(async _ => {
                // update user details in async storage
                await AsyncStorage.setItem("userFirstName", firstName)
                await AsyncStorage.setItem("userLastName", lastName)
                await AsyncStorage.setItem("userEmail", email)
                setModalContent('Your account details have been updated.')
                toggleModalVisible()
            })
            .catch(err => {
                if (err.response.status === 403) {
                    setModalContent('An account with that email already exists. Please use another email.')
                } else {
                    setModalContent('Failed to update account details. Please try again.')
                }
                toggleModalVisible()
            })
    }

    const signOutHandler = async () => {
        await AsyncStorage.clear()
        navigation.navigate('Launch')
    }

    const deleteAccountHandler = async () => {
        deleteUserAPI(verifyPassword)
            .then(async _ => {
                await AsyncStorage.clear()
                navigation.navigate('Launch')
            })
            .catch(_ => {
                setModalContent('Failed to delete account. Please verify that your password is correct.')
                toggleModalVisible()
            })
    }

    return (
        <View style={{flex:1, backgroundColor:"#eee", justifyContent:"center"}}>
            <ScrollView alwaysBounceVertical={true} contentContainerStyle={{flexWrap:'nowrap', padding: 10}}>
                <Text style={{fontSize: 24, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#2a2a2a', marginBottom: 10}}>User details</Text>

                <Text style={{color:"#000", fontSize:18, fontStyle:'italic' }}>First name: {firstName}</Text>
                <TextInput style={styles.inputLabel} backgroundColor='#ffffff' placeholder={"First name..."} placeholderTextColor='#333' onChangeText={text => setFirstName(text) & setLoad(true)}/>

                <Text style={{color:"#000", fontSize:18, fontStyle:'italic', paddingTop:20 }}>Last name: {lastName}</Text>
                <TextInput style={styles.inputLabel} backgroundColor='#ffffff' placeholder={"Last name..."} placeholderTextColor='#333' onChangeText={text => setLastName(text) & setLoad(true)}/>

                <Text style={{color:"#000", fontSize:18, fontStyle:'italic', paddingTop:20 }}>Email: {email}</Text>
                <TextInput style={styles.inputLabel} backgroundColor='#ffffff' placeholder={"Email address..."} placeholderTextColor='#333' keyboardType='email-address' autoCapitalize='none' onChangeText={text => setEmail(text) & setLoad(true)}/>

                <TouchableOpacity style={styles.press} onPress={() => {updateUserDetailsHandler(firstName, lastName, email)}}>
                    <Text style={styles.buttonText}>
                        Update user data
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.press} onPress={() => navigation.navigate("UpdatePassword")}>
                    <Text style={styles.buttonText}>
                        Change password
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pressRed} onPress={signOutHandler}>
                    <Text style={styles.buttonText}>
                        Sign out
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pressRed} onPress={toggleDeleteUserModalVisible}>
                    <Text style={styles.buttonText}>
                        Delete account
                    </Text>
                </TouchableOpacity>
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

             <Modal isVisible={isDeleteUserModalVisible}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 5}}>
                        <Text style={{marginBottom: 20}}>Please verify your password to delete your account:</Text>
                        <TextInput style={styles.inputLabelPassword} backgroundColor='#ffffff' placeholder={"Verify password"} placeholderTextColor='#000000' secureTextEntry onChangeText={setVerifyPassword}/>
                        <TouchableOpacity style={{backgroundColor: '#ad101d', borderRadius: 10, padding: 10, marginBottom: 15, width: 200}} onPress={deleteAccountHandler}>
                            <Text style={{color: '#fff', textAlign: 'center'}}>Delete account</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{backgroundColor: '#2979ff', borderRadius: 10, padding: 10, width: 200}} onPress={toggleDeleteUserModalVisible}>
                            <Text style={{color: '#fff', textAlign: 'center'}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}


const styles = StyleSheet.create({
    image: {
      flex: 1,
      justifyContent: "center",
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,

      
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
            fontSize: 55,
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
  
      },
  
      android: {
        inputLabel: {
            borderColor: '#2979ff',
            height: 40,
            alignItems:'center',
            alignContent:'center',
            marginTop: 5,
            borderRadius: 10,
            borderWidth: 2,
            textAlign: 'center',
            fontSize: 18
        },
          inputLabelPassword: {
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
            height: 40,
            width: 285,
            borderColor: '#000000',
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            alignSelf: 'center',
            borderRadius: 5,
            marginTop: 25
        },
        pressRed: {
            backgroundColor: '#ad101d',
            height: 40,
            width: 285,
            borderColor: '#000000',
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            alignSelf: 'center',
            borderRadius: 5,
            marginTop: 25
        },
        buttonText: {
            fontSize: 20,
            color: '#ffffff',
            textAlign: 'center',
        },
        appBar: {
            backgroundColor: '#2A2A2A',
        },
        errorPopUp: {
            alignItems: 'center',
            bottom: '1%',
            position: 'absolute', left: 0, right: 0,
        },
  
      },
    }),
  });


