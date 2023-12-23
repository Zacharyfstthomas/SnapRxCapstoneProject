import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Dashboard from '../pages/Dashboard'
import Camera2 from '../pages/Camera2'
import EnterMeds from '../pages/EnterMeds'
import EnterMedDescription from '../pages/EnterMedDescription'
import Profile from '../pages/Profile'
import {Image, TouchableOpacity, View} from "react-native";

const Tab = createBottomTabNavigator()

const Tabs = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name='My Meds' component={Dashboard} options={{tabBarIcon: ({focused}) => (
                <View style={{alignItems:'center', justifyContent:'center'}}>
                    <Image source = {require('../icons/list.png')} resizeMode="contain" style={{ width:25, height:25, tintColor: focused ? "#e32f45" : "#748c94"}} />
                </View>
              ),
              headerTitle: 'My saved medications'
            }}
            />
            <Tab.Screen name='Search' component={EnterMeds} options={{tabBarIcon: ({focused}) => (
                <View style={{alignItems:'center', justifyContent:'center'}}>
                    <Image source = {require('../icons/search.png')} resizeMode="contain" style={{ width:25, height:25, tintColor: focused ? "#e32f45" : "#748c94"}} />
                </View>
              ),
              headerTitle: 'Search medications'
            }}
            />
            <Tab.Screen name='Scan Med' component={Camera2} options={{tabBarIcon: ({focused}) => (
                <View style={{alignItems:'center', justifyContent:'center'}}>
                    <Image source = {require('../icons/scan-icon.png')} resizeMode="contain" style={{ width:25, height:25, tintColor: focused ? "#e32f45" : "#748c94"}} />
                </View>
              ),
              headerTitle: 'Scan medication image'
            }}
            />
            <Tab.Screen name='Describe Med' component={EnterMedDescription} options={{tabBarIcon: ({focused}) => (
                <View style={{alignItems:'center', justifyContent:'center'}}>
                    <Image source = {require('../icons/rx2.png')} resizeMode="contain" style={{ width:25, height:25, tintColor: focused ? "#e32f45" : "#748c94"}} />
                </View>
              ),
              headerTitle: 'Describe medication'
            }}
            />
            <Tab.Screen name='Profile' component={Profile} options={{tabBarIcon: ({focused}) => (
                <View style={{alignItems:'center', justifyContent:'center'}}>
                    <Image source = {require('../icons/account.png')} resizeMode="contain" style={{ width:25, height:25, tintColor: focused ? "#e32f45" : "#748c94"}} />
                </View>
              ),
              headerTitle: 'Manage profile'
            }}
            />
        </Tab.Navigator>
    )
}

export default Tabs
