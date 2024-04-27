import NumberIsDecimal from "../../functions/NumberIsDecimal";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Text, StyleSheet } from "react-native";
import FormatFloat from "../../functions/FormatFloat";
import StringIsNumber from "../../functions/StringIsNumber";

const StyleColumn = (value, styleType) => {
    const styleTypes = [
        'negativePositiveValue'
    ]

    switch ( styleTypes.find((e) => e == styleType) ) {
        case 'negativePositiveValue':
            if (StringIsNumber(value)) {
                if (value < 0) {
                    return <MaterialIcons name="arrow-downward" style={{ fontSize: 10, marginLeft: 2, color: 'red', textAlign: "right" }}>
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.gridText}>{FormatFloat(value)}</Text>
                    </MaterialIcons>
                } else if (value > 0) {
                    return <MaterialIcons name="arrow-upward" style={{ fontSize: 10, marginLeft: 2, color: 'green', textAlign: "right" }}>
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.gridText]}>{FormatFloat(value)}</Text>
                    </MaterialIcons>
                } else {
                    return <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.gridText, {textAlign: "right"}]}>{value}</Text>
                }
            }
            break;
    
        default:
            return <Text style={[styles.gridText, {color: 'red'}]}>ESTILO NÃO ENCONTRADO</Text>
            break;
    }
}

const styles = StyleSheet.create({
    gridText: {
        fontSize: 13,
        textTransform: "uppercase",
        fontFamily: "Lato_400Regular"
    },
})

export default StyleColumn;