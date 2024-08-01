import { SafeAreaView, StyleSheet } from "react-native";
import CalculatorKeyBoard from "../components/calculatorScreen/CalculatorKeyBoard";
import React from "react";

export default function Calculator() {
  return (
    <SafeAreaView
      style={styles.container2}
    >
      <CalculatorKeyBoard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container2: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    backgroundColor: "white",
  },
});
