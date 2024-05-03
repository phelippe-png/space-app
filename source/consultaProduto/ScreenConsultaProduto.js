import { Alert, Dimensions, Image, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity } from "react-native"
import { AutoFocus, Camera } from 'expo-camera'
import { View } from "react-native"
import { useEffect, useRef, useState } from "react"
import { BarCodeScanner } from "expo-barcode-scanner"
import AsyncStorage from "@react-native-async-storage/async-storage"
import ApiHttp from "../ApiHttp"
import base64 from "react-native-base64"
import FormatFloat from "../../functions/FormatFloat"
import Grid from "../grid/ComponentGrid"
import Icon_Ionic from "react-native-vector-icons/Ionicons";
import ShowMessage from "../ShowMessage"
import SelectDropdown from "react-native-select-dropdown"

const ScreenConsultaProduto = ({navigation, route}) => {
  const ean = useRef()
  const widthScreen = Dimensions.get('window').width
  const heightScreen = Dimensions.get('window').height
  const [user, setUser] = useState({})
  const [response, setResponse] = useState({})
  const [forceUpdate, setForceUpdate] = useState(false)
  const filteredStock = useRef([])
  const cameraOn = useRef(true)
  const showMessageModal = useRef(false)
  const textMessage = useRef()
  const messageType = useRef()
  const itemIndexComboBox = useRef()
  const [permission, requestPermission] = Camera.useCameraPermissions();

  useEffect(() => { 
    const getUser = async () => {
      setUser(JSON.parse(await AsyncStorage.getItem('user')))
    }
    getUser()
  }, [])

  const stockPermission = user?.menuPermissions?.find(e => e.formulario == 'listproduto' && e.tipo == 'SpaceApp Visualizar Estoque')

  const OnBarCodeScanned = (data) => {
    if (data.boundingBox.origin.x >= 285 && data.boundingBox.origin.x <= 370 && data.boundingBox.origin.y >= 10 && data.boundingBox.origin.y <= 200) {
      if (ean.current != data.data)
        ApiHttp(base64.decode(user?.connection.url)).post('/spaceapp/consulta-produto', {
          "ean": data.data,
          "user": user?.id
        }).then((response) => {
          if (JSON.stringify(response.data) == '{}') {
            messageType.current = 'warning'
            textMessage.current = 'PRODUTO INEXISTENTE!'
            showMessageModal.current = true
            setResponse({})
          } else {
            response.data?.tamanhos?.map((e, index) => { 
              if (e == response.data?.tamanho)
                itemIndexComboBox.current = index
            })

            let filterEstoque = response.data?.estoque != undefined ? JSON.stringify(response.data?.estoque) : response.data?.estoque
            filterEstoque = JSON.parse(filterEstoque)
            filterEstoque.response = filterEstoque?.response.filter((e) => e.legenda == response.data?.tamanho)
            filteredStock.current = filterEstoque

            cameraOn.current = false
            setResponse(response.data)
          }
        }).catch((e) => {
          console.log(e)
          messageType.current = 'error'
          textMessage.current = 'ERRO AO BUSCAR PRODUTO!'
          showMessageModal.current = true
          setResponse({})
        })

      ean.current = data.data
    }
  }

  const filterSize = (size) => {
    let filterEstoque = response?.estoque != undefined ? JSON.stringify(response?.estoque) : response?.estoque
    filterEstoque = JSON.parse(filterEstoque)
    filterEstoque.response = filterEstoque?.response.filter((e) => e.legenda == size)
    filteredStock.current = filterEstoque

    setForceUpdate(!forceUpdate)
  }

  const ProductInformations = (props) => {
    return (
      <View>
        <Text style={props?.styleText?.productTitleInformation}>{response?.descricao}</Text>

        <Text style={props?.styleText?.productTitleInformation}>
          Código:
          <Text style={props?.styleText?.productInformation}> {response?.id}</Text>
        </Text>

        <Text style={props?.styleText?.productTitleInformation}>
          Cor:
          <Text style={props?.styleText?.productInformation}> {response?.cor}</Text>
        </Text>

        <Text style={props?.styleText?.productTitleInformation}>
          Tamanho: 
          <Text style={props?.styleText?.productInformation}> {response?.tamanho}</Text>
        </Text>

        <Text style={props?.styleText?.productTitleInformation}>
          Preço:
          <Text style={props?.styleText?.productInformation}> {FormatFloat(response?.preco, 'R$')}</Text>
        </Text>
      </View>
    )
  }

  // if (!permission?.granted) {
  //   Alert.alert('Informação', 'Precisamos da sua permissão para ligar a câmera.', [
  //     {
  //       text: 'Não permitir'
  //     },
  //     {
  //       text: 'Permitir',
  //       onPress: requestPermission
  //     }
  //   ])
  // } else
  return (
    <View style={{flex: 1}}>
      {
        showMessageModal.current &&
          <ShowMessage
            text={textMessage.current}
            messageType={messageType.current}
            onClick={() => {
              showMessageModal.current = false
            }}
          />
      }

      {
        cameraOn.current ? (
          <SafeAreaView>
            <Camera 
              style={styles.camera} 
              focusDepth={1}
              autoFocus={AutoFocus.on}
              type={Camera.Constants.Type.back}
              barCodeScannerSettings={{
                barCodeTypes: [BarCodeScanner.Constants.BarCodeType.ean8, BarCodeScanner.Constants.BarCodeType.ean13, BarCodeScanner.Constants.BarCodeType.upc_ean]
              }}
              onBarCodeScanned={OnBarCodeScanned}
              ratio="16:9"
            />

            <View style={[
              styles.barcodeMask, 
              {
                borderTopWidth: (heightScreen/2) - 75, borderBottomWidth: (heightScreen/2) - 75
              }
            ]}>
              <View style={{width: '100%', height: '100%', borderWidth: 1, borderColor: '#044773'}}></View>
            </View>

            <Text style={styles.caption}>
              Aponte a câmera para o código de barras
            </Text>
          </SafeAreaView>
        ) : (
          <SafeAreaView style={{flex: 1}}>
            {
              (stockPermission != undefined && stockPermission.permissao) ? (
                <View>
                  <View style={{flexDirection: "row"}}>
                    <View style={{flex: 2, alignItems: "center", justifyContent: "center"}}>
                      <Image 
                        src={response?.caminhoimagem} 
                        style={{
                          width: 130,
                          height: 130,
                          borderWidth: 0.5,
                          borderColor: 'black',
                          margin: 10
                        }}
                      />
                    </View>

                    <View style={{flex: 3, justifyContent: "center"}}>
                      <ProductInformations
                        styleText={{
                          productTitleInformation: {
                            fontFamily: 'Lato_700Bold',
                            fontSize: 15,
                            margin: 3
                          },
                          productInformation: {
                            fontFamily: 'Lato_400Regular',
                            fontSize: 15,
                            margin: 3
                          }
                        }}
                      />
                    </View>
                  </View>

                  <View style={{width: '100%', alignItems: "center", marginBottom: 10}}>
                    <Text style={{width: '95%', fontFamily: 'Lato_700Bold'}}>Filtrar tamanho:</Text>
                    <SelectDropdown 
                      data={response?.tamanhos}
                      buttonStyle={{width: '95%', height: 40, backgroundColor: Platform.OS == 'ios' ? '#EDEDED' : '#DBDFDF', borderRadius: 7}}
                      buttonTextStyle={{fontFamily: 'Lato_400Regular', fontSize: 17 }}
                      rowTextStyle={{fontFamily: 'Lato_400Regular'}}
                      defaultValueByIndex={itemIndexComboBox.current}
                      onSelect={(item, i) => { filterSize(item) }}
                    />
                  </View>
                </View>
              ) : (
                <View style={{flex: 1, marginTop: 15}}>
                  <View style={{flex: 3, alignItems: "center", justifyContent: "center"}}>
                    <Image 
                      src={response?.caminhoimagem} 
                      style={{
                        width: widthScreen - 50,
                        height: widthScreen - 50,
                        borderWidth: 0.5,
                        borderColor: 'black'
                      }}
                    />
                  </View>

                  <View style={{flex: 2.7, alignItems: "center"}}>
                    <ProductInformations
                      styleText={{
                        productTitleInformation: {
                          fontFamily: 'Lato_700Bold',
                          fontSize: 25,
                          margin: 3
                        },
                        productInformation: {
                          fontFamily: 'Lato_400Regular',
                          fontSize: 25,
                          margin: 3
                        }
                      }}
                    />
                  </View>
                </View>
              )
            }

            {
              (stockPermission != undefined && stockPermission.permissao) &&
                <Grid
                  dataSet={filteredStock.current}
                  activePageControl={false}
                  invisibleColumns={[
                    'legenda'
                  ]}
                />
            }

            <View style={{width: '100%', alignItems: "center"}}>
              <TouchableOpacity 
                style={styles.buttonRead} 
                onPress={() => {
                  ean.current = ''
                  cameraOn.current = true
                  setResponse({})
                }}
              >
                <Icon_Ionic name="camera" style={{ color: "white", fontSize: 25, marginRight: 10, padding: 8 }}/>
                <Text style={{color: 'white', fontFamily: 'Lato_700Bold'}}>FAZER LEITURA NOVAMENTE</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )
      }
    </View>
  )
}

const styles = StyleSheet.create({
  camera: {
    width: '100%',
    height: '100%'
  },

  caption: {
    position: "absolute", 
    textAlign: "center", 
    textAlignVertical: "center", 
    width: '100%', 
    height: 200,
    fontSize: 30,
    fontFamily: 'Lato_700Bold',
    color: 'white',
    padding: 10
  },

  barcodeMask: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderTopColor: 'rgba(52, 52, 53, 0.8)',
    borderLeftColor: 'rgba(52, 52, 52, 0.8)',
    borderRightColor: 'rgba(52, 52, 52, 0.8)',
    borderBottomColor: 'rgba(52, 52, 52, 0.8)',
  },

  buttonRead: {
    width: '90%', 
    height: 50, 
    borderRadius: 10, 
    backgroundColor: '#072e3f',
    alignItems: "center",
    justifyContent: "center",
    flexDirection: 'row',
    elevation: 7,
    margin: 10
  }
})

export default ScreenConsultaProduto