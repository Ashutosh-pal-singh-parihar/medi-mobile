import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';

export const DoctorResponseCard = ({ action, appointment, doctorName, doctorSpec, hospitalName }) => {
  if (!action) return null;

  const isApproved = action.action_type === 'approved';
  const isAppointment = action.action_type === 'appointment_booked';

  // Brutalist sharp colors
  const borderColor = isApproved ? '#16A34A' : '#1A1AFF';
  const bgColor = isApproved ? '#F0FDF4' : '#F7F8FF';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <View style={[styles.card, { borderColor, backgroundColor: bgColor }]}>
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: borderColor }]}>
        <Ionicons
          name={isApproved ? 'checkmark-circle' : 'calendar'}
          size={16}
          color="#FFFFFF"
        />
        <Text style={styles.headerText}>
          {isApproved ? 'DOCTOR APPROVED YOUR TRIAGE' : 'APPOINTMENT SCHEDULED'}
        </Text>
      </View>

      {/* Doctor info */}
      <View style={styles.doctorRow}>
        <View style={[styles.doctorAvatar, { backgroundColor: borderColor }]}>
          <Text style={styles.doctorAvatarText}>
            {(doctorName || 'DR')[0].toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.doctorName}>Dr. {doctorName || 'Your Doctor'}</Text>
          <Text style={styles.doctorSpec}>{doctorSpec || 'General Physician'}</Text>
        </View>
      </View>

      {/* APPROVED — Show instructions */}
      {isApproved && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INSTRUCTIONS FROM DOCTOR</Text>
          <Text style={styles.sectionContent}>
            {action.doctor_note || 'Follow the AI recommendations. Rest well and monitor symptoms.'}
          </Text>
          <View style={styles.dismissNote}>
            <Ionicons name="information-circle-outline" size={12} color="#16A34A" />
            <Text style={styles.dismissNoteText}>
              Your case has been reviewed and closed. Return if symptoms worsen.
            </Text>
          </View>
        </View>
      )}

      {/* APPOINTMENT — Show details */}
      {isAppointment && appointment && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APPOINTMENT DETAILS</Text>
          
          <View style={styles.appointmentDetail}>
            <Ionicons name="calendar-outline" size={14} color="#1A1AFF" />
            <Text style={styles.appointmentDetailText}>
              {formatDate(appointment.appointment_date)}
            </Text>
          </View>
          
          <View style={styles.appointmentDetail}>
            <Ionicons name="time-outline" size={14} color="#1A1AFF" />
            <Text style={styles.appointmentDetailText}>
              {formatTime(appointment.appointment_time)}
            </Text>
          </View>

          {hospitalName && (
            <View style={styles.appointmentDetail}>
              <Ionicons name="location-outline" size={14} color="#1A1AFF" />
              <Text style={styles.appointmentDetailText}>{hospitalName}</Text>
            </View>
          )}

          {appointment.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.sectionLabel}>DOCTOR'S NOTES</Text>
              <Text style={styles.sectionContent}>{appointment.notes}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.calendarButton}
            onPress={() => {
              const dateStr = appointment.appointment_date;
              const timeStr = appointment.appointment_time;
              const calUrl = Platform.OS === 'ios' ? 'calshow:' : 'content://com.android.calendar/time/';
              Linking.canOpenURL(calUrl).then(supported => {
                if (supported) Linking.openURL(calUrl);
              });
            }}
          >
            <Ionicons name="calendar-outline" size={14} color="#1A1AFF" />
            <Text style={styles.calendarButtonText}>ADD TO CALENDAR</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>
        REVIEWED: {new Date(action.created_at).toLocaleString('en-IN')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    marginVertical: 12,
    overflow: 'hidden',
    // No rounded corners as per brutalist request
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(26,26,255,0.1)',
  },
  doctorAvatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#0F172A',
  },
  doctorSpec: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    padding: 14,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 13,
    lineHeight: 20,
    color: '#0F172A',
  },
  dismissNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(22,163,74,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(22,163,74,0.2)',
  },
  dismissNoteText: {
    fontSize: 11,
    color: '#16A34A',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  appointmentDetailText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  notesBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(26,26,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(26,26,255,0.15)',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1A1AFF',
    alignSelf: 'flex-start',
  },
  calendarButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A1AFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
});
