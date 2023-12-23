import React, {useEffect} from "react";
import { ImageBackground, Platform, StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { validateUserSessionAPI } from '../api/apihelper';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Launch({navigation}) {
    const image = require("../logos/logo3.jpg");

    const continueAsGuestHandler = async () => {
        await AsyncStorage.setItem('isGuest', JSON.stringify(true))
        navigation.navigate('ScanMedGuest')
    }

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

    return (
        <View style={{flex: 1, alignItems: 'center'}}>
            <ImageBackground source={image} resizeMode="cover" style={{height: '100%', width: '100%'}}>
                <View style={styles.header}>
                    <Text style={styles.titleText}>SnapRX</Text>
                </View>

                <View style={styles.gridContainer}>
                    <TouchableOpacity style={styles.press} hitSlop={{top: 20, bottom: 15, left: 15, right: 15}} onPress={() => navigation.navigate("Login")}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.press} hitSlop={{top: 20, bottom: 15, left: 15, right: 15}} onPress={() => navigation.navigate("SignUp")}>
                        <Text style={styles.buttonText}>Sign up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.press} hitSlop={{top: 10, bottom: 5, left: 15, right: 15}} onPress={continueAsGuestHandler}>
                        <Text style={styles.buttonText}>Scan med as guest</Text>
                    </TouchableOpacity>
                </View>
        </ImageBackground>
    </View>
  )
}


const styles = StyleSheet.create({
  ...Platform.select({
    ios: {
      container: {
        flex: 1,
      },
      header: {
        flex:1, 
        marginTop:"10%"
      },
      gridContainer: {
        flex:1,
        paddingTop:'10%',
        flexDirection: "row",
        marginTop:'90%',
        justifyContent:'center'
  
      },
      buttonText: {
          fontSize: 20,
          color: '#ffffff',
          textAlign: 'center',
          fontFamily: 'Avenir-Medium',
      },
      press: {
          backgroundColor: 'rgba(41,121,255,1.0)',
          bottom: '5%',
          height: 110,
          width: 150,
          borderColor: '#ffffff',
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 5,          

      },
      press2: {
        backgroundColor:'rgba(41,121,255,1.0)',
        top: '0%',
        height: 80,
        width: 343,
        borderColor: '#ffffff',
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        marginTop:0,
    },
      button: {
          position: 'absolute',
          backgroundColor: '#ffffff',
          bottom: 20,
          height: 40,
          borderWidth: 5, 
          borderColor: '#ffffff'
      },
      
      titleText: {
          fontSize: 60,
          color: '#2979ff',
          fontFamily: 'Georgia-Bold',
          textAlign: 'center',
          textShadowColor: 'cyan',
          textShadowOffset: {width: -1, height: 1},
          textShadowRadius: 10
      },

    },


    android: {
      container: {
        flex: 1,
      },
      header: {
        marginTop: 40
      },
      gridContainer: {
        flex:1,
        alignItems: 'center',
        justifyContent:'center'
      },
      buttonText: {
          fontSize: 20,
          color: '#ffffff',
          textAlign: 'center',
          fontFamily: 'normal',
      },
      press: {
          backgroundColor: 'rgba(41,121,255,1.0)',
          height: 80,
          width: '90%',
          borderColor: '#ffffff',
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 5,
          marginBottom: 20
        },
        press2: {
          backgroundColor:'rgba(41,121,255,1.0)',
          top: '0%',
          height: 80,
          width: 343,
          borderColor: '#ffffff',
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 5,
          marginTop:0,
        },
        button: {
            position: 'absolute',
            backgroundColor: '#ffffff',
            bottom: 20,
            height: 40,
            borderWidth: 5, 
            borderColor: '#ffffff'
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
    },
  }),
});
