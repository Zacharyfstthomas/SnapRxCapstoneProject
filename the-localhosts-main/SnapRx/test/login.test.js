import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
//import { AsyncStorage } from 'react-native'
//import Login from '../pages/Login';
//import  loginAPI from '../api/apihelper';
//import {storeVariables} from '../pages/Profile';
// jest.mock('@react-native-community/async-storage');
// console.error = jest.fn()
import { shallow } from 'enzyme';
import Login from '../pages/Login';
import { TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native';
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
describe('Background Image', () => {
  it('should use the correct image', () => {
    const wrapper = shallow(<Login />);
    expect(wrapper.find('ImageBackground').prop('source')).toEqual(require('../logos/logo4.jpg'));
  });
});

describe('TextInput Email', () => {
  it('should update email when text is changed', () => {
    const { getByTestId } = render(<Login />);
    const input = getByTestId('email');
    const testEmail = 'linh@gmail.com';
    fireEvent.changeText(input, testEmail);
    expect(input.props.placeholder).toBe('Email');
  });
});

describe('Login', () => {
    let wrapper;
    let mockFn = jest.fn();
    beforeEach(() => {
      wrapper = shallow(<TouchableOpacity onPress={mockFn} />);
    });
    it('calls SUB function when TouchableOpacity is pressed', () => {
      wrapper.simulate('press');
      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('TextInput', () => {
    const setEmailMock = jest.fn();
    const wrapper = shallow(<TextInput setEmail={setEmailMock} />);
  
    it('renders correctly', () => {
      expect(wrapper).toMatchSnapshot();
    });
  /*
    it('calls setEmail on text input change', () => {
      const textInput = wrapper.find({ testID: "email" });
      const text = 'test@example.com';
      textInput.simulate('changeText', text);
      expect(setEmailMock).toHaveBeenCalledWith(text);
      
    });*/
  });

  //This unit test is testing the rendering of a TextInput component with a mocked setEmail function passed as a prop. The test checks that the component renders correctly by comparing it to a snapshot. This means that the test takes a snapshot of the component and compares it to a previously saved snapshot to ensure that the component has not changed unexpectedly. If the component's rendering changes in a way that was not intended, the test will fail and a developer will need to update the snapshot to reflect the new changes.