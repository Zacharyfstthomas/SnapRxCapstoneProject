import React, { useState, useEffect } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  BackHandler,
  ScrollView, TextInput
} from 'react-native';
import { ZStack, Box } from 'native-base';
import {getUserDetailsAPI, getUserMedsAPI} from '../api/apihelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from "@react-navigation/native";
import { useRoute } from '@react-navigation/native';
import NotificationPopup from 'react-native-push-notification-popup';

export default function Dashboard({navigation}) {
  const [showSignupPopup, setShowSignupPopup] = useState(false)
  const route = useRoute()
  const isFocused = useIsFocused()
  const [userMedData, setUserMedData] = useState([])

  const getUserDetails = async() => {
    getUserMedsAPI()
        .then(data => {
          setUserMedData(data['medications'])
          getUserDetailsAPI()
            .then(async data => {
              await AsyncStorage.setItem("userFirstName", data.firstName)
              await AsyncStorage.setItem("userLastName", data.lastName)
              await AsyncStorage.setItem("userEmail", data.email)
            })
            .catch(err => {
              console.log('Error fetching user details', err)
            })
        })
        .catch(err => {
          console.log('An error occurred while fetching user saved medications', err)
        })
  }

  useEffect(() => {
      getUserDetails()
  },[isFocused])

  const onSelectSavedMed = async (medId, medName) => {
    await AsyncStorage.setItem('selectedMed', medName)
    await AsyncStorage.setItem('selectedMedId', medId.toString())
    navigation.navigate('MedInfo')
  }

  useEffect(() => {
    if (route.params && route.params.showSignupPopup) {
      setShowSignupPopup(true)
    }
  }, [route])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
    return () => backHandler.remove()
  }, [])

  useEffect(() => {
    if (showSignupPopup) {
      this.popup.show({
        onPress: function() {
          console.log('Pressed')
        },
        appTitle: 'SnapRx',
        timeText: 'Now',
        title: 'Sign up successful',
        body: 'Welcome to SnapRx! Your account has been registered.',
        slideOutTime: 4000,
      })
      setShowSignupPopup(false)
    }
  },[showSignupPopup])

  return (
      <View style={{flex:1, backgroundColor:"#eee"}}>
          <NotificationPopup
              onHide={() => setShowSignupPopup(false)}
              isVisible={showSignupPopup}
              ref={(ref) => this.popup = ref} autoHide={true}
          />

          <ScrollView alwaysBounceVertical={true} contentContainerStyle={{flexWrap:'nowrap', padding: 10}}>
              {userMedData.length === 0 &&
              <Text style={{fontSize: 20, fontStyle: 'italic', textAlign:'center', marginTop:"10%"}}>
                You don't currently have any saved medications.
              </Text>
              }
              {userMedData.map((value, index) => {
                  return (
                      <TouchableOpacity style={{borderBottomColor: '#2a2a2a', borderBottomWidth: 1}} key={index} onPress={() => onSelectSavedMed(value['medId'], value['medName'])} >
                        <View style={{alignSelf:'flex-start', position: 'relative'}}>
                            <Image source = {require('../icons/pillbottle3.png')} resizeMode="contain" style={{marginTop:10, width:25, height:25, position: 'absolute', left:5}}/>
                        </View>

                        {value.medName.length > 32 ?
                              <View>
                                  <Text style={styles.buttonText3}>
                                      {value['medName'].substring(0, 29)}...
                                  </Text>
                                  <Text style={{color: '#333', fontStyle: 'italic', fontSize: 14, marginLeft: 35, paddingBottom: 5}}>
                                      {value['rxString']}
                                  </Text>
                              </View>

                          :
                              <View>
                                  <Text style={styles.buttonText3}>
                                      {value['medName']}
                                  </Text>
                                  <Text style={{color: '#333', fontStyle: 'italic', fontSize: 14, marginLeft: 35, paddingBottom: 5}}>
                                      {value['rxString']}
                                  </Text>
                              </View>
                          }
                      </TouchableOpacity>
                  )
                  })}
          </ScrollView>
       </View>
    )
}


const styles = StyleSheet.create({
  ...Platform.select({
    ios: {
      gridContainer: {
        flex:1,
        paddingTop:'0%',
        flexDirection: "row",
        marginTop:'10%',
        justifyContent:'center'

      },
      press: {
        backgroundColor: 'rgba(41,121,255,1.0)',
        width:"40%",
        height:"50%",
        borderRadius:10,
        //backgroundColor:"#DEF1FC",
      },
      press3: {
        backgroundColor: 'rgba(41,121,255,1.0)',
        width:"40%",
        height:"50%",
        borderRadius:10,
        //backgroundColor:"#DEFCE5",
      },
      press2: {
        backgroundColor:'rgba(41,121,255,1.0)',
        width:380,
        height:100,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        //borderRadius:10,
        //backgroundColor:"#FCDEDE",

      },
      titleView: {
        marginTop: 70,
        marginRight: 0,
        marginLeft: 0,
        alignItems:"center"
      },
      titleText: {
        fontSize:24,
        color:"#ffffff",
        fontFamily: 'Avenir-Medium',
      },
      buttonText: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'center',
        alignSelf:'flex-start',
        marginTop:"8%",
        padding:15
      },
      buttonText5: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'center',
        alignSelf:'flex-start',
        padding:15
      },
      buttonText3: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
        alignSelf:'center',
        marginTop:"8%",
        paddingTop:15,
        paddingHorizontal:15
      },
      buttonText4: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'center',
        alignSelf:'center',
      },
      buttonText2: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'center',
        alignSelf:'flex-start',
        marginTop:"20%",
        position:"absolute",
        padding:15
      },


    },

    android: {
      gridContainer: {
        flex:3,
        paddingTop:'0%',
        flexDirection: "column",
        justifyContent:'space-evenly'
      },
      press: {
        backgroundColor: 'rgba(41,121,255,1.0)',
        width:"40%",
        flex: 1,
        borderRadius:10,
        //backgroundColor:"#DEF1FC",
      },
      press3: {
        backgroundColor: 'rgba(41,121,255,1.0)',
        width:"40%",
        height:"50%",
        borderRadius:10,
        //backgroundColor:"#DEFCE5",
      },
      // press2: {
      //   width:140,
      //   height:100,
      //   alignItems: 'center',
      //   justifyContent: 'center',
      //   borderRadius: 5,
      //   borderRadius:10,
      //   backgroundColor:"#FCDEDE",
      // },
      // press4: {
      //   width:"40%",
      //   height:100,
      //   alignItems: 'center',
      //   justifyContent: 'center',
      //   borderRadius: 5,
      //   borderRadius:10,
      //   backgroundColor:"#FCDEDE",
      //   marginLeft:50
      // },
      titleView: {
        marginTop: "15%",
        marginRight: 0,
        marginLeft: 0,
        alignItems:"center"
      },
      titleText: {
        fontSize:24,
        color:"#ffffff",
        fontFamily: 'Roboto',
      },
      buttonText: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'center',
        marginTop:"8%",
        padding:15
      },
      buttonText5: {
        fontSize: 15,
        color: '#000000',
        textAlign: 'center',
        alignSelf:'flex-start',
        padding:15
      },
      buttonText3: {
        fontSize: 20,
        color: '#000000',
        paddingTop: 5,
        marginLeft: 35
      },
      buttonText4: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'center',
        alignSelf:'center',
      },
      buttonText2: {
        fontSize: 20,
        fontStyle: 'italic',
        color: '#000000',
        textAlign: 'center',
        padding:10
      },
      listButton: {
        backgroundColor: '#7A0000',
        height: 70,
        width: 285,
        borderColor: '#000000',
        borderWidth: 1,
        alignItems: 'center',
        borderRadius: 5,
        marginBottom: 25,
      },
    }
  }),
});