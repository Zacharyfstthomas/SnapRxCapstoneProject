import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Image, ScrollView} from 'react-native';
import { Appbar, Card, Title, Divider} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMedDetailsAPI, getUserMedsAPI, putUserMedAPI, deleteUserMedAPI, checkUserSavedMedAPI } from '../api/apihelper';
import { Icon } from '@rneui/themed';
import Modal from "react-native-modal";


export default function MedInfo({navigation}) {
    const [medName, setMedName] = useState("")
    const [medData, setMedData] = useState([])
    const [medId, setMedId] = useState("")
    const [updated, setUpdated] = useState(false)
    const [isGuest, setIsGuest] = useState(true)
    const [isMedSaved, setIsMedSaved] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [modalContent, setModalContent] = useState('')
    const [isLoadingData, setIsLoadingData] = useState(true)

    const toggleModalVisible = () => setIsModalVisible(!isModalVisible)

    const getMedDetails = async (medId) => {
        getMedDetailsAPI(medId)
            .then(data => {
                setMedData(data)
            })
            .catch(_ => {
                navigation.goBack()
            })
    }

    const getUserData = async () => {
        // determine whether user is a guest or registered user
        AsyncStorage.getItem('isGuest')
            .then(isGuest => {
                if (JSON.parse(isGuest)) {
                    setIsGuest(true)
                } else {
                    setIsGuest(false)
                    AsyncStorage.getItem('selectedMedId')
                    .then(selectedMedId => {
                        // check whether user has this med saved on their account
                        setIsMedSaved(false)
                        checkUserSavedMedAPI(Number(selectedMedId))
                            .then(data => {
                                setIsMedSaved(data['isMedicationSaved'])
                                setIsLoadingData(false)
                            })
                            .catch(err => {
                                console.log('[ERR]', err)
                            })
                    })
                    .catch(err => {
                        console.log('[ERR]', err)
                    })
                }
            })
            .catch(err => {
                console.log('[ERR]', err)
            })
    }

    const getMedAndUserData = async () => {
        const selectedMedId = await AsyncStorage.getItem('selectedMedId')
        setMedName(await AsyncStorage.getItem('selectedMed'))
        setMedId(selectedMedId)
        await getMedDetails(selectedMedId)
        await getUserData()
    }

    useEffect(() => {
        setMedData([])
        getMedAndUserData()
    },[])

    async function deleteUserMedicationHandler() {
        deleteUserMedAPI(medId)
            .then(_ => {
                setUpdated(true)
            })
            .catch(_ => {
                setModalContent('Failed to delete medication from saved medications. Please try again.')
                toggleModalVisible()
            })
    }
    
    async function putUserMedicationHandler() {
        putUserMedAPI(medId)
            .then(_ => {
                setUpdated(true)
            })
            .catch(_ => {
                setModalContent('Failed to saved medication. Please try again.')
                toggleModalVisible()
            })
    }

    return (
        <View style={{backgroundColor:"#eee", flex:1}}>
            <ScrollView alwaysBounceVertical={true} contentContainerStyle={{flexWrap:'nowrap'}}>
                <View style={{borderBottomWidth: 1, borderBottomColor: '#2a2a2a'}}>
                    <Text style={{padding:10, marginTop:5,  marginHorizontal:"0%",color:"#000000", fontFamily:"sans-serif-medium", letterSpacing:1.5}}>
                        Medication name: {medData.medName}
                    </Text>
                </View>
                {medData.rxString ?
                    <View style={{borderBottomWidth: 1, borderBottomColor: '#2a2a2a'}}>
                        <Text style={{padding:10, marginTop:5,  marginHorizontal:"0%",color:"#000000", fontFamily:"sans-serif-medium", letterSpacing:1.5}}>
                            Rx details: {medData.rxString}
                        </Text>
                    </View>
                        :
                    <View/>
                }

                <View style={{borderBottomWidth: 1, borderBottomColor: '#2a2a2a'}}>
                    <Text style={{padding:10, marginHorizontal:"0%",color:"#000000", fontFamily:"sans-serif-medium", letterSpacing:1.5}}>
                        Color: {medData.color}
                    </Text>
                </View>

                <View style={{borderBottomWidth: 1, borderBottomColor: '#2a2a2a'}}>
                    <Text style={{padding:10, color:"#000000", fontFamily:'sans-serif-medium', letterSpacing:1.5}}>
                        Front Imprint: {medData.imprintFront}
                    </Text>
                </View>

                <View style={{borderBottomWidth: 1, borderBottomColor: '#2a2a2a'}}>
                    <Text style={{padding:10, color:"#000000", fontFamily:'sans-serif-medium', letterSpacing:1.5}}>
                        Back Imprint: {medData.imprintBack}
                    </Text>
                </View>

                <View style={{borderBottomWidth: 1, borderBottomColor: '#2a2a2a'}}>
                    <Text style={{padding:10, color:"#000000", fontFamily:'sans-serif-medium', letterSpacing:1.5}}>
                        {medData.medDetails}
                    </Text>
                </View>

                <View style={{borderBottomWidth: 1, borderBottomColor: '#2a2a2a'}}>
                    <Text style={{padding:10, color:"#000000", fontFamily:'sans-serif-medium', letterSpacing:1.5}}>
                        Shape: {medData.shape}
                    </Text>
                </View>

                <View style={{borderBottomWidth: 1, borderBottomColor: '#2a2a2a'}}>
                    <Text style={{padding:10, color:"#000000", fontFamily:'sans-serif-medium', letterSpacing:1.5}}>
                        Size: {medData.size}mm
                    </Text>
                </View>

                {medData.price ?
                    <View>
                        <View style={{borderBottomWidth: 1, borderBottomColor: '#2a2a2a'}}>
                            <Text style={{padding:10, color:"#000000", fontFamily:'sans-serif-medium', letterSpacing:1.5}}>
                                Price: ${medData.price}
                            </Text>
                        </View>
                        <View style={{borderBottomWidth: 1, borderBottomColor: '#2a2a2a'}}>
                            <Text style={{padding:10, color:"#000000", fontFamily:'sans-serif-medium', letterSpacing:1.5}}>
                                Source: {medData.priceSource}
                            </Text>
                        </View>
                    </View>
                    :
                <Text/>
                }

            </ScrollView>

            {!isLoadingData && !isGuest &&
                <>
                {updated ?
                    <TouchableOpacity style={{right: 10, bottom: 10, width:70, height:70, position: 'absolute'}}>
                        <Image source = {require('../icons/checkmark.png')} resizeMode="contain" style={{right: 10, bottom: 10, width:70, height:70, position: 'absolute', alignSelf:'center'}}/>
                    </TouchableOpacity>
                :
                    <>
                        {isMedSaved ?
                            <TouchableOpacity style={{right: 10, bottom: 10, width:70, height:70, position: 'absolute'}} onPress={deleteUserMedicationHandler}>
                                <Image source = {require('../icons/trashcan.png')} resizeMode="contain" style={{right: 10, bottom: 10, width:70, height:70, position: 'absolute', alignSelf:'center'}}/>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity style={{right: 10, bottom: 10, width:70, height:70, position: 'absolute'}} onPress={putUserMedicationHandler}>
                                <Image source = {require('../icons/add-100.png')} resizeMode="contain" style={{right: 10, bottom: 10, width:70, height:70, position: 'absolute', alignSelf:'center'}} />
                            </TouchableOpacity>
                        }
                    </>
                }
                </>
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
        </View>
    )
}
