import React, { useState } from 'react';
import {Alert, View, Text, StyleSheet, SafeAreaView, Platform, ScrollView, TextInput, TouchableOpacity} from 'react-native';
import { Appbar } from 'react-native-paper';
import SelectDropdown from 'react-native-select-dropdown';
import { classifyMedByDescriptionAPI } from '../api/apihelper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from "react-native-modal";
import { render, fireEvent,getByTestId } from '@testing-library/react-native';
import EnterMedDescription from '../pages/EnterMedDescription';

//The first test is checking if the EnterMedDescription component renders an input field with the correct placeholder.It then checks if the placeholder text of the input field is equal to the expected value.
describe('MyComponent', () => {
    it('renders an input field with the correct placeholder', () => {
      const { getByPlaceholderText } = render(<EnterMedDescription />);
      const input = getByPlaceholderText('Enter size (mm)...');
      
      expect(input.props.placeholder).toBe('Enter size (mm)...');
    });
  });
//The second test is checking if the EnterMedDescription component renders a Modal component when the isVisible prop is set to true. It uses the render method from the @testing-library/react-native library to render the component with the prop values and does not check any specific behavior.
test('renders Modal component', () => {
    render(<EnterMedDescription isVisible={true} modalContent="This is a test modal" />);
  });