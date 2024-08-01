import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {
  AddQuestionScreen,
  CreateQuizScreen,
  HomeScreen,
  ManageQuiz,
  PlayQuizScreen,
} from '../screens';
import ManageQuestions from '../screens/ManageQuestions';

const Stack = createStackNavigator();

const AppStackUserNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="PlayQuizScreen" component={PlayQuizScreen} />
    </Stack.Navigator>
  );
};

export default AppStackUserNavigator;
