import React, { useEffect, useRef, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  Text,
  Alert,
  StatusBar
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HabitBanner } from './src/components/HabitBanner';
import { HabitGrid } from './src/components/HabitGrid';
import { MonthNavigation } from './src/components/MonthNavigation';
import { SettingsModal } from './src/components/SettingsModal';
import { useHabitStore } from './src/store/habitStore';
import { SharingService } from './src/services/sharing';
import { NotificationService } from './src/services/notifications';

export default function App() {
  const { 
    habit, 
    toggleDay, 
    loadHabit, 
    createHabit,
    reminderTime 
  } = useHabitStore();
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#4CAF50');
  
  const viewRef = useRef(null);

  const colors = [
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', 
    '#F44336', '#00BCD4', '#795548', '#607D8B'
  ];

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await loadHabit();
    const currentHabit = useHabitStore.getState().habit;
    
    if (!currentHabit) {
      setShowOnboarding(true);
    } else {
      // Schedule notification for existing habit
      await NotificationService.scheduleHabitReminder(reminderTime, currentHabit.title);
    }
  };

  const handleCreateHabit = async () => {
    if (!newHabitTitle.trim()) {
      Alert.alert('Error', 'Please enter a habit title');
      return;
    }
    
    await createHabit(newHabitTitle.trim(), selectedColor);
    setShowOnboarding(false);
    setNewHabitTitle('');
    
    // Schedule initial notification
    await NotificationService.scheduleHabitReminder(reminderTime, newHabitTitle.trim());
  };

  const handleDayPress = async (date: string) => {
    await toggleDay(date);
  };

  const handleShare = async () => {
    if (viewRef.current && habit) {
      await SharingService.shareScreenshot(viewRef.current, habit.title);
    }
  };

  if (showOnboarding) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.onboardingContainer}>
          <Text style={styles.onboardingTitle}>Create Your Habit</Text>
          
          <TextInput
            value={newHabitTitle}
            onChangeText={setNewHabitTitle}
            placeholder="Enter habit title (e.g., 'Drink Water')"
            style={styles.habitInput}
          />
          
          <Text style={styles.colorLabel}>Choose a color:</Text>
          <View style={styles.colorPicker}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
          
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: selectedColor }]}
            onPress={handleCreateHabit}
          >
            <Text style={styles.createButtonText}>Create Habit</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header with settings button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setShowSettings(true)}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        </View>

        <View ref={viewRef} style={styles.content}>
          {/* Habit Banner */}
          <HabitBanner />
          
          {/* Month Navigation */}
          <MonthNavigation />
          
          {/* Habit Grid */}
          <HabitGrid onDayPress={handleDayPress} />
        </View>

        {/* Settings Modal */}
        <SettingsModal 
          visible={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  shareButton: {
    padding: 8,
  },
  shareIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  onboardingContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f8f8f8',
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  habitInput: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 30,
    backgroundColor: 'white',
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  colorOption: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#333',
    borderWidth: 3,
  },
  createButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});