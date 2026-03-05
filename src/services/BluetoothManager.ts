// src/services/BluetoothManager.ts
import { BleManager, Device, BleError, Characteristic } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

class BluetoothManager {
    manager: BleManager | null;
    connectedDevice: Device | null;

    constructor() {
        this.manager = null;
        this.connectedDevice = null;
    }

    init() {
        this.manager = new BleManager();
    }

    async requestPermissions(): Promise<boolean> {
        if (Platform.OS === 'android') {
            const sdkVersion = Number(Platform.Version);
            if (sdkVersion >= 31) {
                const result = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);
                return (
                    result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                    result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                    result['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
                );
            } else {
                const result = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                return result === PermissionsAndroid.RESULTS.GRANTED;
            }
        }
        return true;
    }

    destroy() {
        if (this.manager) {
            this.manager.destroy();
            this.manager = null;
        }
    }

    scanAndConnect(onDeviceFound: (device: Device) => void, onConnected: (device: Device) => void) {
        if (!this.manager) return;

        this.manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.error('BLE Scan Error', error);
                return;
            }

            if (device && device.name && device.name.includes('SmartHelmet')) {
                onDeviceFound(device);
                this.manager?.stopDeviceScan();
                this.connectToDevice(device, onConnected);
            }
        });
    }

    async connectToDevice(device: Device, onConnected: (device: Device) => void) {
        try {
            const connected = await device.connect();
            this.connectedDevice = connected;
            const discovered = await connected.discoverAllServicesAndCharacteristics();
            onConnected(discovered);
        } catch (e) {
            console.error('Connection error', e);
        }
    }

    monitorStatus(serviceUUID: string, characteristicUUID: string, onUpdate: (status: string) => void) {
        if (!this.connectedDevice) return;

        this.connectedDevice.monitorCharacteristicForService(
            serviceUUID,
            characteristicUUID,
            (error, characteristic) => {
                if (error) {
                    console.error('Monitor error', error);
                    return;
                }
                if (characteristic?.value) {
                    // Assuming UTF-8 string encoded in base64 like 'safe', 'alcohol', 'accident'
                    const decoded = Buffer.from(characteristic.value, 'base64').toString('utf-8');
                    onUpdate(decoded.trim().toLowerCase());
                }
            }
        );
    }
}

export default new BluetoothManager();
