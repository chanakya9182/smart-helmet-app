import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface AlertButtonProps {
    onPress: () => void;
    disabled?: boolean;
}

export const AlertButton: React.FC<AlertButtonProps> = ({ onPress, disabled = false }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, disabled && styles.disabled]}
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.7}
            >
                <Text style={styles.text}>SOS ALERT</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 24,
    },
    button: {
        backgroundColor: '#D32F2F',
        width: 200,
        height: 200,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#D32F2F',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 15,
        borderWidth: 4,
        borderColor: '#FFCDD2',
    },
    disabled: {
        backgroundColor: '#EF9A9A',
        borderColor: '#FFEBEE',
        shadowOpacity: 0.1,
    },
    text: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: 2,
    },
});
