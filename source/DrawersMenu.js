import { createDrawerNavigator } from "@react-navigation/drawer";
import ScreenVendas from "./vendas/ScreenVendas";
import ScreenRecebimentos from "./recebimentos/ScreenRecebimentos";
import VendaDetalhada from "./vendas/ScreenVendaDetalhada";
import ScreenRecebimentosDetalhes from "./recebimentos/ScreenRecebimentosDetalhes";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import ApiHttp from "./ApiHttp";
import base64 from "react-native-base64";
import { View } from "react-native";
import { Text } from "react-native";
import ScreenConsultaProduto from "./consultaProduto/ScreenConsultaProduto";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default DrawersMenu = (user) => {
  const drawersMenu = [
    {
      title: 'Vendas',
      name: 'vendas',
      component: Vendas,
      permissionFormName: 'consultavenda',
      tipoFormName: 'SpaceApp'
    },
    {
      title: 'Crediário',
      name: 'crediario',
      component: Recebimentos,
      permissionFormName: 'contasreceber',
      tipoFormName: 'SpaceApp'
    },
    {
      title: 'Consulta Produto',
      name: 'consultaproduto',
      component: ConsultaProduto,
      permissionFormName: 'listproduto',
      tipoFormName: 'SpaceApp'
    }
  ]

  let drawers = []
  drawersMenu.forEach(e => {
    let permissionMenu = user?.menuPermissions.find((item) => item.formulario == e.permissionFormName && item.tipo == e.tipoFormName)

    if (permissionMenu?.permissao) {
      drawers.push(
        <Drawer.Screen
          name={e.name}
          component={e.component}
          options={{
            title: e.title,
            headerTintColor: 'white',
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: "#072e3f"},
            animation: 'fade_from_bottom',
            headerTitleStyle: {
              fontFamily: 'Lato_400Regular'
            },
          }}
        />
      )
    }
  })

  if (drawers.length == 0) {
    drawers.push(
      <Drawer.Screen
        name={'Sem permissão'}
        component={NotPermission}
        options={{
          title: '',
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
    )
  }

  return drawers
}

const Vendas = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ScreenVendas"
        component={ScreenVendas}
        options={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: false
        }}
        initialParams={{
          firstNavigation: navigation
        }}
      />
      <Stack.Screen
        name="Venda Detalhada"
        component={VendaDetalhada}
        options={{
          headerTintColor: 'white',
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#072e3f"},
          headerTitleStyle: {
            fontFamily: 'Lato_400Regular'
          },
          animation: 'fade_from_bottom',
          gestureEnabled: false
        }}
        initialParams={{
          firstNavigation: navigation
        }}
      />
    </Stack.Navigator>
  )
}

const Recebimentos = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ScreenRecebimentos"
        component={ScreenRecebimentos}
        options={{
          headerShown: false,
          animation: 'fade_from_bottom',
          gestureEnabled: false
        }}
        initialParams={{
          firstNavigation: navigation
        }}
      />
      <Stack.Screen
        name="Crediário Detalhado"
        component={ScreenRecebimentosDetalhes}
        options={{
          headerTintColor: 'white',
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: "#072e3f"},
          headerTitleStyle: {
            fontFamily: 'Lato_400Regular'
          },
          animation: 'fade_from_bottom',
          gestureEnabled: false
        }}
        initialParams={{
          firstNavigation: navigation
        }}
      />
    </Stack.Navigator>
  )
}

const ConsultaProduto = ({ navigation }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ScreenConsultaProduto"
        component={ScreenConsultaProduto}
        options={{
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      />
    </Stack.Navigator>
  )
}

const NotPermission = () => {
  return(
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text style={{fontSize: 20, fontFamily: 'Lato_700Bold', textAlign: 'center'}}>VOCÊ NÃO POSSUI PERMISSÃO PARA ACESSAR AS TELAS DO APLICATIVO</Text>
    </View>
  )
}