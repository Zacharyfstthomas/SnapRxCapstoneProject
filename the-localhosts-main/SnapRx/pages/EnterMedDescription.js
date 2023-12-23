import React, { useState } from 'react';
import {Alert, View, Text, StyleSheet, SafeAreaView, Platform, ScrollView, TextInput, TouchableOpacity} from 'react-native';
import { Appbar } from 'react-native-paper';
import SelectDropdown from 'react-native-select-dropdown';
import { classifyMedByDescriptionAPI } from '../api/apihelper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from "react-native-modal";

export default function EnterMedDescription({navigation}) {
    const [shape, setShape] = useState("")
    const [color1, setColor1] = useState("")
    const [color2, setColor2] = useState("")
    const [frontImprint, setFrontImprint] = useState("")
    const [backImprint, setBackImprint] = useState("")
    const [size, setSize] = useState("")
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [modalContent, setModalContent] = useState('')

    const shapes = [
        'CAPSULE',
        'ROUND',
        'PENTAGON',
        'OVAL',
        'RECTANGLE',
        'DIAMOND',
        'OCTAGON',
        'HEXAGON',
        'BULLET',
        'SQUARE',
        'FREEFORM',
        'TRIANGLE',
        'SEMI-CIRCLE',
        'TEAR',
        'DOUBLE CIRCLE',
        'TRAPEZOID',
        'CLOVER'
    ]

    const colors = [
        'PINK',
        'ORANGE',
        'GREEN',
        'WHITE',
        'YELLOW',
        'BLUE',
        'RED',
        'BROWN',
        'PURPLE',
        'GRAY',
        'TURQUOISE',
        'BLACK'
    ]

    const toggleModalVisible = () => setIsModalVisible(!isModalVisible)

    const onSubmit = async () => {
        classifyMedByDescriptionAPI(shape, size, frontImprint, backImprint, color1, color2)
            .then(async data => {
                let topThreeResults = []

                // Only storing the first 3 results
                for (let i = 0; i <= 2; i++) {
                    if (i >= data.results.length) {
                        break
                    }
                    topThreeResults.push({
                        medId: data.results[i]['medId'],
                        medName: data.results[i]['medName']
                    })
                }

                // result 1
                await AsyncStorage.setItem('classifyMedId1', JSON.stringify(topThreeResults[0]['medId']))
                await AsyncStorage.setItem('classifyMedName1', topThreeResults[0]['medName'])

                // result 2
                if (topThreeResults.length > 1) {
                    await AsyncStorage.setItem('classifyMedId2', JSON.stringify(topThreeResults[1]['medId']))
                    await AsyncStorage.setItem('classifyMedName2', topThreeResults[1]['medName'])
                } else {
                    await AsyncStorage.removeItem('classifyMedId2')
                    await AsyncStorage.removeItem('classifyMedName2')
                }

                // result 3
                if (topThreeResults.length > 2) {
                    await AsyncStorage.setItem('classifyMedId3', JSON.stringify(topThreeResults[2]['medId']))
                    await AsyncStorage.setItem('classifyMedName3', topThreeResults[2]['medName'])
                } else {
                    await AsyncStorage.removeItem('classifyMedId3')
                    await AsyncStorage.removeItem('classifyMedName3')
                }

                navigation.navigate("DescriptionSearchResults")
            })
            .catch(_ => {
                setModalContent('Unable to find any medications that match your search parameters. Please modify the query.')
                toggleModalVisible()
            })
    }

    return (
        <View style={{flex: 1, backgroundColor: '#eee'}}>
            <ScrollView alwaysBounceVertical={true} contentContainerStyle={{flexWrap:'nowrap', alignItems: 'center'}}>
                <View style={{marginTop: 20, marginBottom: 10, alignItems:"center"}}>
                    <SelectDropdown
                        data={shapes}
                        // defaultValueByIndex={1}
                        // defaultValue={'England'}
                        onSelect={(selectedItem, index) => {
                        setShape(selectedItem);
                        }}
                        defaultButtonText={'Shape'}
                        buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem;
                        }}
                        rowTextForSelection={(item, index) => {
                        return item;
                        }}
                        buttonStyle={styles.dropdown2BtnStyle}
                        buttonTextStyle={styles.dropdown2BtnTxtStyle}
                        renderDropdownIcon={isOpened => {
                        return <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#FFF'} size={18} />;
                        }}
                        dropdownIconPosition={'right'}
                        dropdownStyle={styles.dropdown2DropdownStyle}
                        rowStyle={styles.dropdown2RowStyle}
                        rowTextStyle={styles.dropdown2RowTxtStyle}
                    />
                </View>

                <View style={{marginVertical:10, alignItems:"center"}}>
                    <SelectDropdown
                        data={colors}
                        // defaultValueByIndex={1}
                        // defaultValue={'England'}
                        onSelect={(selectedItem, index) => {
                        setColor1(selectedItem);
                        }}
                        defaultButtonText={'Color (primary)'}
                        buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem;
                        }}
                        rowTextForSelection={(item, index) => {
                        return item;
                        }}
                        buttonStyle={styles.dropdown2BtnStyle}
                        buttonTextStyle={styles.dropdown2BtnTxtStyle}
                        renderDropdownIcon={isOpened => {
                        return <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#FFF'} size={18} />;
                        }}
                        dropdownIconPosition={'right'}
                        dropdownStyle={styles.dropdown2DropdownStyle}
                        rowStyle={styles.dropdown2RowStyle}
                        rowTextStyle={styles.dropdown2RowTxtStyle}
                    />
                </View>

                <View style={{marginVertical:10, alignItems:"center"}}>
                    <SelectDropdown
                        data={colors}
                        // defaultValueByIndex={1}
                        // defaultValue={'England'}
                        onSelect={(selectedItem, index) => {
                        setColor2(selectedItem);
                        }}
                        defaultButtonText={'Color (secondary)'}
                        buttonTextAfterSelection={(selectedItem, index) => {
                        return selectedItem;
                        }}
                        rowTextForSelection={(item, index) => {
                        return item;
                        }}
                        buttonStyle={styles.dropdown2BtnStyle}
                        buttonTextStyle={styles.dropdown2BtnTxtStyle}
                        renderDropdownIcon={isOpened => {
                        return <FontAwesome name={isOpened ? 'chevron-up' : 'chevron-down'} color={'#FFF'} size={18} />;
                        }}
                        dropdownIconPosition={'right'}
                        dropdownStyle={styles.dropdown2DropdownStyle}
                        rowStyle={styles.dropdown2RowStyle}
                        rowTextStyle={styles.dropdown2RowTxtStyle}
                    />
                </View>

                <View style={{width: '80%', marginTop: 20}}>
                    <Text style={{fontSize: 20, borderBottomWidth: 1, borderBottomColor: '#2a2a2a', marginBottom: 10, color: '#333', alignSelf: 'flex-start'}}>Front imprint</Text>
                    <TextInput style={styles.inputLabel} backgroundColor='#ffffff' placeholder={"Enter front imprint..."} placeholderTextColor='#333' onChangeText={frontImprintInput => setFrontImprint(frontImprintInput)}/>
                </View>

                <View style={{width: '80%'}}>
                    <Text style={{fontSize: 20, borderBottomWidth: 1, borderBottomColor: '#2a2a2a', marginBottom: 10, color: '#333', alignSelf: 'flex-start'}}>Back imprint</Text>
                    <TextInput style={styles.inputLabel} backgroundColor='#ffffff' placeholder={"Enter back imprint..."} placeholderTextColor='#333' onChangeText={backImprintInput => setBackImprint(backImprintInput)}/>
                </View>

                <View style={{width: '80%'}}>
                    <Text style={{fontSize: 20, borderBottomWidth: 1, borderBottomColor: '#2a2a2a', marginBottom: 10, color: '#333', alignSelf: 'flex-start'}}>Size (mm)</Text>
                    <TextInput style={styles.inputLabel} backgroundColor='#ffffff' keyboardType='number-pad' placeholder={"Enter size (mm)..."} placeholderTextColor='#333' onChangeText={sizeInput => setSize(sizeInput)}/>
                </View>

                <TouchableOpacity style={styles.press} onPress={onSubmit}>
                    <Text style={styles.buttonText2}>
                        Search
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
        </View>
    )
}


const styles = StyleSheet.create({
    ...Platform.select({
      ios: {
        inputLabel: {
            borderColor: '#2A2A2A',
            width:"80%",
            height: 40,
            padding: 20,
            marginTop: 30,
            borderRadius: 10,
            borderWidth: 2,
            textAlign: 'center',
            fontSize: 20,
        },
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
            fontSize: 20,
            color: '#ffffff',
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
            backgroundColor: '#2A2A2A'
        },
        dropdown2BtnStyle: {
            width: '80%',
            height: 50,
            backgroundColor: '#444',
            borderRadius: 8,
          },
          dropdown2BtnTxtStyle: {
            color: '#FFF',
            textAlign: 'center',
            fontWeight: 'bold',
          },
          dropdown2DropdownStyle: {
            backgroundColor: '#444',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          },
          dropdown2RowStyle: {backgroundColor: '#444', borderBottomColor: '#C5C5C5'},
          dropdown2RowTxtStyle: {
            color: '#FFF',
            textAlign: 'center',
            fontWeight: 'bold',
          },
  
      },
  
      android: {
        inputLabel: {
            borderColor: '#2A2A2A',
            width:"100%",
            height: 40,
            marginBottom: 20,
            borderRadius: 10,
            borderWidth: 2,
            textAlign: 'center',
            fontSize: 20,
        },
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
            position:'relative'
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
            marginTop: 40,
            marginBottom: 50,
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
            color: '#000000',
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
        listButtonText: {
            fontSize: 20,
            color: '#ffffff',
            alignItems: 'center',
        },
        appBar: {
            backgroundColor: '#2A2A2A'
        },
        dropdown2BtnStyle: {
            width: '80%',
            height: 50,
            backgroundColor: '#777',
            borderRadius: 8,
        },
        dropdown2BtnTxtStyle: {
            color: '#FFF',
            textAlign: 'center',
            fontWeight: 'bold',
        },
        dropdown2DropdownStyle: {
            backgroundColor: '#777',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
        },
        dropdown2RowStyle: {
            backgroundColor: '#555',
            borderBottomColor: '#C5C5C5'
        },
        dropdown2RowTxtStyle: {
            color: '#FFF',
            textAlign: 'center',
            fontWeight: 'bold',
        },

      },
    }),
  })
