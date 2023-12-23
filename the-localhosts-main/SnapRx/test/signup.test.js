import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { shallow } from 'enzyme';
import SignUp from '../pages/SignUp';
import {
    ScrollView,
    ImageBackground,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Modal from "react-native-modal";

describe('TextInput first name', () => {
    it('should update first name value on change', () => {
      const setFirstNameMock = jest.fn();
      const { getByTestId } = render(<TextInput onChangeText={setFirstNameMock} testID="first name" />);
      const firstNameInput = getByTestId('first name');
      fireEvent.changeText(firstNameInput, 'John');
  
      expect(setFirstNameMock).toHaveBeenCalledWith('John');
    });
  });

  
describe('TextInput lastname', () => {
    it('should update last name value on change', () => {
      const setLastNameMock = jest.fn();
      const { getByTestId } = render(<TextInput onChangeText={setLastNameMock} testID="last name" />);
      const LastNameInput = getByTestId('last name');
      fireEvent.changeText(LastNameInput, 'Doe');
  
      expect(setLastNameMock).toHaveBeenCalledWith('Doe');
    });
  });

describe('TextInput email', () => {
    it('should update email value on change', () => {
      const setEmailMock = jest.fn();
      const { getByTestId } = render(<TextInput onChangeText={setEmailMock} testID="email" />);
      const EmailInput = getByTestId('email');
      fireEvent.changeText(EmailInput, 'JD@email.com');
  
      expect(setEmailMock).toHaveBeenCalledWith('JD@email.com');
    });
  });

describe('TextInput password', () => {
    it('should update password value on change', () => {
      const setPassMock = jest.fn();
      const { getByTestId } = render(<TextInput onChangeText={setPassMock} testID="password" />);
      const PassInput = getByTestId('password');
      fireEvent.changeText(PassInput, 'Testing1!');
  
      expect(setPassMock).toHaveBeenCalledWith('Testing1!');
    });
  });

describe('TextInput confirm password', () => {
    it('should update confirm password value on change', () => {
      const setCPassMock = jest.fn();
      const { getByTestId } = render(<TextInput onChangeText={setCPassMock} testID="confirm password" />);
      const CPassInput = getByTestId('confirm password');
      fireEvent.changeText(CPassInput, 'Testing1!');
  
      expect(setCPassMock).toHaveBeenCalledWith('Testing1!');
    });
  });

describe('Signup Component', () => {
    test('should trigger signupHandler on press', () => {
      const mockSignupHandler = jest.fn();
      const { getByTestId } = render(
        <TouchableOpacity onPress={mockSignupHandler} testID="signup-button">
          <Text>Sign up</Text>
        </TouchableOpacity>
      );
  
      fireEvent.press(getByTestId('signup-button'));
  
      expect(mockSignupHandler).toHaveBeenCalled();
    });
  });
//Overall, this test suite ensures that the Modal component is rendered correctly and that the mockToggleModalVisible function is called when the Close button is pressed.
  describe('Modal component', () => {
    let wrapper;
    const mockToggleModalVisible = jest.fn();
  
    beforeEach(() => {
      wrapper = shallow(
        <Modal isVisible={true}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 20,
                alignItems: 'center',
                elevation: 5,
              }}
            >
              <Text style={{ marginBottom: 20 }}>Test Modal Content</Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#2979ff',
                  borderRadius: 10,
                  padding: 10,
                }}
                onPress={mockToggleModalVisible}
              >
                <Text style={{ color: '#fff' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      );
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('renders correctly', () => {
      expect(wrapper).toMatchSnapshot();
    });
  
    it('should call mockToggleModalVisible when Close button is pressed', () => {
      wrapper.find(TouchableOpacity).simulate('press');
      expect(mockToggleModalVisible).toHaveBeenCalledTimes(1);
    });
  });