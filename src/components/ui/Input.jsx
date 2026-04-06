import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity 
} from 'react-native';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

export default function Input({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  icon,
  containerStyle,
  autoCapitalize = "none",
  autoCorrect = false,
  keyboardType = "default",
  returnKeyType = "done",
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const labelPosition = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(labelPosition, {
      toValue: isFocused || value ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        error && styles.inputError,
      ]}>
        {icon && (
          <View style={styles.iconWrapper}>
            <Ionicons 
              name={icon} 
              size={20} 
              color={isFocused ? theme.colors.primary : theme.colors.textTertiary} 
            />
          </View>
        )}

        <Animated.Text
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: icon ? 56 : 16,
            top: labelPosition.interpolate({
              inputRange: [0, 1],
              outputRange: [18, 8],
            }),
            fontSize: labelPosition.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 11],
            }),
            color: error 
              ? theme.colors.riskHigh 
              : labelPosition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [theme.colors.textTertiary, theme.colors.primary],
                }),
          }}
        >
          {label}
        </Animated.Text>

        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            (isFocused || value) && styles.inputFloated,
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoFocus={false}
          spellCheck={false}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          blurOnSubmit={true}
          placeholder=""
          placeholderTextColor="transparent"
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgSurface,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    height: 60,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: theme.colors.riskHigh,
    backgroundColor: '#FFF5F5',
  },
  iconWrapper: {
    marginRight: 8,
    width: 24,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.textPrimary,
    paddingTop: 12,
    paddingBottom: 4,
  },
  inputWithIcon: {
    marginLeft: 4,
  },
  inputFloated: {
    paddingTop: 20,
    paddingBottom: 4,
  },
  eyeIcon: {
    marginLeft: 8,
  },
  errorText: {
    color: theme.colors.riskHigh,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
