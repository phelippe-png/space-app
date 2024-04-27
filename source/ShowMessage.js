import Modal from "react-native-modal";
import { StyleSheet, SafeAreaView, View, Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { useRef, useState } from "react";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

const messageType = (type) => {
    switch (type) {
        case 'error':
            return <MaterialIcons name="highlight-remove" style={{ fontSize: 100, color: 'red' }}></MaterialIcons>
            break;

        case 'warning':
            return <MaterialIcons name="warning" style={{ fontSize: 100, color: 'orange' }}></MaterialIcons>
            break;

        default:
            break;
    }
}

const ShowMessage = (props) => {
    const [forceUpdate, setForceUpdate] = useState(true)
    const visibleModal = useRef(false)

    return (
        <Modal isVisible={visibleModal.current = !visibleModal.current} animationOutTiming={200} useNativeDriverForBackdrop={true} useNativeDriver={true}>
            <View style={{alignItems: "center", justifyContent: "center"}}>
                <View style={styles.modal}> 
                    <SafeAreaView style={{flex: 1, alignItems: 'center', justifyContent: 'center', padding: 5}}>
                        {messageType(props.messageType)}
                        <Text style={styles.styleText}>{props.text}</Text>
                    </SafeAreaView>

                    <SafeAreaView style={{flex: 1, alignItems: "center", justifyContent: "flex-end"}}>
                        <TouchableOpacity onPress={props.onClick} onPressOut={() => { setForceUpdate(!forceUpdate) }} style={styles.buttonSubmit}>
                            <Text style={{color: 'white', fontFamily: 'Lato_900Black', elevation: 12}}>OK</Text>
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modal: {
        backgroundColor: 'white', 
        width: 305, 
        height: 320, 
        borderRadius: 10, 
        elevation: 12,
    },

    styleText: {
        marginTop: 15,
        fontSize: 17,
        textAlign: "center",
        fontFamily: "Lato_400Regular"
    },

    buttonSubmit: {
        backgroundColor: '#072e3f', 
        width: 150, 
        height: 35, 
        borderRadius: 5, 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: 10
    }
})

export default ShowMessage;