import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Svg, Text as SvgText, Path } from 'react-native-svg';
import { useHabitStore } from '@/store/habitStore';
import { getMonthName } from '@/utils/dateUtils';

export const MonthNavigation: React.FC = () => {
  const { currentYear, currentMonth, navigateMonth } = useHabitStore();

  const handleSwipe = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { velocityX } = event.nativeEvent;
      
      if (velocityX > 500) {
        // Swipe right - go to previous month
        navigateMonth('prev');
      } else if (velocityX < -500) {
        // Swipe left - go to next month
        navigateMonth('next');
      }
    }
  };

  return (
    <PanGestureHandler onHandlerStateChange={handleSwipe}>
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
      }}>
        {/* Previous month button */}
        <TouchableOpacity onPress={() => navigateMonth('prev')}>
          <Svg width="40" height="40" viewBox="0 0 40 40">
            <Path
              d="M25,10 L15,20 L25,30"
              stroke="#333"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Month and year display */}
        <View style={{ alignItems: 'center' }}>
          <Svg width="200" height="50" viewBox="0 0 200 50">
            {/* Hand-drawn underline */}
            <Path
              d="M20,35 Q100,30 180,35"
              stroke="#333"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            {/* Month text */}
            <SvgText
              x="100"
              y="25"
              fontSize="20"
              fontWeight="bold"
              textAnchor="middle"
              fill="#333"
            >
              {getMonthName(currentMonth)} {currentYear}
            </SvgText>
          </Svg>
        </View>

        {/* Next month button */}
        <TouchableOpacity onPress={() => navigateMonth('next')}>
          <Svg width="40" height="40" viewBox="0 0 40 40">
            <Path
              d="M15,10 L25,20 L15,30"
              stroke="#333"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </PanGestureHandler>
  );
};