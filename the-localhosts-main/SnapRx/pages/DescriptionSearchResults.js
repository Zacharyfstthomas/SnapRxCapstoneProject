import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Image, ScrollView} from 'react-native';
import { useIsFocused } from "@react-navigation/native";
import { getMedDetailsAPI } from '../api/apihelper';

export default function DescriptionSearchResults({navigation}) {
    const [hasMed1, setHasMed1] = useState(false)
    const [hasMed2, setHasMed2] = useState(false)
    const [hasMed3, setHasMed3] = useState(false)

    const [medId1, setMedId1] = useState('')
    const [medId2, setMedId2] = useState('')
    const [medId3, setMedId3] = useState('')

    const [medName1, setMedName1] = useState('')
    const [medName2, setMedName2] = useState('')
    const [medName3, setMedName3] = useState('')

    const getResultsDetails = async () => {
        const id1 = await AsyncStorage.getItem('classifyMedId1')
        const id2 = await AsyncStorage.getItem('classifyMedId2')
        const id3 = await AsyncStorage.getItem('classifyMedId3')

        const name1 = await AsyncStorage.getItem('classifyMedName1')
        const name2 = await AsyncStorage.getItem('classifyMedName2')
        const name3 = await AsyncStorage.getItem('classifyMedName3')

        if (id1) {
            setMedId1(id1)
            setMedName1(name1)
            setHasMed1(true)
        }

        if (id2) {
            setMedId2(id2)
            setMedName2(name2)
            setHasMed2(true)
        }

        if (id3) {
            setMedId3(id3)
            setMedName3(name3)
            setHasMed3(true)
        }
    }

    useEffect(() => {
        getResultsDetails()
    },[])


    const selectMedHandler = async (value, name) => {
        await AsyncStorage.setItem('selectedMed', name)
        await AsyncStorage.setItem('selectedMedId', value.toString())
        navigation.navigate('MedInfo')
    }

    return (
        <View style={{flex:1, backgroundColor:"#eee"}}>
            <ScrollView alwaysBounceVertical={true} contentContainerStyle={{flexWrap:'nowrap'}}>
                <View style={{marginTop:'10%', alignItems:'center'}}>
                    {hasMed1 &&
                    <TouchableOpacity style={styles.listButtonG} onPress={() => selectMedHandler(medId1, medName1)}>
                        <View style={{alignSelf:'flex-start', position: 'relative'}}>
                            <Image source = {require('../icons/pillBottle2.png')} resizeMode="contain" style={{marginTop:10, width:50, height:50, position: 'absolute', left:5}}/>
                        </View>

                        {medName1.length > 18 ?
                            <Text style={styles.buttonText}>
                                {medName1.substring(0, 15)}...
                            </Text>
                            :
                            <Text style={styles.buttonText}>
                                {medName1}
                            </Text>
                        }
                    </TouchableOpacity>
                    }

                    {hasMed2 &&
                    <TouchableOpacity style={styles.listButtonY} onPress={() => selectMedHandler(medId2, medName2)}>
                        <View style={{alignSelf:'flex-start', position: 'relative'}}>
                            <Image source = {require('../icons/pillBottle2.png')} resizeMode="contain" style={{marginTop:10, width:50, height:50, position: 'absolute', left:5}}/>
                        </View>

                        {medName2.length > 18 ?
                            <Text style={styles.buttonText}>
                                {medName2.substring(0, 15)}...
                            </Text>
                            :
                            <Text style={styles.buttonText}>
                                {medName2}
                            </Text>
                        }
                    </TouchableOpacity>
                    }

                    {hasMed3 &&
                    <TouchableOpacity style={styles.listButtonR} onPress={() => selectMedHandler(medId3, medName3)}>
                        <View style={{alignSelf:'flex-start', position: 'relative'}}>
                            <Image source = {require('../icons/pillBottle2.png')} resizeMode="contain" style={{marginTop:10, width:50, height:50, position: 'absolute', left:5}}/>
                        </View>

                        {medName3.length > 18 ?
                            <Text style={styles.buttonText}>
                                {medName3.substring(0, 15)}...
                            </Text>
                            :
                            <Text style={styles.buttonText}>
                                {medName3}
                            </Text>
                        }
                    </TouchableOpacity>
                    }
                </View>
            </ScrollView>
         </View>
    )
}


const styles = StyleSheet.create({
    ...Platform.select({
      ios: {
        titleView: {
            marginTop: 70,
            marginRight: 0,
            marginLeft: 0,
            alignItems:"center"
        },
        titleView2: {
            marginTop: 20,
            marginLeft: 20,
            alignItems:"center",
            backgroundColor:"#2979ff",
            borderRadius: 10,
            width:"90%"
        },
        titleText: {
            fontSize:24,
            color:"#ffffff",
            fontFamily: 'Avenir-Medium',
        },
        buttonButtonView: {
            alignItems: 'center',
            // marginTop:'0%',
            marginBottom:'10%',
            // position:'absolute'
        },
        dropdown: {
            height: 50,
            borderColor: 'gray',
            borderWidth: 0.5,
            borderRadius: 8,
            paddingHorizontal: 8,
          },
        container: {
            flex: 1,
            marginTop: '10%',
            position:"relative",
            zIndex: 10,
            padding: 10,
            borderRadius: 5
            },
        itemText: {
            fontSize: 17,
            paddingTop: 5,
            paddingBottom: 5,
            backgroundColor:"#d3d3d3",
            margin: 2,
          },
        autocompleteContainer2: {
            flex: 1,
            left: 0,
            maxHeight:100,
            width: '95%',
            position: 'absolute',
            marginHorizontal: 20,
            top: 15,
            paddingHorizontal: 10,
            justifyContent:'center',
            //zIndex: 1
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
        listButtonG: {
            backgroundColor: '#25E81D',
            height: 70,
            width: 285,
            borderColor: '#000000',
            borderWidth: 1,
            alignItems: 'center',
            // justifyContent: 'center',
            borderRadius: 5,
            marginTop:25,
            // paddingBottom:40

        },
        listButtonY: {
            backgroundColor: '#DBFF00',
            height: 70,
            width: 285,
            borderColor: '#000000',
            borderWidth: 1,
            alignItems: 'center',
            // justifyContent: 'center',
            borderRadius: 5,
            marginTop:25,
            // paddingBottom:40

        },
        listButtonR: {
            backgroundColor: '#EE3C3C',
            height: 70,
            width: 285,
            borderColor: '#000000',
            borderWidth: 1,
            alignItems: 'center',
            // justifyContent: 'center',
            borderRadius: 5,
            marginTop:25,
            // paddingBottom:40

        },
        buttonText: {
            fontSize: 20,
            color: '#00000',
            marginTop:"8%",
            marginLeft: 60
        },
        buttonText2: {
            fontSize: 20,
            color: '#ffffff',
            textAlign: 'center',
            alignSelf:'center',
            marginTop:"0%"
        },
        buttonText3: {
            fontSize: 15,
            color: '#000000',
            textAlign: 'center',
            alignSelf:'center',
            marginTop:"8%",
            paddingLeft:"12%"
        },
        brandText: {
            fontSize: 20,
            color: '#000000',
            textAlign: 'center',
            alignSelf:'center',
            marginTop:"2%"
        },
        listButtonText: {
            fontSize: 20,
            color: '#ffffff',
            alignItems: 'center',
        },
        appBar: {
            backgroundColor: '#6C68E5'
        },
  
      },
  
      android: {
        titleView: {
            marginTop: 70,
            marginRight: 0,
            marginLeft: 0,
            alignItems:"center"
        },
        titleView2: {
            marginTop: 20,
            marginLeft: 20,
            alignItems:"center",
            backgroundColor:"#2979ff",
            borderRadius: 10,
            width:"90%"
        },
        titleText: {
            fontSize:24,
            color:"#ffffff",
            fontFamily: 'normal',
        },
        buttonButtonView: {
            alignItems: 'center',
            // marginTop:'0%',
            marginBottom:'10%',
            // position:'absolute'
        },
        dropdown: {
            height: 50,
            borderColor: 'gray',
            borderWidth: 0.5,
            borderRadius: 8,
            paddingHorizontal: 8,
          },
        container: {
            flex: 1,
            marginTop: '10%',
            position:"relative",
            zIndex: 10,
            padding: 10,
            borderRadius: 5
            },
        itemText: {
            fontSize: 17,
            paddingTop: 5,
            paddingBottom: 5,
            backgroundColor:"#d3d3d3",
            margin: 2,
          },
        autocompleteContainer2: {
            flex: 1,
            left: 0,
            maxHeight:100,
            width: '95%',
            position: 'absolute',
            marginHorizontal: 20,
            top: 15,
            paddingHorizontal: 10,
            justifyContent:'center',
            //zIndex: 1
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
        listButtonG: {
            backgroundColor: '#ededed',
            height: 70,
            width: 285,
            borderColor: '#000000',
            borderWidth: 1,
            // justifyContent: 'center',
            borderRadius: 5,
            marginTop:25,
            // paddingBottom:40
        },
        listButtonY: {
            backgroundColor: '#ededed',
            height: 70,
            width: 285,
            borderColor: '#000000',
            borderWidth: 1,
            // justifyContent: 'center',
            borderRadius: 5,
            marginTop:25,
            // paddingBottom:40

        },
        listButtonR: {
            backgroundColor: '#ededed',
            height: 70,
            width: 285,
            borderColor: '#000000',
            borderWidth: 1,
            // justifyContent: 'center',
            borderRadius: 5,
            marginTop:25,
            // paddingBottom:40

        },
        buttonText: {
            fontSize: 20,
            color: '#000000',
            marginTop:"8%",
            marginLeft: 60
        },
        buttonText2: {
            fontSize: 20,
            color: '#ffffff',
            textAlign: 'center',
            alignSelf:'center',
            marginTop:"0%"
        },
        buttonText3: {
            fontSize: 20,
            color: '#000000',
            marginTop:"8%",
            marginLeft: 70
        },
        brandText: {
            fontSize: 20,
            color: '#000000',
            marginTop:"8%",
            marginLeft: 70
        },
        listButtonText: {
            fontSize: 20,
            color: '#ffffff',
            alignItems: 'center',
        },
        appBar: {
            backgroundColor: '#6C68E5'
        },
  
      },
    }),
  });
