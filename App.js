import 'react-native-gesture-handler';
import { StyleSheet, Text, View, Image, Platform, ActivityIndicator, TouchableOpacity, Button, Alert, StatusBar } from "react-native";
import { useEffect, useState } from 'react'
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts, Lato_300Light, Lato_400Regular, Lato_700Bold, Lato_900Black } from "@expo-google-fonts/lato"; 
import Login from "./source/Login";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Conexoes from "./source/Conexoes";
import { DrawerContentScrollView, DrawerItem, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import DrawersMenu from './source/DrawersMenu';
import ApiHttp from './source/ApiHttp';
import base64 from 'react-native-base64';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function App() {
  const [user, setUser] = useState({})
  const [login, setLogin] = useState(false)

  let [fontsLoaded] = useFonts({
    Lato_300Light, 
    Lato_400Regular, 
    Lato_700Bold, 
    Lato_900Black
  })

  const ImageApp = () => {
    return (
      <Image
        source={require("./source/assets/imagens/logo_app.png")}
        resizeMode={Platform.OS == "ios" ? "center" : "contain"}
      />
    );
  };

  useEffect(() => { 
    const getUser = async () => {
      let user = JSON.parse(await AsyncStorage.getItem('user'))

      if (user != undefined && user?.id != undefined) {
        ApiHttp(base64.decode(user?.connection?.url)).post('/spaceapp/login', {
          user: user?.id
        })
        .then((response) => { 
          user = {...user, menuPermissions: response.data?.menuPermissions}
          saveFile('user', JSON.stringify(user))
          setUser(user)
        })
        .catch((error) => console.log(error))
      }

      if (user != undefined && user?.id != undefined && user?.name != undefined && user?.password != undefined && user?.connection?.url != undefined)
        setLogin(true)
    }

    getUser()
  }, [])

  const saveFile = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
      console.log('Arquivo salvo com sucesso!');
    } catch (erro) {
      console.error('Erro ao salvar arquivo:', erro);
    }
  };

  const logout = () => {
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      {
        text: 'Sim',
        onPress: () => {
          AsyncStorage.removeItem('user')
          setLogin(false)
        }
      },
      {
        text: 'Não',
        onPress: () => {
          return null
        }
      }
    ])
  }

  const DrawerContent = (props) => {
    return (
      <DrawerContentScrollView contentContainerStyle={{flex: 1, backgroundColor: '#052634'}}>
        <View style={{height: 60, alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{color: 'white', fontFamily: 'Lato_700Bold', textAlign: 'center'}}>Bem-vindo {user?.name}</Text>
        </View>

        <DrawerItemList {...props} />

        <View style={{flex: 1, justifyContent: 'flex-end'}}>
          <DrawerItem icon={() => <MaterialIcons name='logout' size={25} color={'white'}/>}
            label="Sair" labelStyle={{color: 'white', fontFamily: 'Lato_700Bold'}} onPress={() => logout()} 
          />
        </View>
      </DrawerContentScrollView>
    )
  }

  if(!fontsLoaded)
    return (<ActivityIndicator size={50} color={'#072e3f'} style={styles.Loading}></ActivityIndicator>)
  else if (!login){
    return (  
      <NavigationContainer>
        <StatusBar></StatusBar>

        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerTransparent: true,
              title: '',
              animation: 'fade_from_bottom'
            }}
            initialParams={{
              confirmLogin: setLogin,
              userStateApp: setUser
            }}
          />

          <Stack.Screen
            name="Conexões"
            component={Conexoes}
            options={{
              title: 'Minhas Conexões', 
              animation: 'fade_from_bottom',
              headerTintColor: 'white',
              headerTitleAlign: "center",
              headerStyle: { backgroundColor: "#072e3f"},
              headerTitleStyle: {
                fontFamily: 'Lato_400Regular'
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    )
  } else
  return (
    <NavigationContainer>
      <StatusBar barStyle={'light-content'} backgroundColor={'#072e3f'}></StatusBar>

      <Drawer.Navigator
        screenOptions={{
          drawerStyle: {
            color: 'white'
          },
          drawerLabelStyle: {
            color: 'white',
            fontFamily: 'Lato_700Bold'
          },
          unmountOnBlur: true
        }}
        drawerContent={props => DrawerContent(props)}
      >
        {user?.menuPermissions == undefined ? 
          <Drawer.Screen
            name={'Carregando'}
            component={LoadingScreen}
            options={{
              title: 'Carregando...',
              headerTintColor: 'white',
              headerTitleAlign: "center",
              drawerItemStyle: {
                opacity: 0
              },
              headerStyle: { backgroundColor: "#072e3f"},
              headerTitleStyle: {
                fontFamily: 'Lato_400Regular'
              },
              animation: 'fade_from_bottom',
            }}
          /> 
        : DrawersMenu(user)}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
 
const LoadingScreen = () => {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <ActivityIndicator size={70} color={"#072e3f"} style={styles.Loading}></ActivityIndicator>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});