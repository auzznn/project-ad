import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { RoleTestPanel } from '@/components/RoleTestPanel';

export default function RoleTestScreen() {
  const [showTestPanel, setShowTestPanel] = useState(false);
  
  const backgroundColor = useThemeColor('background');
  const cardColor = useThemeColor('card');
  const textColor = useThemeColor('text');
  const primaryColor = useThemeColor('primary');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.content, { backgroundColor }]}>
        <View style={[styles.header, { backgroundColor: cardColor }]}>
          <Text style={[styles.title, { color: textColor }]}>
            Role-Based Access Control
          </Text>
          <Text style={[styles.subtitle, { color: textColor }]}>
            Test and verify role permissions
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardColor }]}>
          <Ionicons name="shield-checkmark" size={64} color={primaryColor} />
          <Text style={[styles.cardTitle, { color: textColor }]}>
            RBAC Testing
          </Text>
          <Text style={[styles.cardDescription, { color: textColor }]}>
            Test the role-based access control implementation by simulating different user roles and verifying permissions.
          </Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={() => setShowTestPanel(true)}
          >
            <Text style={styles.buttonText}>Open Test Panel</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoCard, { backgroundColor: cardColor }]}>
          <Text style={[styles.infoTitle, { color: textColor }]}>
            How it works:
          </Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            • The app uses role-based permissions to control access to features
          </Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            • Admin users have access to all features
          </Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            • Teachers can manage student records and use scanner
          </Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            • Students can view their own records and leaderboards
          </Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            • Parents can view their children's records
          </Text>
        </View>
      </View>

      <Modal
        visible={showTestPanel}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowTestPanel(false)}
      >
        <RoleTestPanel onClose={() => setShowTestPanel(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});