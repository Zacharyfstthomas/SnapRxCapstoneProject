import React, { useState, useEffect } from 'react';
import { ScrollView, ImageBackground, Pressable, View, Text, StyleSheet, SafeAreaView, TextInput, Button, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePasswordAPI } from '../api/apihelper';
import {Appbar} from "react-native-paper";
import { Platform } from 'react-native';

export default function UpdatePassword({navigation}) {
    // form data
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')

    // modals
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [modalContent, setModalContent] = useState('')
    const [isPasswordUpdatedModalVisible, setIsPasswordUpdatedModalVisible] = useState(false)

    // password regex
    let passRegex = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")

    // modal toggles
    const toggleModalVisible = () => setIsModalVisible(!isModalVisible)
    const togglePasswordUpdatedModalVisible = () => setIsPasswordUpdatedModalVisible(!isPasswordUpdatedModalVisible)

    const updatePasswordHandler = async () => {
        // check whether new password has valid format
        let isValidPassword = passRegex.test(newPassword)

        // check whether new password matches confirm new password input
        let passwordsMatch = newPassword === confirmNewPassword

        if (isValidPassword && passwordsMatch) {
            updatePasswordAPI(oldPassword, newPassword)
                .then(_ => {
                    togglePasswordUpdatedModalVisible()
                })
                .catch(_ => {
                    setModalContent('Failed to update password. Ensure that your old password is correct.')
                    toggleModalVisible()
                })
        } else if (!isValidPassword) {
            setModalContent('Your new password does not fulfill the password requirements. Passwords must contain 1 uppercase char, 1 lowercase char, 1 number, 1 special char, and 8+ chars.')
            toggleModalVisible()
        } else {
            setModalContent('Passwords do not match.')
            toggleModalVisible()
        }
    }

    const passwordUpdatedHandler = () => {
        navigation.navigate('Profile')
    }

    return (
        <View style={{flex:1, backgroundColor:"#eee", justifyContent:"center"}}>
            <ScrollView alwaysBounceVertical={true} contentContainerStyle={{flexWrap:'nowrap', padding: 10, marginTop: 30, alignItems: 'center'}}>
                <TextInput style={styles.inputLabel} backgroundColor='#ffffff' placeholder={"Old password"} placeholderTextColor='#000000' secureTextEntry onChangeText={setOldPassword} />
                <TextInput style={styles.inputLabel} backgroundColor='#ffffff' placeholder={"New password"} placeholderTextColor='#000000' secureTextEntry onChangeText={setNewPassword} />
                <TextInput style={styles.inputLabel} backgroundColor='#ffffff' placeholder={"Confirm new password"} placeholderTextColor='#000000' secureTextEntry onChangeText={setConfirmNewPassword} />

                <View style={{marginBottom: 30, width:'90%'}}>
                    <Text style={{fontStyle:'italic', color:'#555'}}>Password requirements: 1 uppercase char, 1 lowercase char, 1 number, 1 special char, 8+ chars</Text>
                </View>

                <View style={{alignItems: 'center', marginTop: 25}}>
                    <TouchableOpacity style={styles.press} onPress={updatePasswordHandler}>
                        <Text style={styles.buttonText}>
                            Update password
                        </Text>
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

            <Modal isVisible={isPasswordUpdatedModalVisible}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <View style={{backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 5}}>
                        <Text style={{marginBottom: 20}}>Your password has been updated.</Text>
                        <TouchableOpacity style={{backgroundColor: '#2979ff', borderRadius: 10, padding: 10}} onPress={passwordUpdatedHandler}>
                            <Text style={{color: '#fff'}}>Close</Text>
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
            marginBottom: 30,
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
            fontFamily: 'Roboto',
            textAlign: 'center',
      
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
            borderRadius: 5,
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
