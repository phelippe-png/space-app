import { Text } from "react-native"

const CustomText = (props) => {
    props.propsGrid.drawColumnCell == undefined || props.propsGrid.drawColumnCell.find((element) => element.field == column) == undefined ? 
        <Text style={[styles.gridText, StringIsNumber(item[column]) && {textAlign: 'right'}]}>{FormatFloat(item[column])}</Text> : 
        StyleColumn(item[column], props.propsGrid.drawColumnCell.find((element) => element.field == column).styleType)
}

export default CustomText;