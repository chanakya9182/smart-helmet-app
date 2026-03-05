import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Alert } from 'react-native';

class SMSService {
    async sendEmergencySMS(phoneNumber: string = '911', alertType: 'accident' | 'manual' = 'manual') {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Permission to access location was denied. SMS will not include precise location.');
                this.composeSMS(phoneNumber, alertType, null);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            this.composeSMS(phoneNumber, alertType, location.coords);

        } catch (error) {
            console.error('Error fetching location or sending SMS', error);
            Alert.alert('Error', 'Failed to send SMS.');
        }
    }

    private async composeSMS(phoneNumber: string, alertType: string, coords: Location.LocationObjectCoords | null) {
        const isAvailable = await SMS.isAvailableAsync();

        if (isAvailable) {
            let message = `EMERGENCY ALERT: `;
            if (alertType === 'accident') {
                message += `An accident has been detected by the Smart Helmet! `;
            } else {
                message += `The user has manually triggered an SOS alert! `;
            }

            if (coords) {
                message += `Location: https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
            } else {
                message += `Location: Unknown`;
            }

            const { result } = await SMS.sendSMSAsync(
                [phoneNumber],
                message
            );
            console.log('SMS Result:', result);
        } else {
            Alert.alert('SMS Unavailable', 'There is no messaging app available on this device.');
        }
    }
}

export default new SMSService();
