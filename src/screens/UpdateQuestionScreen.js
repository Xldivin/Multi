import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  ToastAndroid,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../constants/theme';
import FormInput from '../components/shared/FormInput';
import FormButton from '../components/shared/FormButton';
import { updateQuestion } from '../utils/database';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import NentInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';

const UpdateQuestionScreen = ({ navigation, route }) => {

  console.log("Route params:", route.params);
  const { currentQuizId, title, questionData } = route.params;
  console.log("Question data:", questionData);

  const [question, setQuestion] = useState(questionData.question);
  const [imageUri, setImageUri] = useState(questionData.imageUrl);
  const [correctAnswer, setCorrectAnswer] = useState(questionData.correct_answer);
  const [optionTwo, setOptionTwo] = useState(questionData.incorrect_answers[0]);
  const [optionThree, setOptionThree] = useState(questionData.incorrect_answers[1]);
  const [optionFour, setOptionFour] = useState(questionData.incorrect_answers[2]);
  const [offlineData, setOfflineData] = useState([]);

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const data = await AsyncStorage.getItem('offlineQuestionUpdates');
        if (data !== null) {
          setOfflineData(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error fetching offline question updates:', error);
      }
    };
    fetchOfflineData();

    const unsubscribe = NentInfo.addEventListener(state => {
      if (state.isConnected) {
        syncOfflineData();
      }
    });
    return () => unsubscribe();
  }, []);

  const syncOfflineData = async () => {
    if (offlineData.length > 0) {
      for (const item of offlineData) {
        await handleOfflineQuestionUpdate(item);
      }
      setOfflineData([]);
      await AsyncStorage.removeItem('offlineQuestionUpdates');
    }
  };

  const handleOfflineQuestionUpdate = async (offlineQuestionData) => {
    const { currentQuizId, questionId, updatedQuestionData } = offlineQuestionData;
    try {
      await updateQuestion(currentQuizId, questionId, updatedQuestionData);
      ToastAndroid.show('Question updated offline', ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error updating question offline:", error);
    }
  };

  const handleQuestionUpdate = async () => {
    if (
      question === '' ||
      correctAnswer === '' ||
      optionTwo === '' ||
      optionThree === '' ||
      optionFour === ''
    ) {
      return;
    }

    let imageUrl = imageUri;
    if (imageUri !== questionData.imageUrl) {
      const reference = storage().ref(
        `/images/questions/${currentQuizId}_${questionData.id}`,
      );
      await reference.putFile(imageUri).then(() => {
        console.log('Image Uploaded');
      });
      imageUrl = await reference.getDownloadURL();
    }

    // Update question in db
    if (!(await NentInfo.isConnected)) {
      const offlineDataItem = {
        currentQuizId: currentQuizId,
        questionId: questionData.id,
        updatedQuestionData: {
          question: question,
          correct_answer: correctAnswer,
          incorrect_answers: [optionTwo, optionThree, optionFour],
          imageUrl: imageUrl,
        }
      };
      setOfflineData([...offlineData, offlineDataItem]);
      await AsyncStorage.setItem('offlineQuestionUpdates', JSON.stringify([...offlineData, offlineDataItem]));
    } else {
      await updateQuestion(currentQuizId, questionData.id, {
        question: question,
        correct_answer: correctAnswer,
        incorrect_answers: [optionTwo, optionThree, optionFour],
        imageUrl: imageUrl,
      });
      ToastAndroid.show('Question updated', ToastAndroid.SHORT);
    }

    // Navigate back
    navigation.goBack();
  };

  const selectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
      },
      ({ assets }) => {
        if (assets && assets.length > 0) {
          setImageUri(assets[0].uri);
        }
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
        }}>
        <View style={{ padding: 20 }}>
          <Text
            style={{ fontSize: 20, textAlign: 'center', color: COLORS.black }}>
            Update Question
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>
            For {title}
          </Text>

          <FormInput
            labelText="Question"
            placeholderText="enter question"
            onChangeText={val => setQuestion(val)}
            value={question}
          />

          {/* Image upload */}

          {imageUri == '' ? (
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                padding: 28,
                backgroundColor: COLORS.primary + '20',
              }}
              onPress={selectImage}>
              <Text style={{ opacity: 0.5, color: COLORS.primary }}>
                + add image
              </Text>
            </TouchableOpacity>
          ) : (
            <Image
              source={{
                uri: imageUri,
              }}
              resizeMode={'cover'}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 5,
              }}
            />
          )}

          {/* Options */}
          <View style={{ marginTop: 30 }}>
            <FormInput
              labelText="Correct Answer"
              onChangeText={val => setCorrectAnswer(val)}
              value={correctAnswer}
            />
            <FormInput
              labelText="Option 2"
              onChangeText={val => setOptionTwo(val)}
              value={optionTwo}
            />
            <FormInput
              labelText="Option 3"
              onChangeText={val => setOptionThree(val)}
              value={optionThree}
            />
            <FormInput
              labelText="Option 4"
              onChangeText={val => setOptionFour(val)}
              value={optionFour}
            />
          </View>
          <FormButton
            labelText="Update Question"
            handleOnPress={handleQuestionUpdate}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UpdateQuestionScreen;
