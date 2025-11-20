import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionButtonProps {
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  completed?: boolean;
}

export default function ActionButton({
  title,
  icon,
  color,
  onPress,
  disabled = false,
  loading = false,
  completed = false
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: completed ? '#cccccc' : color },
        disabled && styles.disabledButton,
        completed && styles.completedButton
      ]}
      onPress={onPress}
      disabled={disabled || loading || completed}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          <Ionicons 
            name={icon as any} 
            size={24} 
            color="white" 
          />
          <View style={styles.textContainer}>
            <Text style={styles.buttonText}>{title}</Text>
            {completed && (
              <Text style={styles.completedText}>Already recorded</Text>
            )}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 12,
    minHeight: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.6,
  },
  completedButton: {
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.7,
  },
  textContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  completedText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    fontWeight: '500',
  },
});