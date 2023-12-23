import React, { useState, useEffect, useCallback } from 'react';
import { Pressable, View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, Image, ScrollView} from 'react-native';
import { Appbar, Card, Title, Divider} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMedDetailsAPI, getUserMedsAPI, putUserMedAPI, deleteUserMedAPI, checkUserSavedMedAPI } from '../api/apihelper';
//import { Icon } from '@rneui/themed';
import Modal from "react-native-modal";
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import EnterMeds from '../pages/EnterMeds';
import { searchMedsAPI } from '../api/apihelper';
//This is a unit test for the EnterMeds component. It tests whether the component renders correctly by checking if a specific placeholder text exists in the component
//The expect function checks whether the placeholder variable is not null, indicating that the input field with the specified placeholder text exists in the component. If the test passes, it means that the EnterMeds component renders correctly with the expected input field.
describe('<EnterMeds />', () => {
  test('should render component', async () => {
    const { getByPlaceholderText } = render(<EnterMeds />);
    const placeholder = getByPlaceholderText('Enter medication name or details...');
    expect(placeholder).not.toBeNull();
  });
});