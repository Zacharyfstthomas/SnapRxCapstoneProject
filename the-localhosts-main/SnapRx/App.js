import { NavigationContainer } from '@react-navigation/native';
import Tabs from './navigation/tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Launch from './pages/Launch';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MedInfo from './pages/MedInfo';
import DescriptionSearchResults from './pages/DescriptionSearchResults';
import UpdatePassword from './pages/UpdatePassword';
import Camera2 from './pages/Camera2';

const Stack = createNativeStackNavigator()

const App = () => {
  return (
      <NavigationContainer>
          <Stack.Navigator>
              <Stack.Screen name='Launch' component={Launch} options={{headerShown: false}} />
              <Stack.Screen name='Login' component={Login} />
              <Stack.Screen name='SignUp' component={SignUp} />
              <Stack.Screen name='Main' component={Tabs} options={{headerShown: false}} />
              <Stack.Screen name='MedInfo' component={MedInfo} options={{headerTitle: 'Medication info'}} />
              <Stack.Screen name='DescriptionSearchResults' component={DescriptionSearchResults} options={{headerTitle: 'Search results'}} />
              <Stack.Screen name='UpdatePassword' component={UpdatePassword} options={{headerTitle: 'Update password'}} />
              <Stack.Screen name='ScanMedGuest' component={Camera2} options={{headerTitle: 'Scan medication image'}} />
          </Stack.Navigator>
      </NavigationContainer>
  )
}

export default App;
