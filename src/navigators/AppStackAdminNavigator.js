import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {
  AddQuestionScreen,
  CreateQuizScreen,
  HomeScreen,
  ManageQuiz,
  PlayQuizScreen,
  UpdateQuestionScreen,
} from '../screens';
import ManageQuestions from '../screens/ManageQuestions';

const Stack = createStackNavigator();

const AppStackAdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ManageQuiz" component={ManageQuiz} />
      <Stack.Screen name="ManageQuestions" component={ManageQuestions} />
      <Stack.Screen name="CreateQuizScreen" component={CreateQuizScreen} />
      <Stack.Screen name="UpdateQuestionScreen" component={UpdateQuestionScreen} />
      <Stack.Screen name="AddQuestionScreen" component={AddQuestionScreen} />
    </Stack.Navigator>
  );
};

export default AppStackAdminNavigator;
