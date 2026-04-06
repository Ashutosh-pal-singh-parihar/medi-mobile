import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../config/supabase';
import { ambulanceService } from '../../features/ambulance/services/ambulance.service';
import { theme } from '../../styles/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '../../hooks/useLanguage';

const { width, height } = Dimensions.get('window');

export default function AmbulanceMap() {
  const router = useRouter();
  const { t } = useLanguage();
  const { caseId } = useLocalSearchParams();
  
  const [currentCase, setCurrentCase] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [status, setStatus] = useState('accepted');
  const [distance, setDistance] = useState(0);
  const [eta, setEta] = useState(0);
  
  const mapRef = useRef(null);

  useEffect(() => {
    fetchCase();
    startTracking();
  }, [caseId]);

  const fetchCase = async () => {
    const { data, error } = await supabase
      .from('ambulance_cases')
      .select('*, triage_cases(detected_symptoms, ai_summary, risk_level, patient_profiles(age, gender))')
      .eq('id', caseId)
      .single();
    
    if (data) {
      setCurrentCase(data);
      setStatus(data.status);
    }
  };

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    // Track every 10 seconds
    const interval = setInterval(async () => {
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      
      // Update DB
      if (currentCase) {
        await ambulanceService.updateLocation(currentCase.ambulance_id, location.coords.latitude, location.coords.longitude);
        
        // Simple distance calculation
        if (currentCase.patient_lat && currentCase.patient_lng) {
          const d = calculateDistance(
            location.coords.latitude, location.coords.longitude,
            currentCase.patient_lat, currentCase.patient_lng
          );
          setDistance(d);
          setEta(Math.ceil(d * 4)); // 4 mins per km
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleStatusChange = async () => {
    let nextStatus = '';
    if (status === 'accepted') nextStatus = 'arrived';
    else if (status === 'arrived') nextStatus = 'transporting';
    else if (status === 'transporting') {
      Alert.alert(
        'Confirm Arrival',
        'Confirm patient delivered to hospital?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Confirm', onPress: async () => {
            await ambulanceService.updateCaseStatus(caseId, 'completed');
            router.replace('/(ambulance)/dashboard');
          }}
        ]
      );
      return;
    }

    if (nextStatus) {
      await ambulanceService.updateCaseStatus(caseId, nextStatus);
      setStatus(nextStatus);
    }
  };

  if (!currentLocation || !currentCase) return <View style={styles.loading}><Text>Loading Map...</Text></View>;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Ambulance Marker */}
        <Marker coordinate={currentLocation}>
          <View style={styles.ambulanceMarker}>
            <MaterialCommunityIcons name="ambulance" size={24} color="#FFFFFF" />
          </View>
        </Marker>

        {/* Patient Marker */}
        <Marker coordinate={{ latitude: currentCase.patient_lat, longitude: currentCase.patient_lng }}>
          <View style={styles.patientMarker}>
            <View style={styles.patientPulse} />
            <Ionicons name="person" size={24} color="#DC2626" />
          </View>
        </Marker>

        {/* Polyline */}
        <Polyline
          coordinates={[
            currentLocation,
            { latitude: currentCase.patient_lat, longitude: currentCase.patient_lng }
          ]}
          strokeColor="#DC2626"
          strokeWidth={4}
          lineDashPattern={[5, 5]}
        />
      </MapView>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        <View style={styles.patientLine}>
          <Text style={styles.patientName}>Patient #{caseId.slice(-4)}</Text>
          <Text style={styles.patientLabel}>
            {currentCase.triage_cases.patient_profiles.gender}, {currentCase.triage_cases.patient_profiles.age}y
          </Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{distance.toFixed(1)} km</Text>
          </View>
          <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: '#E2E8F0' }]}>
            <Text style={styles.statLabel}>ETA</Text>
            <Text style={styles.statValue}>{eta} mins</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.statusBtn, { backgroundColor: status === 'completed' ? '#22C55E' : '#DC2626' }]} 
          onPress={handleStatusChange}
        >
          <Text style={styles.statusBtnText}>
            {status === 'accepted' ? t('arrived_at_patient') : 
             status === 'arrived' ? t('patient_on_board') : 
             t('complete_ride')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: width,
    height: height,
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  ambulanceMarker: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  patientMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    ...theme.shadows.md,
  },
  patientLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  patientName: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  patientLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    ...theme.typography.h3,
    color: theme.colors.textPrimary,
  },
  statusBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnText: {
    ...theme.typography.h3,
    color: '#FFFFFF',
    fontSize: 16,
  },
});
