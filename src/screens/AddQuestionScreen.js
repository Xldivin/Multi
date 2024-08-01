import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  ToastAndroid,
  TouchableOpacity,
  Image,
} from 'react-native';
import {COLORS} from '../constants/theme';
import FormInput from '../components/shared/FormInput';
import FormButton from '../components/shared/FormButton';
import {createQuestion} from '../utils/database';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import NentInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddQuestionScreen = ({navigation, route}) => {
  const [currentQuizId, setCurrentQuizId] = useState(
    route.params.currentQuizId,
  );
  const [currentQuizTitle, setCurrentQuizTitle] = useState(
    route.params.currentQuizTitle,
  );

  const [question, setQuestion] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [optionTwo, setOptionTwo] = useState('');
  const [optionThree, setOptionThree] = useState('');
  const [optionFour, setOptionFour] = useState('');
  const [offlineData, setOfflineData] = useState([]);

  useEffect(() => {
    const fetchOfflineData = async () => {
      try {
        const data = await AsyncStorage.getItem('offlineQuestionData');
        if (data !== null) {
          setOfflineData(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error fetching offline question data:', error);
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
        await handleOfflineQuestionSave(item);
      }
      setOfflineData([]);
      await AsyncStorage.removeItem('offlineQuestionData');
    }
  };

  const handleOfflineQuestionSave = async (offlineQuestionData) => {
    const { question, correctAnswer, optionTwo, optionThree, optionFour, imageUri, currentQuizId } = offlineQuestionData;
    let currentQuestionId = Math.floor(100000 + Math.random() * 9000).toString();
    let imageUrl = '';

    if (imageUri) {
      const reference = storage().ref(`/images/questions/${currentQuizId}_${currentQuestionId}`);
      await reference.putFile(imageUri).then(() => {
        console.log('Image Uploaded');
      });
      imageUrl = await reference.getDownloadURL();
    }

    await createQuestion(currentQuizId, currentQuestionId, {
      question: question,
      correct_answer: correctAnswer,
      incorrect_answers: [optionTwo, optionThree, optionFour],
      imageUrl: imageUrl,
    });
    ToastAndroid.show('Question saved', ToastAndroid.SHORT);
  };

  const handleQuestionSave = async () => {
    if (
      question === '' ||
      correctAnswer === '' ||
      optionTwo === '' ||
      optionThree === '' ||
      optionFour === ''
    ) {
      return;
    }

    const currentQuestionId = Math.floor(100000 + Math.random() * 9000).toString();
    let imageUrl = '';

    if (imageUri !== '') {
      const reference = storage().ref(
        `/images/questions/${currentQuizId}_${currentQuestionId}`,
      );
      await reference.putFile(imageUri).then(() => {
        console.log('Image Uploaded');
      });
      imageUrl = await reference.getDownloadURL();
    }

    // Save to AsyncStorage if offline
    if (!(await NentInfo.isConnected)) {
      const data = {
        question: question,
        correctAnswer: correctAnswer,
        optionTwo: optionTwo,
        optionThree: optionThree,
        optionFour: optionFour,
        imageUri: imageUrl,
        currentQuizId: currentQuizId,
      };
      setOfflineData([...offlineData, data]);
      await AsyncStorage.setItem('offlineQuestionData', JSON.stringify([...offlineData, data]));
    } else {
      // Save directly to database if online
      await createQuestion(currentQuizId, currentQuestionId, {
        question: question,
        correct_answer: correctAnswer,
        incorrect_answers: [optionTwo, optionThree, optionFour],
        imageUrl: imageUrl,
      });
    }

    ToastAndroid.show('Question saved', ToastAndroid.SHORT);

    // Reset
    setQuestion('');
    setCorrectAnswer('');
    setOptionTwo('');
    setOptionThree('');
    setOptionFour('');
    setImageUri('');
  };

  const selectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
      },
      ({assets}) => {
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
        <View style={{padding: 20}}>
          <Text
            style={{fontSize: 20, textAlign: 'center', color: COLORS.black}}>
            Add Question
          </Text>
          <Text style={{textAlign: 'center', marginBottom: 20}}>
            For {currentQuizTitle}
          </Text>

          <FormInput
            labelText="Question"
            placeholderText="enter question"
            onChangeText={val => setQuestion(val)}
            value={question}
          />

          {/* Image upload */}

          {imageUri === '' ? (
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                padding: 28,
                backgroundColor: COLORS.primary + '20',
              }}
              onPress={selectImage}>
              <Text style={{opacity: 0.5, color: COLORS.primary}}>
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
          <View style={{marginTop: 30}}>
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
            labelText="Save Question"
            handleOnPress={handleQuestionSave}
          />
          <FormButton
            labelText="Done & Go Home"
            isPrimary={false}
            handleOnPress={() => {
              setCurrentQuizId('');
              navigation.navigate('ManageQuiz');
            }}
            style={{
              marginVertical: 20,
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddQuestionScreen;
