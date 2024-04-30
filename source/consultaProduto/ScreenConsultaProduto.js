import { Dimensions, StyleSheet, Text } from "react-native"
import { AutoFocus, Camera } from 'expo-camera'
import { View } from "react-native"
import { useState } from "react"
import { BarCodeScanner } from "expo-barcode-scanner"

const ScreenConsultaProduto = () => {
  const [ean, setEan] = useState()
  const heightScreen = Dimensions.get('window').height

  const OnBarCodeScanned = (data) => {
    console.log(data.data)
    setEan(data.data)
  }

  return (
    <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
      <Text>{ean}</Text>
      <Camera 
        style={styles.camera} 
        focusDepth={1}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.ean8, BarCodeScanner.Constants.BarCodeType.ean13]
        }}
        onBarCodeScanned={OnBarCodeScanned}
        ratio="16:9"
        autoFocus={AutoFocus.on}
      />

      <View style={[
        styles.barcodeMask, 
        {
          borderTopWidth: (heightScreen/2) - 40, borderBottomWidth: (heightScreen/2) - 40
        }
      ]}/>
    </View>
  )
}

const styles = StyleSheet.create({
  camera: {
    width: '100%',
    height: '97%'
  },

  barcodeMask: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderTopColor: 'rgba(52, 52, 53, 0.7)',
    borderLeftColor: 'rgba(52, 52, 52, 0.7)',
    borderRightColor: 'rgba(52, 52, 52, 0.7)',
    borderBottomColor: 'rgba(52, 52, 52, 0.7)',
  }
})

export default ScreenConsultaProduto