import React, { useState, useEffect } from 'react';
import {Button, Image, View, Text, TouchableOpacity, ScrollView, Pressable, StyleSheet} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { classifyMedByImageAPI } from '../api/apihelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appbar } from "react-native-paper";
import Modal from "react-native-modal";
import { Platform } from 'react-native';

export default function Camera2({navigation}) {
    const [image, setImage] = useState(null)
    const [selectedMedConfirmed, setSelectedMedConfirmed] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    const [predMedClass, setPredMedClass] = useState('')
    const [predConfidence, setPredConfidence] = useState(0.0)
    const [scanResults, setScanResults] = useState([])

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [modalContent, setModalContent] = useState('')

    const toggleModalVisible = () => setIsModalVisible(!isModalVisible)

    const selectImageHandler = async () => {
        // reset flags
        setSelectedMedConfirmed(false)
        setIsProcessing(false)

        // user selects image from image library
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        })

        if (!result.canceled) {
            // check for valid file format
            let ext = result.assets[0].uri.split('.').at(-1).toLowerCase()
            if (ext !== 'jpeg' && ext !== 'jpg' && ext !== 'png') {
                setModalContent('Invalid file type selected. Accepted file types: ".jpeg", ".jpg", ".png".')
                toggleModalVisible()
                return
            }

            // extract selected image URI
            setImage(result.assets[0].uri)
            setIsProcessing(true)

            // classify image
            classifyMedByImageAPI(result.assets[0].uri)
                .then(async data => {
                    setPredMedClass(data['predMedClass'])
                    setPredConfidence(data['predConfidence'])
                    setScanResults(data['results'])
                    setIsProcessing(false)
                    setSelectedMedConfirmed(true)
                })
                .catch(err => {
                    console.log('An error occurred while classifying image', err)
                    setIsProcessing(false)
                    setModalContent('An error occurred while classifying your medication image. Please try again.')
                    toggleModalVisible()
                })
        }
    }

    const onSubmit = async (medId, medName) => {
        await AsyncStorage.setItem('selectedMed', medName)
        await AsyncStorage.setItem('selectedMedId', medId.toString())
        navigation.navigate('MedInfo')
    }

  return (
    <View style={{ flex: 1, backgroundColor:"#eee" }}>
      <ScrollView alwaysBounceVertical={true} contentContainerStyle={{alignItems: 'center', justifyContent: 'center', marginTop:20}}>
        <View style={{width: '90%'}}>
          <Button color="#2979ff" title="Select image from camera roll" onPress={selectImageHandler} testID="selectImageBtn"/>
        </View>

        {image &&
            <View style={{marginTop: 50}}>
                <Image source={{ uri: image }} style={{width: 200, height: 200, borderWidth:2, borderColor:"#ffffff" }} />
            </View>
        }

        {selectedMedConfirmed &&
            <View style={{marginTop: 50, width: '90%'}}>
                <Text style={{fontSize: 20, borderBottomWidth: 1, borderBottomColor: '#2a2a2a', marginBottom: 10, color: '#333'}}>Predicted medication class</Text>
                <Text style={{fontSize: 16, marginBottom: 20, color: '#333'}}>{predMedClass}</Text>

                <Text style={{fontSize: 20, borderBottomWidth: 1, borderBottomColor: '#2a2a2a', marginBottom: 10, color: '#333'}}>Prediction confidence</Text>
                <Text style={{fontSize: 16, marginBottom: 10, color: '#333'}}>{predConfidence*100}%</Text>
                <Text style={{fontSize: 14, marginBottom: 20, color: '#333', fontStyle: 'italic'}}>Note: This value represents the image classifier's confidence in its prediction. It does not represent the accuracy of a prediction.</Text>

                <Text style={{fontSize: 20, borderBottomWidth: 1, borderBottomColor: '#2a2a2a', marginBottom: 10, color: '#333'}}>Sample image</Text>
            </View>
        }

        {selectedMedConfirmed &&
            <View style={{marginBottom: 50, width: '90%'}}>
                <Image source = {{uri: `http://ec2-54-161-200-70.compute-1.amazonaws.com:8080/api/v1/medications/img/${predMedClass}`}} resizeMode="contain" style={{width:200, height:200, marginLeft:"auto", marginRight:"auto"}} />

                <Text style={{fontSize: 20, borderBottomWidth: 1, borderBottomColor: '#2a2a2a', marginBottom: 10, color: '#333'}}>Possible matches</Text>
                {scanResults.map((value, index) => {
                    return (
                        <TouchableOpacity style={{borderBottomColor: '#2a2a2a', borderBottomWidth: 1}} key={index} onPress={() => onSubmit(value['medId'], value['medName'])} >
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
            </View>
        }

        {isProcessing &&
        <View style={{marginTop: 50, width: '90%', alignItems: 'center'}}>
          <Text style={{color: '#333', fontSize: 24}}>Processing image...</Text>
        </View>
        }

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
