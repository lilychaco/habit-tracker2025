import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ScrollView 
} from 'react-native';
import { useHabitStore } from '@/store/habitStore';
import { NotificationService } from '@/services/notifications';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const { habit, reminderTime, setReminderTime } = useHabitStore();
  const [tempReminderTime, setTempReminderTime] = useState(reminderTime);

  const handleSaveSettings = async () => {
    try {
      setReminderTime(tempReminderTime);
      
      if (habit) {
        await NotificationService.scheduleHabitReminder(tempReminderTime, habit.title);
        Alert.alert('Success', 'Settings saved and reminder updated!');
      }
      
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleCancelNotifications = async () => {
    try {
      await NotificationService.cancelAllNotifications();
      Alert.alert('Success', 'All reminders cancelled');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel reminders');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
        }}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ fontSize: 16, color: '#007AFF' }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Settings</Text>
          <TouchableOpacity onPress={handleSaveSettings}>
            <Text style={{ fontSize: 16, color: '#007AFF', fontWeight: 'bold' }}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {/* Reminder Settings */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
              Daily Reminder
            </Text>
            
            <View style={{ marginBottom: 15 }}>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                Reminder Time (24-hour format)
              </Text>
              <TextInput
                value={tempReminderTime}
                onChangeText={setTempReminderTime}
                placeholder="09:00"
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                }}
              />
              <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                Format: HH:MM (e.g., 09:00, 18:30)
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleCancelNotifications}
              style={{
                backgroundColor: '#FF3B30',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                Cancel All Reminders
              </Text>
            </TouchableOpacity>
          </View>

          {/* About Section */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
              About
            </Text>
            <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
              Habit Tracker helps you build and maintain daily habits. 
              Track your progress with a beautiful hand-drawn calendar interface.
              {'\n\n'}
              • Tap calendar days to mark as complete
              • Swipe left/right to navigate months
              • Share your progress with friends
              • Set daily reminders to stay consistent
            </Text>
          </View>

          {/* Current Habit Info */}
          {habit && (
            <View style={{ marginBottom: 30 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
                Current Habit
              </Text>
              <View style={{
                backgroundColor: '#f8f8f8',
                padding: 15,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: habit.color,
              }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                  {habit.title}
                </Text>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                  Created: {new Date(habit.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};