import React, { useState, useEffect } from 'react';
import { ScrollView, ImageBackground, Pressable, View, Text, StyleSheet, SafeAreaView, TextInput, Button, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePasswordAPI } from '../api/apihelper';
import {Appbar} from "react-native-paper";
import UpdatePassword from '../pages/UpdatePassword.js';
import { Platform } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
jest.mock('../api/apihelper', () => ({
  updatePassword: jest.fn(() => Promise.reject({ message: 'Failed to update password. Ensure that your old password is correct.' })),
}));
  describe('UpdatePassword', () => {
    test('renders correctly', () => {
      const { getByPlaceholderText, getByText } = render(<UpdatePassword />);
      expect(getByPlaceholderText('Old password')).toBeTruthy();
      expect(getByPlaceholderText('New password')).toBeTruthy();
      expect(getByPlaceholderText('Confirm new password')).toBeTruthy();
      expect(getByText('Update password')).toBeTruthy();
      expect(getByText('Password requirements: 1 uppercase char, 1 lowercase char, 1 number, 1 special char, 8+ chars')).toBeTruthy();
    });
  
    test('renders placeholder text in old password field', () => {
      const { getByPlaceholderText } = render(<UpdatePassword navigation={{}} />);
      const oldPasswordField = getByPlaceholderText('Old password');
      const newPasswordField = getByPlaceholderText('New password');
      
      expect(oldPasswordField).toBeTruthy();
      expect(newPasswordField).toBeTruthy();

    });
  
    test('shows error modal when new password does not meet requirements', async () => {
      const { getByPlaceholderText, getByText } = render(<UpdatePassword navigation={{}} />);
      const oldPasswordField = getByPlaceholderText('Old password');
      const newPasswordField = getByPlaceholderText('New password');
      const confirmNewPasswordField = getByPlaceholderText('Confirm new password');
      const updatePasswordButton = getByText('Update password');
  
      fireEvent.changeText(oldPasswordField, 'password123');
      fireEvent.changeText(newPasswordField, 'weakpassword');
      fireEvent.changeText(confirmNewPasswordField, 'weakpassword');
      fireEvent.press(updatePasswordButton);
  
      await waitFor(() => {
        expect(getByText('Your new password does not fulfill the password requirements. Passwords must contain 1 uppercase char, 1 lowercase char, 1 number, 1 special char, and 8+ chars.')).toBeTruthy();
      });
    });
  
    test('shows error modal when passwords do not match', async () => {
      const { getByPlaceholderText, getByText } = render(<UpdatePassword navigation={{}} />);
      const oldPasswordField = getByPlaceholderText('Old password');
      const newPasswordField = getByPlaceholderText('New password');
      const confirmNewPasswordField = getByPlaceholderText('Confirm new password');
      const updatePasswordButton = getByText('Update password');
  
      fireEvent.changeText(oldPasswordField, 'password123');
      fireEvent.changeText(newPasswordField, 'StrongPassword1!');
      fireEvent.changeText(confirmNewPasswordField, 'MismatchedPassword1!');
      fireEvent.press(updatePasswordButton);
  
      await waitFor(() => {
        expect(getByText('Passwords do not match.')).toBeTruthy();
      });
    });
  
    test('shows success modal when password is updated successfully', async () => {
      const { getByPlaceholderText, getByText } = render(<UpdatePassword navigation={{ navigate: jest.fn() }} />);
      const oldPasswordField = getByPlaceholderText('Old password');
      const newPasswordField = getByPlaceholderText('New password');
      const confirmNewPasswordField = getByPlaceholderText('Confirm new password');
      const updatePasswordButton = getByText('Update password');
  
      fireEvent.changeText(oldPasswordField, 'password123');
      fireEvent.changeText(newPasswordField, 'StrongPassword1!'); })})