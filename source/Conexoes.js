import AsyncStorage from "@react-native-async-storage/async-storage"
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native"
import { View } from "react-native-animatable";
import { BarCodeScanner } from 'expo-barcode-scanner';
import ApiHttp from "./ApiHttp";
import base64 from "react-native-base64";
import ShowMessage from "./ShowMessage";
import utf8 from 'utf8'
import Icon_Ionic from 'react-native-vector-icons/Ionicons'

const Conexoes = ({ navigation, route }) => {
  const [connections, setConnections] = useState([])
  const [user, setUser] = useState({})
  const [hasPermission, setHasPermission] = useState(null);
  const [showMessage, setShowMessage] = useState(false)
  const messageText = useRef('')
  const messageType = useRef('')
  const connectionName = useRef('')

  const getConnectionName = (url) => {
    const jsonConnection = url.startsWith('{') ? JSON.parse(url) : undefined

    // console.log(jsonConnection)

    const urlConnection = jsonConnection != undefined ? base64.decode(jsonConnection.url) : ''

    if(jsonConnection?.isUrlSpace == false || jsonConnection?.isUrlSpace == undefined) {
      messageText.current = 'O QRCode está inválido. Você deve ler o QRCode gerado no ERP do Space!'
      messageType.current = 'warning'
      setShowMessage(true)
      return null
    }

    ApiHttp( urlConnection ).get('/spaceapp/nome-conexao')
      .then((response) => {
        connectionName.current = response.data
      })
      .catch((error) => {
        messageText.current = 'ERRO AO CONECTAR NO SERVIDOR!'
        messageType.current = 'error'
        setShowMessage(true)
      })
  }

  const openQrCodeScanner = () => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }

  const handleBarCodeScanned = ({ type, data }) => {
    getConnectionName(data)
    setHasPermission(false)

    setTimeout(() => {
      if (connectionName.current == '' || connectionName.current == undefined)
        return null

      const jsonConnection = JSON.parse(data)

      if (connections.find((e) => e.url == jsonConnection.url)){
        messageText.current = 'A conexão já existe!'
        messageType.current = 'warning'
        setShowMessage(true)
        return null
      }

      let vConnections
      vConnections = [
        ...connections, 
        {
          name: connectionName.current,
          url: jsonConnection.url,
        }
      ]

      saveAsyncStorage('connections', JSON.stringify(vConnections))
      selectConnection({
        name: connectionName.current,
        url: jsonConnection.url
      })
      // setConnections(vConnections)
    }, 300)
  };

  const saveAsyncStorage = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (erro) {
      console.error('Erro ao salvar arquivo:', erro);
    }
  };

  const getAsyncStorage = async (key, stateConnections) => {
    try {
      let result = await AsyncStorage.getItem(key);
      if (result !== null) {
        stateConnections(JSON.parse(result))
      } else
        stateConnections([])
    } catch (erro) {
      console.error('Erro ao recuperar arquivo:', erro);
      stateConnections([])
    }
  };

  const selectConnection = (item) => {
    let vUser = {
      ...user,
      connection: item
    }

    saveAsyncStorage('user', JSON.stringify(vUser))
    route.params.userAsyncLogin(vUser)
    navigation.navigate("Login")
  }
  
  const deleteConnection = (item) => {
    let vConnections = connections.filter((e) => e != item)
    saveAsyncStorage('connections', JSON.stringify(vConnections))
    setConnections(vConnections)

    let selectedConnection
    if (user?.connection?.url == item.url) {
      selectedConnection = {
        ...user,
        connection: {}
      }

      saveAsyncStorage('user', JSON.stringify(selectedConnection))
      route.params.userAsyncLogin(selectedConnection)
    }
  }

  useEffect(() => {
    getAsyncStorage('connections', setConnections)
  }, [])

  useEffect(() => {
    getAsyncStorage('user', setUser)
  }, [])

  const ConnectionsList = ({ item }) => {
    return (
      <View style={{alignItems: 'center'}}>
        <TouchableOpacity key={item} style={styles.ConnectionPanel} onPress={() => { selectConnection(item) }}>
          <View style={{width: '100%', height: '100%', position: "absolute", alignItems: "center", justifyContent: "center"}}>
            <Text style={{fontFamily: 'Lato_700Bold', fontSize: 20}}>{item?.name}</Text>
          </View>
          <TouchableOpacity key={item} onPress={() => { deleteConnection(item) }}>
            <Icon_Ionic name="trash-sharp" size={30} style={{color: 'red', padding: 14}}></Icon_Ionic>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{flex: 1, alignItems: "center"}}>
      {showMessage && !hasPermission &&
        <ShowMessage
          text={messageText.current}
          messageType={messageType.current}
          onClick={() => { messageText.current = ''; setShowMessage(false) }}
        />
      }

      {
        hasPermission ? 
          <View style={styles.ContainerQrCode}>
            <View style={{flex: 9, width: '100%'}}>
              <BarCodeScanner barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]} style={[StyleSheet.absoluteFillObject, {margin: 50}]} onBarCodeScanned={handleBarCodeScanned}/>
            </View>

            <View style={{flex: 1, width: '100%', padding: 17, justifyContent: "flex-end"}}>
              <TouchableOpacity style={[styles.ButtonAdd, {backgroundColor: '#F72019'}]} onPress={() => { setHasPermission(false) }}>
                <Text style={{color: 'white', fontFamily: 'Lato_700Bold', fontSize: 20, marginBottom: 3}}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        :
          <View style={{flex: 1, width: '100%', alignItems: "center"}}>
            {connections.length == 0 ?
              <Text style={{fontFamily: 'Lato_700Bold', fontSize: 17, marginTop: 10}}>Sem Conexões</Text> :
              <FlatList
                style={{flex: 1, width: '100%'}}
                data={connections}
                renderItem={ConnectionsList}
                // ItemSeparatorComponent={() => (<View style={{ height: 0.5, backgroundColor: "#cdcaca" }}></View>)}
                // onEndReached={() => isLoading = false}
                // ListFooterComponent={load => {}}
              />
            }

            <View style={{flex: connections.length == 0 ? 1 : 0, width: '100%', padding: 10, justifyContent: "flex-end"}}>
              <TouchableOpacity style={styles.ButtonAdd} onPress={() => { openQrCodeScanner() }}>
                <Text style={{color: 'white', fontFamily: 'Lato_700Bold', fontSize: 20, marginBottom: 3}}>+ Adicionar Conexão</Text>
              </TouchableOpacity>
            </View>
          </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  ConnectionPanel: {
    width: '95%', 
    height: 60, 
    backgroundColor: '#D1D1D1', 
    borderRadius: 9,
    marginVertical: 5,
    elevation: 3,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  ButtonAdd: {
    width: '100%', 
    height: 60, 
    borderRadius: 10, 
    backgroundColor: '#072e3f',
    alignItems: "center",
    justifyContent: "center",
    elevation: 7
  },

  ContainerQrCode: {
    width: '100%', 
    height: '100%', 
    alignItems: 'center', 
    justifyContent: "center",
    // backgroundColor: '#072e3f'
  }
})

export default Conexoes;