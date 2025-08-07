import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Svg, Path, Circle, Text } from 'react-native-svg';
import { useHabitStore } from '@/store/habitStore';
import { getDaysInMonth, getFirstDayOfMonth, formatDate } from '@/utils/dateUtils';

interface HabitGridProps {
  onDayPress: (date: string) => void;
}

export const HabitGrid: React.FC<HabitGridProps> = ({ onDayPress }) => {
  const { currentYear, currentMonth, logs, habit } = useHabitStore();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const getDayStatus = (day: number): 'done' | 'none' => {
    const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const log = logs.find(l => l.date === date);
    return log?.status || 'none';
  };

  const handleDayPress = (day: number) => {
    const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDayPress(date);
  };

  const renderDay = (day: number, index: number) => {
    const status = getDayStatus(day);
    const fillColor = status === 'done' ? (habit?.color || '#4CAF50') : 'transparent';
    
    return (
      <TouchableOpacity
        key={`day-${day}`}
        onPress={() => handleDayPress(day)}
        style={{
          width: 40,
          height: 40,
          margin: 2,
        }}
      >
        <Svg width="40" height="40" viewBox="0 0 40 40">
          {/* Hand-drawn style square */}
          <Path
            d="M3,5 L37,3 L38,37 L2,35 Z"
            stroke="#333"
            strokeWidth="2"
            fill={fillColor}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Day number */}
          <Text
            x="20"
            y="25"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            fill={status === 'done' ? 'white' : '#333'}
          >
            {day}
          </Text>
          {/* Small decorative star for completed days */}
          {status === 'done' && (
            <Text
              x="32"
              y="12"
              fontSize="8"
              textAnchor="middle"
              fill="white"
            >
              ★
            </Text>
          )}
        </Svg>
      </TouchableOpacity>
    );
  };

  const renderWeekDayHeaders = () => {
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
        {weekDays.map((day, index) => (
          <View key={index} style={{ width: 40, alignItems: 'center' }}>
            <Svg width="40" height="20" viewBox="0 0 40 20">
              <Text
                x="20"
                y="15"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fill="#666"
              >
                {day}
              </Text>
            </Svg>
          </View>
        ))}
      </View>
    );
  };

  const renderGrid = () => {
    const days = [];
    const totalCells = 42; // 6 rows x 7 days
    
    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={{ width: 40, height: 40, margin: 2 }} />
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(renderDay(day, firstDay + day - 1));
    }
    
    // Fill remaining cells to complete the grid
    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(
        <View key={`empty-end-${i}`} style={{ width: 40, height: 40, margin: 2 }} />
      );
    }
    
    return days;
  };

  return (
    <View style={{ padding: 20 }}>
      {renderWeekDayHeaders()}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
        }}
      >
        {renderGrid()}
      </View>
    </View>
  );
};