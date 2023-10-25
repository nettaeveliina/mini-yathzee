import { View, Text } from 'react-native'
import styles from "../Style/style"

export default function Footer() {
    return (
        <View style={styles.footer}>
            <Text style={styles.author}>Author: Netta Nissilä</Text>
        </View>
    )
}

