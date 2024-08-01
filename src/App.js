import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AuthStackNavigator from './navigators/AuthStackNavigator';
import auth from '@react-native-firebase/auth';
import AppStackUserNavigator from './navigators/AppStackUserNavigator';
import WelcomeScreen from './screens/WelcomeScreen';
import AppStackAdminNavigator from './navigators/AppStackAdminNavigator';
import { Calculator } from './screens';

// Create a Drawer Navigator
const Drawer = createDrawerNavigator();

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  const onAuthStateChanged = async user => {
    setCurrentUser(user);
    setIsLoading(false);
  };

  if (isLoading) {
    return null; 
  }

  const isAdminUser = currentUser && currentUser.email === 'xldivin@gmail.com';

  return (
    <NavigationContainer>
      {currentUser ? ( 
        isAdminUser ? ( 
        <AppStackAdminNavigator/>
        ) : (
          <Drawer.Navigator initialRouteName="Home">
            <Drawer.Screen name="Home" component={WelcomeScreen} />
            <Drawer.Screen name="PlayQuiz" component={AppStackUserNavigator} />
            <Drawer.Screen name="Calculator" component={Calculator} />
          </Drawer.Navigator>
        )
      ) : (
        <AuthStackNavigator />
      )}
    </NavigationContainer>
  );
};

export default App;

