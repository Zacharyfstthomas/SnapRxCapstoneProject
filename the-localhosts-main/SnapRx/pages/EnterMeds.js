import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Image, ScrollView, Keyboard} from 'react-native';
import NumberPlease from "react-native-number-please";
import Autocomplete from 'react-native-autocomplete-input';
import { NavigationContainer } from "@react-navigation/native";
import { TextField } from 'native-base';
import { Appbar, Card, Title, Divider, TextInput} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchMedsAPI } from '../api/apihelper';

export default function EnterMeds({navigation}) {
    const [getMedsData, setMedsData] = useState([])

    const searchMedsByQuery = async(query) => {
        // don't send API request if query is empty
        if (!query) {
            return
        }

        // search medications by query
        searchMedsAPI(query)
            .then(data => {
                // update medsData with search results
                setMedsData(data.results)
            })
            .catch(_ => {
                setMedsData([])
            })
    }

    const onSelectMed = async (medId, medName) => {
        await AsyncStorage.setItem('selectedMed', medName)
        await AsyncStorage.setItem('selectedMedId', medId.toString())
        navigation.navigate("MedInfo")
    }

    return (
        <SafeAreaView style={{flex:1, backgroundColor:"#eee", alignItems: 'center'}}>

            {Platform.OS === "ios" ?
                <Autocomplete
                    autoCorrect={true}
                    containerStyle={styles.autocompleteContainer2}
                    data={getMedsData.map((med) => {return [med.medId, med.medName, med.rxString]})}
                    onChangeText={(query) => searchMedsByQuery(query)}
                    placeholder="Enter medication name or details..."
                    placeholderTextColor="#000000"
                    listContainerStyle={{}}
                    inputContainerStyle={{borderColor:"#2979ff", borderWidth:3, marginBottom: 5}}
                    defaultValue={''}
                    flatListProps={{
                        keyboardShouldPersistTaps: 'always',
                        width:"100%",
                        hideDropdown: false,
                        keyExtractor: (item) => item[0],
                        renderItem: (({item}) => (
                            <TouchableOpacity
                                onPress={() => {
                                    onSelectMed(item[0], item[1])
                                }}>
                                <Text style={styles.itemText}>
                                    {item[1]}
                                </Text>
                                <Text style={{fontSize: 14, fontStyle: 'italic'}}>
                                    {item[2]}
                                </Text>
                            </TouchableOpacity>
                        ))
                    }}
                />
            :
                <Autocomplete
                    autoCorrect={true}
                    containerStyle={styles.autocompleteContainer2}
                    data={getMedsData.map((med) => {return [med.medId, med.medName, med.rxString]})}
                    onChangeText={(query) => searchMedsByQuery(query)}
                    placeholder="Enter medication name or details..."
                    placeholderTextColor="#000000"
                    listContainerStyle={{marginBottom: 50}}
                    inputContainerStyle={{borderColor:"#2979ff", borderWidth:3, marginBottom: 5}}
                    defaultValue={''}
                    keyboardType='default'
                    flatListProps={{
                        keyboardShouldPersistTaps: 'always',
                        width:"100%",
                        hideDropdown: false,
                        keyExtractor: (item) => item[0],
                        renderItem: (({item}) => (
                            <TouchableOpacity
                                style={{
                                    padding: 5,
                                    backgroundColor:"#d3d3d3",
                                    marginBottom: 10
                                }}
                                onPress={() => {
                                    onSelectMed(item[0], item[1])
                                }}>
                                <Text style={styles.itemText}>
                                    {item[1]}
                                </Text>
                                <Text style={{fontSize: 14, fontStyle: 'italic'}}>
                                    {item[2]}
                                </Text>
                            </TouchableOpacity>
                        ))
                    }}
                />
            }
        </SafeAreaView>
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
        titleText: {
            fontSize:24,
            color:"#ffffff",
            fontFamily: 'Avenir-Medium',
        },
        buttonButtonView: {
            alignItems: 'center',
            marginBottom:'10%',
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
            zIndex:100,
            width: '95%',
            marginHorizontal: 20,
            paddingHorizontal: 10,
            justifyContent:'center',
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
        listButton: {
            backgroundColor: '#7A0000',
            height: 70,
            width: 285,
            borderColor: '#000000',
            borderWidth: 1,
            alignItems: 'center',
            borderRadius: 5,
            marginTop:25,

        },
        buttonText: {
            fontSize: 20,
            color: '#ffffff',
            textAlign: 'center',
            alignSelf:'center',
            marginTop:"8%"
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
            color: '#ffffff',
            textAlign: 'center',
            alignSelf:'center',
            marginTop:"8%",
            paddingLeft:"12%"
        },
        listButtonText: {
            fontSize: 20,
            color: '#ffffff',
            alignItems: 'center',
        },
        appBar: {
            backgroundColor: '#2A2A2A',

        },
  
      },
  
      android: {
        titleView: {
            marginTop: 70,
            marginRight: 0,
            marginLeft: 0,
            alignItems:"center"
        },
        titleText: {
            fontSize:24,
            color:"#ffffff",
            fontFamily: 'normal',
        },
        buttonButtonView: {
            alignItems: 'center',
            marginBottom:'10%',
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
            zIndex: 10
            },
        itemText: {
            fontSize: 18,
          },
        autocompleteContainer1: {
            flex: 1,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 1
        },
        autocompleteContainer2: {
            paddingTop: 20,
            width: '95%',
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
        listButton: {
            backgroundColor: '#7A0000',
            height: 70,
            width: 285,
            borderColor: '#000000',
            borderWidth: 1,
            alignItems: 'center',
            borderRadius: 5,
            marginTop:25,

        },
        buttonText: {
            fontSize: 20,
            color: '#ffffff',
            textAlign: 'center',
            alignSelf:'center',
            marginTop:"8%"
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
            color: '#ffffff',
            textAlign: 'center',
            alignSelf:'center',
            marginTop:"8%",
            paddingLeft:"12%"
        },
        listButtonText: {
            fontSize: 20,
            color: '#ffffff',
            alignItems: 'center',
        },
        appBar: {
            backgroundColor: '#2A2A2A',
        },
  
      },
    }),
  });
