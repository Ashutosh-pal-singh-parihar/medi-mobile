import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Avatar from '../../components/ui/Avatar';
import { theme } from '../../styles/theme';
import useAuthStore from '../../store/auth.store';
import { authService } from '../../features/auth/services/auth.service';
import { ambulanceService } from '../../features/ambulance/services/ambulance.service';
import { useLanguage } from '../../hooks/useLanguage';


export default function AmbulanceProfileScreen() {
  const router = useRouter();
  const { t, language, toggleLanguage } = useLanguage();
  const { ambulanceProfile, setAmbulanceProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    full_name: ambulanceProfile?.full_name || '',
    phone: ambulanceProfile?.phone || '',
    whatsapp_number: ambulanceProfile?.whatsapp_number || '',
    vehicle_number: ambulanceProfile?.vehicle_number || '',
    vehicle_type: ambulanceProfile?.vehicle_type || 'Basic',
  });

  const handleLogout = () => {
    Alert.alert(
      t('log_out'),
      t('log_out_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('log_out'),
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
            } catch (e) {
              console.log('Logout error:', e);
              router.replace('/(auth)/splash');
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!editData.full_name || !editData.phone || !editData.vehicle_number) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const updatedProfile = await ambulanceService.createProfile({
        user_id: useAuthStore.getState().user.id,
        ...editData
      });
      setAmbulanceProfile(updatedProfile);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { title: 'Operator Info', items: [
      { icon: 'person-outline', label: 'Full Name', value: ambulanceProfile?.full_name || 'N/A' },
      { icon: 'call-outline', label: 'Phone', value: ambulanceProfile?.phone || 'N/A' },
      { icon: 'logo-whatsapp', label: 'WhatsApp', value: ambulanceProfile?.whatsapp_number || 'N/A' },
    ]},
    { title: 'Vehicle Details', items: [
      { icon: 'car-outline', label: 'Vehicle Number', value: ambulanceProfile?.vehicle_number || 'N/A' },
      { icon: 'medical-outline', label: 'Type', value: ambulanceProfile?.vehicle_type || 'Basic' },
    ]},
  ];

  return (
    <ScreenWrapper bg={theme.colors.bgBase}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
             <MaterialCommunityIcons name="ambulance" size={60} color={theme.colors.riskHigh} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{ambulanceProfile?.full_name || 'Operator'}</Text>
            <Text style={styles.email}>{useAuthStore.getState().user?.email || 'operator@email.com'}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={() => setEditModalVisible(true)}
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.editBtnText}>{t('edit_profile')}</Text>
          </TouchableOpacity>
        </View>

        {/* Language Toggle */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionCard} onPress={toggleLanguage}>
             <View style={styles.quickActionIconBg}>
                <Ionicons name="language" size={20} color={theme.colors.riskHigh} />
             </View>
             <View>
               <Text style={styles.quickActionLabel}>{t('language')}</Text>
               <Text style={styles.quickActionValue}>{language === 'hi' ? 'Hindi / हिंदी' : 'English'}</Text>
             </View>
             <View style={[styles.toggleTrack, language === 'hi' && { backgroundColor: '#FEE2E2' }]}>
               <View style={[styles.toggleDot, language === 'hi' && styles.toggleDotActive]} />
             </View>
          </TouchableOpacity>
        </View>

        {/* Info Sections */}
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.itemContainer}>
              {section.items.map((item, i) => (
                <View key={i} style={[styles.item, i === section.items.length - 1 && styles.noBorder]}>
                  <View style={styles.itemLeft}>
                    <Ionicons name={item.icon} size={20} color={theme.colors.riskHigh} />
                    <Text style={styles.labelText}>{item.label}</Text>
                  </View>
                  <Text style={styles.itemValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out */}
        <View style={styles.section}>
          <View style={styles.itemContainer}>
            <TouchableOpacity style={[styles.item, styles.noBorder]} onPress={handleLogout}>
              <View style={styles.itemLeft}>
                <Ionicons name="log-out-outline" size={20} color={theme.colors.riskHigh} />
                <Text style={[styles.labelText, { color: theme.colors.riskHigh }]}>{t('sign_out')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.version}>MediTriage Operator v1.0.0</Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('edit_profile')}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContent}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput 
                style={styles.input}
                value={editData.full_name}
                onChangeText={(val) => setEditData(prev => ({ ...prev, full_name: val }))}
              />

              <Text style={styles.inputLabel}>Contact Phone</Text>
              <TextInput 
                style={styles.input}
                value={editData.phone}
                onChangeText={(val) => setEditData(prev => ({ ...prev, phone: val }))}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>WhatsApp Number</Text>
              <TextInput 
                style={styles.input}
                value={editData.whatsapp_number}
                onChangeText={(val) => setEditData(prev => ({ ...prev, whatsapp_number: val }))}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Vehicle Number</Text>
              <TextInput 
                style={styles.input}
                value={editData.vehicle_number}
                onChangeText={(val) => setEditData(prev => ({ ...prev, vehicle_number: val }))}
                autoCapitalize="characters"
              />

              <TouchableOpacity 
                style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>{t('edit_profile')}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 60 },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F7F8FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerInfo: { alignItems: 'center', marginTop: 16 },
  name: { ...theme.typography.h1, color: theme.colors.textPrimary, fontSize: 24 },
  email: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 4 },
  editBtn: {
    marginTop: 20,
    backgroundColor: theme.colors.riskHigh,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    ...theme.shadows.sm,
  },
  editBtnText: { ...theme.typography.label, color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  quickActionsContainer: { paddingHorizontal: 20, marginTop: 24 },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...theme.shadows.sm,
  },
  quickActionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { ...theme.typography.caption, color: theme.colors.textSecondary, fontSize: 12 },
  quickActionValue: { ...theme.typography.label, color: theme.colors.textPrimary, fontWeight: '700', fontSize: 16 },
  toggleTrack: { marginLeft: 'auto', width: 48, height: 24, borderRadius: 12, backgroundColor: '#E2E8F0', padding: 2, justifyContent: 'center' },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF', ...theme.shadows.sm },
  toggleDotActive: { alignSelf: 'flex-end', backgroundColor: theme.colors.riskHigh },
  section: { paddingHorizontal: 20, marginTop: 32 },
  sectionTitle: { ...theme.typography.label, color: theme.colors.textSecondary, marginBottom: 12, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
  itemContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadows.sm },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  labelText: { ...theme.typography.body, color: theme.colors.textPrimary, fontWeight: '500', fontSize: 15 },
  itemValue: { ...theme.typography.body, color: theme.colors.textSecondary, fontSize: 14 },
  noBorder: { borderBottomWidth: 0 },
  version: { ...theme.typography.caption, color: theme.colors.textTertiary, textAlign: 'center', marginTop: 48 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { ...theme.typography.h2, color: theme.colors.textPrimary },
  formContent: { marginBottom: Platform.OS === 'ios' ? 40 : 20 },
  inputLabel: { ...theme.typography.label, color: theme.colors.textSecondary, marginBottom: 8, marginTop: 16, fontSize: 13 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, padding: 14, ...theme.typography.body, fontSize: 16 },
  saveBtn: { backgroundColor: theme.colors.riskHigh, paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 32, ...theme.shadows.md },
  saveBtnText: { ...theme.typography.label, color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
