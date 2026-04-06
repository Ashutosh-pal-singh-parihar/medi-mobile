import React from 'react';
import { 
  Modal as RNModal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Dimensions,
  Platform
} from 'react-native';
import { theme } from '../../styles/theme';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Reusable Bottom Sheet Modal Component
 * Props:
 * - visible (boolean): Modal visibility
 * - onClose (function): Close handler
 * - title (string): Optional header title
 * - children: Content
 * - height (number): Fixed height (optional)
 * - showClose (boolean): Show close X
 */
export const Modal = ({
  visible,
  onClose,
  title,
  children,
  height,
  showClose = true,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.content, 
              height ? { height } : { maxHeight: SCREEN_HEIGHT * 0.8 },
              Platform.OS === 'ios' && styles.iosPadding
            ]}>
              {/* Drag Handle */}
              <View style={styles.handle} />

              {/* Header */}
              {(title || showClose) && (
                <View style={styles.header}>
                  {title && <Text style={styles.title}>{title}</Text>}
                  {showClose && (
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                      <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Body */}
              <View style={styles.body}>
                {children}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: theme.colors.bgSurface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    ...theme.shadows.lg,
  },
  iosPadding: {
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 16,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.bgSurface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    width: '100%',
  },
});
