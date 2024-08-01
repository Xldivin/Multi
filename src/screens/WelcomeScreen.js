import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Linking } from 'react-native';
import { ToastAndroid } from 'react-native';
import { signOut } from '../utils/auth';
import { COLORS } from '../constants/theme';
import NentInfo from "@react-native-community/netinfo";
import RNRestart from "react-native-restart";
import Geolocation from '@react-native-community/geolocation';

const WelcomeScreen = () => {

    const [location, setLocation] = useState(null);

    const Permission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Multitool App Location Permission',
                    message:
                        'Multitool App needs access to your Location ',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('You can use the Location');
                getCurrentLocation();
            } else {
                console.log('Location permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    useEffect(() => {
        const unSubscribe = NentInfo.addEventListener((state) => {
            if (state.isConnected === false) {
                Alert.alert("No internet", "Please Reconnect", [
                    {
                        text: "Reload App",
                        onPress: () => RNRestart.restart(),
                    },
                ]);
            } else if (state.isConnected === true) {
                ToastAndroid.show('There is Internet', ToastAndroid.SHORT);
            }
        });

        return () => unSubscribe();
    }, []);


    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords
                setLocation({ latitude, longitude })
                console.log(latitude, longitude)
            },
            error => alert('Error', error.message),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }

    const openMaps = () => {
        const { latitude, longitude } = location
        if (latitude, longitude) {
            const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            Linking.openURL(url);
        } else {
            alert('location not available')
        }
    }

    return (
        <>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: COLORS.white,
                    elevation: 4,
                    paddingHorizontal: 20,
                }}>
                <Text style={{ fontSize: 20, color: COLORS.black }}>Welcome Page</Text>
                <Text
                    style={{
                        fontSize: 20,
                        padding: 10,
                        color: COLORS.error,
                    }}
                    onPress={signOut}>
                    Logout
                </Text>
            </View>
            <View style={styles.container}>
                <Text style={styles.welcomeText}>Welcome!</Text>
                {location ? (
                    <TouchableOpacity onPress={openMaps} style={styles.button}>
                        <Text style={styles.buttonText}>Open Maps</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={Permission} style={styles.button}>
                        <Text style={styles.buttonText}>Get Location</Text>
                    </TouchableOpacity>
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: 'blue',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default WelcomeScreen;
