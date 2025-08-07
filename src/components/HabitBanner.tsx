import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Svg, Path, Text as SvgText } from 'react-native-svg';
import { useHabitStore } from '@/store/habitStore';

export const HabitBanner: React.FC = () => {
  const { habit, stats, updateHabitTitle } = useHabitStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(habit?.title || '');

  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle !== habit?.title) {
      await updateHabitTitle(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(habit?.title || '');
    setIsEditing(false);
  };

  if (!habit) {
    return null;
  }

  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      {/* Hand-drawn banner */}
      <Svg width="320" height="80" viewBox="0 0 320 80">
        {/* Banner ribbon */}
        <Path
          d="M10,20 Q15,15 25,18 L295,15 Q305,18 300,28 L298,50 Q295,60 285,58 L25,62 Q15,60 18,50 Z"
          stroke="#333"
          strokeWidth="3"
          fill={habit.color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Banner ends */}
        <Path
          d="M10,20 L5,35 L15,45 L18,30"
          stroke="#333"
          strokeWidth="2"
          fill={habit.color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M300,28 L315,35 L305,45 L298,30"
          stroke="#333"
          strokeWidth="2"
          fill={habit.color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Decorative stars */}
        <SvgText
          x="25"
          y="15"
          fontSize="12"
          fill="#333"
        >
          ★
        </SvgText>
        <SvgText
          x="295"
          y="15"
          fontSize="12"
          fill="#333"
        >
          ★
        </SvgText>
      </Svg>

      {/* Title input/display */}
      <View style={{ position: 'absolute', top: 35, alignItems: 'center' }}>
        {isEditing ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#333',
                backgroundColor: 'white',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                minWidth: 150,
                textAlign: 'center',
              }}
              onBlur={handleSaveTitle}
              onSubmitEditing={handleSaveTitle}
              autoFocus
            />
            <TouchableOpacity onPress={handleCancelEdit} style={{ marginLeft: 8 }}>
              <Text style={{ color: '#666', fontSize: 12 }}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            }}>
              {habit.title}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-around', width: '100%' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: habit.color }}>
            {stats.totalDone}
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Total Done</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: habit.color }}>
            {stats.currentStreak}
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>Current Streak</Text>
        </View>
      </View>
    </View>
  );
};