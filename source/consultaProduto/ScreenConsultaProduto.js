import { StyleSheet, Text } from "react-native"
import { Camera } from 'expo-camera'
import { View } from "react-native"
import { useState } from "react"
import { BarCodeScanner } from "expo-barcode-scanner"

const ScreenConsultaProduto = () => {
  const [ean, setEan] = useState()

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
      />
    </View>
  )
}

const styles = StyleSheet.create({
  camera: {
    width: '100%',
    height: '97%'
  }
})

export default ScreenConsultaProduto