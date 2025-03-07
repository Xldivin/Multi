import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import { signOut } from '../utils/auth';
import FormButton from '../components/shared/FormButton';
import { COLORS } from '../constants/theme';
import { getQuizzes } from '../utils/database';

const ManageQuiz = ({ navigation }) => {
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getAllQuizzes = async () => {
    setRefreshing(true);
    const quizzes = await getQuizzes();
    let tempQuizzes = quizzes.docs.map(quiz => ({ id: quiz.id, ...quiz.data() }));
    setAllQuizzes(tempQuizzes);
    setRefreshing(false);
  };

  useEffect(() => {
    getAllQuizzes();
  }, []);

  const handleManageQuiz = async (quizId) => {
    navigation.navigate('ManageQuestions', { quizId });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar backgroundColor={COLORS.white} barStyle={'dark-content'} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, elevation: 4, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 20, color: COLORS.black }}>Quiz App</Text>
        <Text style={{ fontSize: 20, padding: 10, color: COLORS.error }} onPress={signOut}>Logout</Text>
      </View>

      {/* Quiz list */}
      <FlatList
        data={allQuizzes}
        onRefresh={getAllQuizzes}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
        style={{ paddingVertical: 20 }}
        renderItem={({ item: quiz }) => (
          <TouchableOpacity
            onPress={() => handleManageQuiz(quiz.id)}
            style={{
              padding: 20,
              borderRadius: 5,
              marginVertical: 5,
              marginHorizontal: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: COLORS.white,
              elevation: 2,
            }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontSize: 18, color: COLORS.black }}>{quiz.title}</Text>
              {quiz.description !== '' && <Text style={{ opacity: 0.5 }}>{quiz.description}</Text>}
            </View>
            <Text style={{ color: COLORS.primary }}>ManageQuizzes</Text>
          </TouchableOpacity>
        )}
      />

      {/* Button */}
      <FormButton
        labelText="Create Quiz"
        style={{ position: 'absolute', bottom: 20, right: 20, borderRadius: 50, paddingHorizontal: 30 }}
        handleOnPress={() => navigation.navigate('CreateQuizScreen')}
      />
    </SafeAreaView>
  );
};

export default ManageQuiz;
