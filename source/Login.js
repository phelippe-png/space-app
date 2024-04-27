import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import ApiHttp from "./ApiHttp";
import base64 from "react-native-base64";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Image } from "react-native";
import ShowMessage from "./ShowMessage";
import AutocompleteInput from "react-native-autocomplete-input";

const Login = ({ navigation, route }) => {
  const [userIOS, setUserIOS] = useState({})
  const loginIOS = useRef(false)

  const [user, setUser] = useState({})
  const [filteredUsers, setFilteredUsers] = useState([])
  const users = useRef()
  const loginInput = useRef('')
  const passwordInput = useRef('')
  const [forceUpdate, setForceUpdate] = useState(false)
  const error = useRef(false)
  const messageError = useRef('')
  const messageType = useRef('')
  const openListUsers = useRef(false)

  useEffect(() => {
    if (user?.connection?.url != undefined && user?.connection?.url != '' && users.current == undefined) {
      ApiHttp(base64.decode(user?.connection?.url)).get('/spaceapp/usuarios')
      .then((response) => {
        users.current = response.data
        console.log(response.data)
      })
      .catch((err) => {
        messageError.current = 'ERRO AO CONECTAR NO SERVIDOR'
        messageType.current = 'error'
        error.current = true
        setForceUpdate(!forceUpdate)

        console.log("Erro ao se conectar: " + err)
      });
    }
  }, [user])

  const getUser = (login) => {
    if (user?.connection?.url == undefined || user?.connection?.url == '') {
      messageError.current = 'SELECIONE UMA CONEXÃO'
      messageType.current = 'warning'
      error.current = true
      setForceUpdate(!forceUpdate)
    } else {
      ApiHttp(base64.decode(user?.connection?.url)).post('/spaceapp/login', {
        user: login == undefined ? '' : login,
      })
      .then((response) => {
        let userPassword = response.data?.senha == undefined || response.data?.senha == '' ? '' : base64.decode(base64.decode(response.data?.senha))

        if (Object.keys(response.data).length == 0 || userPassword != '' && userPassword != passwordInput.current) {
          error.current = true
          messageError.current = 'USUÁRIO OU SENHA INVÁLIDOS'
          messageType.current = 'warning'
        }
        
        setUser({
          ...user,
          id: response.data?.id == undefined ? 0 : response.data?.id,
          name: response.data?.nome == undefined ? '' : response.data?.nome,
          password: response.data?.senha == undefined || response.data?.senha == '' ? '' : base64.decode(base64.decode(response.data?.senha)),
          menuPermissions: response.data?.menuPermissions
        })
      })
      .catch((err) => {
        messageError.current = 'ERRO AO CONECTAR NO SERVIDOR'
        messageType.current = 'error'
        error.current = true
        setForceUpdate(!forceUpdate)

        console.log("Erro ao se conectar a API: " + err)
      });
    }
  }

  useEffect(() => {
    if (user?.password != undefined && user?.password != '' && (loginInput.current == user?.name || loginInput.current == user?.id) && passwordInput.current == user?.password) {
      error.current = false

      saveFile('user', JSON.stringify({
        id: user.id,
        name: user.name,
        password: user.password,
        connection: user.connection,
        menuPermissions: user.menuPermissions
      }))

      route.params.userStateApp(user)
      route.params.confirmLogin(true)
    }
  }, [user])

  const saveFile = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
      console.log('Arquivo salvo com sucesso!');
    } catch (erro) {
      console.error('Erro ao salvar arquivo:', erro);
    }
  };

  useEffect(() => { 
    const getUser = async () => {
      let result = await AsyncStorage.getItem('user')
      setUser(JSON.parse(result))
    }
    getUser()
  }, [])

  const listUsers = (user) => {
    let filterUsers = user.trim() == '' ? [] : users.current?.filter((e) => (String(e.idCadPessoa).includes(user) || e.nome.includes(user)))
    let arrayUsers = []
    filterUsers?.map((e) => { arrayUsers.push(e.nome) })

    openListUsers.current = user.trim() == '' || arrayUsers.length == 0 ? false : true
    setFilteredUsers(arrayUsers)
  }

  const selectUser = (user) => {
    openListUsers.current = false
    loginInput.current = user
    setForceUpdate(!forceUpdate)
  }

  //PROCESSO IOS
    // useEffect(() => {
    //   ApiHttp('http://seralle.space.app.br:15282').post('/spaceapp/login', {
    //     user: '',
    //     ios: 'renanteste'
    //   })
    //   .then((response) => {
    //     if (response.data?.ios) {
    //       loginIOS.current = true

    //       setUserIOS({
    //         connection: {
    //           "name": "Serallê",
    //           "url": "aHR0cDovL3NlcmFsbGUuc3BhY2UuYXBwLmJyOjE1Mjgy"
    //         },
    //         id: response.data?.id == undefined ? 0 : response.data?.id,
    //         name: response.data?.nome == undefined ? '' : response.data?.nome,
    //         password: response.data?.senha == undefined || response.data?.senha == '' ? '' : base64.decode(base64.decode(response.data?.senha)),
    //         menuPermissions: response.data?.menuPermissions
    //       })
    //     }
    //   })
    //   .catch((err) => {
    //     messageError.current = 'ERRO AO CONECTAR NO SERVIDOR'
    //     messageType.current = 'error'
    //     error.current = true
    //     setForceUpdate(!forceUpdate)

    //     console.log("Erro ao se conectar a API: " + err)
    //   });
    // }, [])

    // useEffect(() => {
    //   if (loginIOS.current)
    //     setTimeout(() => { 
    //       saveFile('user', JSON.stringify(userIOS))
          
    //       route.params.userStateApp(userIOS)
    //       route.params.confirmLogin(true)
    //     }, 100)
    // }, [userIOS])
  //PROCESSO IOS

  return (
    <View>
      {error.current &&
        <ShowMessage
          text={messageError.current} 
          messageType={messageType.current}
          onClick={() => { error.current = false }}
        />
      }

      <Image source={require('./assets/imagens/fundo.jpg')} style={{position: 'absolute'}}/>

      <View style={{width: '100%', height: '100%', alignItems: "center", justifyContent: "center"}}>
        <Image source={require('./assets/imagens/login_space.png')} resizeMethod="resize" style={{borderRadius: 15, position: 'absolute'}}/>

        <View style={{width: 350, height: 450, alignItems: 'center'}}>
          <View style={{flex: 1, width: '100%', marginTop: 145, alignItems: 'center', justifyContent: 'center'}}>
            <View style={{width: '83%', zIndex: openListUsers.current ? 1 : 0, height: 300, position: 'absolute'}}>
              <AutocompleteInput
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize={'characters'}
                placeholderTextColor={"gray"}
                placeholder="USUÁRIO"
                inputContainerStyle={{
                  borderWidth: 0,
                  width: '120%',
                }}
                containerStyle={{
                  width: '100%',
                  zIndex: 1,
                }}
                data={filteredUsers}
                onChangeText={(e) => { listUsers(e) }}
                hideResults={!openListUsers.current}
                onEndEditing={(e) => {
                  if (users.current != undefined) {
                    loginInput.current = users.current?.find((item) => String(item.idCadPessoa) == e.nativeEvent.text || item.nome == e.nativeEvent.text)
                    loginInput.current = loginInput.current?.nome == undefined ? '' : loginInput.current?.nome
                  } else {
                    loginInput.current = e.nativeEvent.text
                  }

                  openListUsers.current = false
                  setForceUpdate(!forceUpdate)
                }}
                flatListProps={{
                  keyboardShouldPersistTaps: "always",
                  renderItem: ({item}) => (
                    <TouchableOpacity style={{height: 30, justifyContent: "center", borderBottomWidth: 0.3, borderColor: '#cdcaca'}} onPress={() => { selectUser(item) }}>
                      <Text style={{fontSize: 17, fontFamily: 'Lato_400Regular'}}>{item}</Text>
                    </TouchableOpacity>
                  )
                }}
              >
                {loginInput.current}
              </AutocompleteInput>
            </View>

            <TextInput placeholderTextColor={"gray"} onChangeText={(e) => passwordInput.current = e} secureTextEntry placeholder="SENHA" style={styles.input}/>

            <TouchableOpacity style={styles.buttonSubmit} onPress={() => { getUser(loginInput.current) }}>
              <Text style={styles.textButtonSubmit}>LOGIN</Text>
            </TouchableOpacity>

            <View style={{flexDirection: "row", width: '77%'}}>
              <View style={{flex: 1}}>
                <TouchableOpacity style={{paddingTop: 10, paddingBottom: 10}} onPress={() => { navigation.navigate("Conexões", {userAsyncLogin: setUser}) }}>
                  <Text style={{color: 'white', fontFamily: 'Lato_700Bold'}}>Minhas Conexões</Text>
                </TouchableOpacity>
              </View>

              <View style={{flex: 1.2}}>
                <Text style={{color: 'white', fontFamily: 'Lato_700Bold', textAlign: "right", paddingTop: 10, paddingBottom: 10}}>
                  {user?.connection?.name != undefined ? user?.connection?.name : 'Não Selecionado'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}
  
const styles = StyleSheet.create({
  input: {
    width: '81%', 
    height: 60, 
    backgroundColor: 'white', 
    borderRadius: 7,
    fontSize: 30,
    fontFamily: 'Lato_400Regular',
    borderWidth: 1,
    elevation: 12,
    padding: 7,
    margin: 4,
  },

  buttonSubmit: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#D64545', 
    width: '81%', 
    height: 55, 
    margin: 4,
    borderRadius: 7,
    elevation: 12,
    borderWidth: 0.4
  },

  textButtonSubmit: {
    width: 300,
    textAlign: 'center',
    fontSize: 30, 
    color: 'white', 
    fontFamily: 'Lato_700Bold', 
    marginBottom: 4,
    textShadowColor: '#393939',
    textShadowOffset: {width: 3, height: 2},
    textShadowRadius: 5,
  }
})

export default Login;