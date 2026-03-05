import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { StatusDisplay, HelmetStatus } from '@/src/components/StatusDisplay';
import { AlertButton } from '@/src/components/AlertButton';
import SMSService from '@/src/services/SMSService';
import BluetoothManager from '@/src/services/BluetoothManager';

const EMERGENCY_CONTACT = '+1234567890'; // Replace with real preference or setting
const HELMET_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const HELMET_CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

export default function HomeScreen() {
  const [status, setStatus] = useState<HelmetStatus>('disconnected');
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    BluetoothManager.init();
    return () => {
      BluetoothManager.destroy();
    };
  }, []);

  const handleManualAlert = () => {
    SMSService.sendEmergencySMS(EMERGENCY_CONTACT, 'manual');
  };

  const simulateStatus = (newStatus: HelmetStatus) => {
    setStatus(newStatus);
    if (newStatus === 'accident') {
      SMSService.sendEmergencySMS(EMERGENCY_CONTACT, 'accident');
    }
  };

  const connectHelmet = async () => {
    const hasPermissions = await BluetoothManager.requestPermissions();
    if (!hasPermissions) {
      Alert.alert('Permission Error', 'Bluetooth/Location permissions are required to scan for helmet.');
      return;
    }

    setIsScanning(true);
    BluetoothManager.scanAndConnect(
      (device) => {
        console.log('Found helmet:', device.name);
      },
      (connectedDevice) => {
        setIsScanning(false);
        setDeviceConnected(true);
        setStatus('safe'); // default status on connect

        BluetoothManager.monitorStatus(
          HELMET_SERVICE_UUID,
          HELMET_CHARACTERISTIC_UUID,
          (newStatus) => {
            if (['safe', 'alcohol', 'accident'].includes(newStatus)) {
              setStatus(newStatus as HelmetStatus);
              if (newStatus === 'accident') {
                SMSService.sendEmergencySMS(EMERGENCY_CONTACT, 'accident');
              }
            }
          }
        );
      }
    );

    // Timeout scanning after 10s
    setTimeout(() => {
      if (BluetoothManager.manager && !BluetoothManager.connectedDevice) {
        BluetoothManager.manager.stopDeviceScan();
        setIsScanning(false);
        Alert.alert('Scan Timeout', 'Could not find the Smart Helmet.');
      }
    }, 10000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Smart Helmet Dashboard</Text>
          <Text style={styles.subtitle}>
            Bluetooth: {deviceConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>

        {!deviceConnected && (
          <TouchableOpacity
            style={[styles.connectBtn, isScanning && styles.connectBtnDisabled]}
            onPress={connectHelmet}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.connectBtnText}>Connect Helmet</Text>
            )}
          </TouchableOpacity>
        )}

        <StatusDisplay status={status} />

        <AlertButton onPress={handleManualAlert} disabled={false} />

        <View style={styles.simulatorContainer}>
          <Text style={styles.simulatorTitle}>Simulator (For Testing):</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.simBtn} onPress={() => simulateStatus('safe')}>
              <Text style={styles.simText}>Safe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.simBtn} onPress={() => simulateStatus('alcohol')}>
              <Text style={styles.simText}>Alcohol</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.simBtn} onPress={() => simulateStatus('accident')}>
              <Text style={styles.simText}>Accident</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    marginVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
  },
  connectBtn: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  connectBtnDisabled: {
    backgroundColor: '#64B5F6',
  },
  connectBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  simulatorContainer: {
    marginTop: 40,
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
  },
  simulatorTitle: {
    color: '#ccc',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  simBtn: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  simText: {
    color: '#fff',
    fontWeight: '600',
  }
});
