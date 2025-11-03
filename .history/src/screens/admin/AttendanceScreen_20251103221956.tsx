import React from 'react';
import { View, StyleSheet } from 'react-native';
import AList from './as/AList';

export const AsScreen: React.FC<{ navigation: any }> = () => {
  return (
    <View style={styles.container}>
      <AList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AsScreen;