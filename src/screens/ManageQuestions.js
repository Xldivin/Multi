import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, FlatList} from 'react-native';
import { getQuizById, getQuestionsByQuizId, deleteQuestion } from '../utils/database';
import { COLORS } from '../constants/theme';
import FormButton from '../components/shared/FormButton';
import NentInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ManageQuestions = ({ route, navigation }) => {
    const { quizId } = route.params;
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [deletedQuestions, setDeletedQuestions] = useState([]);

    useEffect(() => {
        getQuizAndQuestionDetails();
    }, []);

    useEffect(() => {
        const unsubscribe = NentInfo.addEventListener(state => {
            if (state.isConnected) {
                syncDeletedQuestions();
            }
        });
        return () => unsubscribe();
    }, []);

    const getQuizAndQuestionDetails = async () => {
        // Get Quiz
        const currentQuiz = await getQuizById(quizId);
        setTitle(currentQuiz.data().title);

        // Get Questions for current quiz
        const questionsSnapshot = await getQuestionsByQuizId(quizId);
        const quizQuestions = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuestions(quizQuestions);
    };

    const handleUpdateQuestion = (questionId) => {
        const questionData = questions.find(question => question.id === questionId);
        navigation.navigate('UpdateQuestionScreen', { currentQuizId: quizId, title, questionData});
    };

    const handleDeleteQuestion = async (questionId) => {
        try {
            if (await NentInfo.isConnected) {
                await deleteQuestion(quizId, questionId);
            } else {
                setDeletedQuestions([...deletedQuestions, questionId]);
                await AsyncStorage.setItem('deletedQuestions', JSON.stringify([...deletedQuestions, questionId]));
            }
            setQuestions(prevQuestions => prevQuestions.filter(question => question.id !== questionId));
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    const syncDeletedQuestions = async () => {
        try {
            const deletedQuestionIds = await AsyncStorage.getItem('deletedQuestions');
            if (deletedQuestionIds) {
                const parsedDeletedQuestions = JSON.parse(deletedQuestionIds);
                for (const questionId of parsedDeletedQuestions) {
                    await deleteQuestion(quizId, questionId);
                }
                await AsyncStorage.removeItem('deletedQuestions');
                setDeletedQuestions([]);
            }
        } catch (error) {
            console.error("Error syncing deleted questions:", error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
            <StatusBar backgroundColor={COLORS.white} barStyle={'dark-content'} />
            <View style={{ flex: 1, padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>{title}</Text>
                {/* List of questions */}
                <FlatList
                    data={questions}
                    renderItem={({ item }) => (
                        <View style={{ marginBottom: 20, backgroundColor: COLORS.white, padding: 15, borderRadius: 10 }}>
                            <Text style={{ fontSize: 18 }}>{item.question}</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                <TouchableOpacity
                                    onPress={() => handleUpdateQuestion(item.id)}
                                    style={{ backgroundColor: COLORS.primary, padding: 10, borderRadius: 5 }}>
                                    <Text style={{ color: COLORS.white }}>Update</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDeleteQuestion(item.id)}
                                    style={{ backgroundColor: COLORS.error, padding: 10, borderRadius: 5 }}>
                                    <Text style={{ color: COLORS.white }}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
                <FormButton
                    labelText="Done & Go Home"
                    isPrimary={false}
                    handleOnPress={() => {
                        navigation.navigate('ManageQuiz');
                    }}
                    style={{
                        marginVertical: 20,
                    }}
                />
            </View>
        </SafeAreaView>
    );
};

export default ManageQuestions;
