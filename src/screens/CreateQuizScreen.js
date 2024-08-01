import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, ToastAndroid } from 'react-native';
import { COLORS } from '../constants/theme';
import FormInput from '../components/shared/FormInput';
import FormButton from '../components/shared/FormButton';
import { createQuiz } from '../utils/database';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateQuizScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [offlineData, setOfflineData] = useState([]);

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const data = await AsyncStorage.getItem('offlineData');
        if (data !== null) {
          setOfflineData(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error fetching offline data:', error);
      }
    };
    fetchOfflineData();

    // Check network status
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncOfflineData();
      }
    });

    return () => unsubscribe();
  }, []);

  const syncOfflineData = async () => {
    if (offlineData.length > 0) {
      for (const item of offlineData) {
        const { currentQuizId, title, description } = item;
        await createQuiz(currentQuizId, title, description);
      }
      // Clear offline data after syncing
      setOfflineData([]);
      await AsyncStorage.removeItem('offlineData');
    }
  };

  const handleQuizSave = async () => {
    const currentQuizId = Math.floor(100000 + Math.random() * 9000).toString();
    // Save to AsyncStorage if offline
    if (!(await NetInfo.isConnected)) {
      const data = { currentQuizId, title, description };
      setOfflineData([...offlineData, data]);
      await AsyncStorage.setItem('offlineData', JSON.stringify([...offlineData, data]));
    } else {
      // Save directly to database if online
      await createQuiz(currentQuizId, title, description);
    }

    // Navigate to Add Question screen
    navigation.navigate('AddQuestionScreen', {
      currentQuizId: currentQuizId,
      currentQuisTitle: title,
    });

    // Reset
    setTitle('');
    setDescription('');
    ToastAndroid.show('Quiz Saved', ToastAndroid.SHORT);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 20,
      }}>
      <Text
        style={{
          fontSize: 20,
          textAlign: 'center',
          marginVertical: 20,
          fontWeight: 'bold',
          color: COLORS.black,
        }}>
        Create Quiz
      </Text>

      <FormInput
        labelText="Title"
        placeholderText="enter quiz title"
        onChangeText={val => setTitle(val)}
        value={title}
      />
      <FormInput
        labelText="Description"
        placeholderText="enter quiz description"
        onChangeText={val => setDescription(val)}
        value={description}
      />

      <FormButton labelText="Save Quiz" handleOnPress={handleQuizSave} />

    </SafeAreaView>
  );
};

export default CreateQuizScreen;
