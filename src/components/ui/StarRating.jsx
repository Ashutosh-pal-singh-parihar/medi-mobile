import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

/**
 * Reusable StarRating Component
 * Props:
 * - rating (number): Current rating (1-5)
 * - onRate (function): Rate handler (optional)
 * - size (number): Star size
 * - color (string): Active star color
 * - interactive (boolean): Allow user input
 */
export const StarRating = ({
  rating = 0,
  onRate,
  size = 20,
  color = theme.colors.riskMedium,
  interactive = false,
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {stars.map((star) => {
        const isFull = star <= rating;
        const starIcon = isFull ? 'star' : 'star-outline';
        const starColor = isFull ? color : theme.colors.textTertiary;

        const StarContainer = interactive ? TouchableOpacity : View;

        return (
          <StarContainer
            key={star}
            onPress={() => interactive && onRate && onRate(star)}
            activeOpacity={0.7}
            style={styles.star}
          >
            <Ionicons name={starIcon} size={size} color={starColor} />
          </StarContainer>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 4,
  },
});
