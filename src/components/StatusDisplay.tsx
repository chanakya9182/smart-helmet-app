import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type HelmetStatus = 'safe' | 'alcohol' | 'accident' | 'disconnected';

interface StatusDisplayProps {
  status: HelmetStatus;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status }) => {
  let backgroundColor = '#ccc';
  let message = 'Disconnected';

  switch (status) {
    case 'safe':
      backgroundColor = '#4CAF50'; // Green
      message = 'Safe';
      break;
    case 'alcohol':
      backgroundColor = '#FFC107'; // Amber
      message = 'Alcohol Detected';
      break;
    case 'accident':
      backgroundColor = '#F44336'; // Red
      message = 'Accident Detected';
      break;
    case 'disconnected':
      backgroundColor = '#9E9E9E'; // Grey
      message = 'Disconnected';
      break;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    marginVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    width: '90%',
    alignSelf: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
