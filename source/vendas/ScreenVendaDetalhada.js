import { Text, TouchableOpacity, StyleSheet, BackHandler } from "react-native";
import Icon_Ionic from "react-native-vector-icons/Ionicons";
import Grid from "../grid/ComponentGrid";
import { useRef } from "react";
import { View } from "react-native-animatable";
import FormatFloat from "../../functions/FormatFloat";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import { HeaderBackButton } from '@react-navigation/native-stack';

const VendaDetalhada = ({ navigation, route }) => {
  navigation.setOptions({
    title: route.params.title?.emp,
    headerLeft: () => (
      <TouchableOpacity>
        <MaterialIcons
          name="arrow-back-ios"
          style={{ color: "white", fontSize: 20, padding: 5 }}
          onPress={() => { goBack() }}
        ></MaterialIcons>
      </TouchableOpacity>
    )
  })
  BackHandler.addEventListener('hardwareBackPress', () => route.params.firstNavigation.setOptions({ headerShown: true }))

  const goBack = () => {
    navigation.goBack(); 
    route.params.firstNavigation.setOptions({ headerShown: true })
  }

  invisibleColumns = useRef([
    'empresas', 'emp', 'qtdVenO', 'quantidadeO', 'vendaO', 'custoO', 'mkpO', 'tktMedioO', 'precoMedioO', 'qtdVenA', 'custoA', 'tktMedioA', 'precoMedioA', 'cresc'
  ])
  widthColumns = useRef({
    "vendedor": 40,
    "quantidadeA": 20,
    "vendaA": 20,
    "mkpA": 20 
  })
  const renameColumns = useRef({
    "quantidadeA": "qtd",
    "vendaA": "venda",
    "mkpA": "mkp",
  })

  const response = JSON.parse(route.params.data) 

  let totals = response?.totaisEmpresas
  totals = totals?.find((e) => e.emp == route.params.title?.emp)

  let filteredDataSet = response?.vendedores
  filteredDataSet.response = filteredDataSet.response?.filter((e) => e.emp == route.params.title?.emp)
  filteredDataSet.response = filteredDataSet.response.sort((a, b) => b.vendaA - a.vendaA)

  return(
    <View style={{flex: 1}}>
      <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        <View style={{margin: 5}}>
          <Text style={styles.FilteredDates}>Início Atual: {route.params.dataInicioAtual}</Text>
          <Text style={styles.FilteredDates}>Fim Atual: {route.params.dataFimAtual}</Text>
        </View>

        <View style={{margin: 5}}>
          <Text style={styles.FilteredDates}>Início Anterior: {route.params.dataInicioAnterior}</Text>
          <Text style={styles.FilteredDates}>Fim Anterior: {route.params.dataFimAnterior}</Text>
        </View>
      </View>

      <View style={styles.TotalsPanel}>
        <View style={{flex: 1, width: '100%', padding: 12}}>
          <View style={{width: '100%', flexDirection: 'row'}}>
            <View style={{width: '80%'}}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{fontFamily: 'Lato_700Bold', fontSize: 45}}>
                R$ {FormatFloat(totals?.vendaA)}
              </Text>
            </View>

            <View style={{width: '20%', marginLeft: 10, justifyContent: 'center'}}>
              {totals?.cresc < 0 ?
                (
                  <MaterialIcons name="arrow-downward" style={{fontSize: 35, textAlign: "center", color: 'red', marginTop: 5}}></MaterialIcons>
                ) :
                (
                  <MaterialIcons name="arrow-upward" style={{fontSize: 35, textAlign: "center", color: 'green', marginTop: 5}}></MaterialIcons>
                )
              }
            </View>
          </View>

          <View style={{width: '100%', flexDirection: 'row'}}>
            <View style={{width: '80%', flexDirection: 'row', alignItems: "center"}}>
              <Text style={{fontFamily: 'Lato_700Bold'}}>Período Anterior: </Text>
              <Text style={{fontFamily: 'Lato_400Regular'}}>R$ {FormatFloat(totals?.vendaO)}</Text>
            </View>
            <View style={{width: '20%', marginLeft: 10}}>
              <Text style={{fontFamily: 'Lato_400Regular', textAlign: 'center'}}>({FormatFloat(totals?.cresc)})</Text>
            </View>
          </View>
        </View>

        <View style={{flex: 1, width: '100%', flexDirection: 'row', marginTop: 10}}>  
          <View style={{width: '28%'}}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{textAlign: 'center', fontFamily: 'Lato_400Regular'}}>Ticket Médio</Text>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{textAlign: 'center', fontFamily: 'Lato_700Bold'}}>{FormatFloat(totals?.tktMedioA)}</Text>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{textAlign: 'center', fontFamily: 'Lato_700Bold', fontSize: 11}}>{FormatFloat(totals?.tktMedioO)}</Text>
          </View>
          <View style={{width: '29%'}}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{textAlign: 'center', fontFamily: 'Lato_400Regular'}}>Preço Médio</Text>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{textAlign: 'center', fontFamily: 'Lato_700Bold'}}>{FormatFloat(totals?.precomA)}</Text>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{textAlign: 'center', fontFamily: 'Lato_700Bold', fontSize: 11}}>{FormatFloat(totals?.precomO)}</Text>
          </View>
          <View style={{width: '25%'}}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{textAlign: 'center', fontFamily: 'Lato_400Regular'}}>Markup</Text>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{textAlign: 'center', fontFamily: 'Lato_700Bold'}}>{FormatFloat(totals?.mkpA)}</Text>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{textAlign: 'center', fontFamily: 'Lato_700Bold', fontSize: 11}}>{FormatFloat(totals?.mkpO)}</Text>
          </View>
          <View style={{width: '17%'}}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{textAlign: 'center', fontFamily: 'Lato_400Regular'}}>Vendas</Text>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{textAlign: 'center', fontFamily: 'Lato_700Bold'}}>{totals?.qtdVendasA}</Text>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{textAlign: 'center', fontFamily: 'Lato_700Bold', fontSize: 11}}>{totals?.qtdVendasO}</Text>
          </View>
        </View>

        <View style={{width: '100%', height: 30, alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
          <Text style={{fontFamily: 'Lato_400Regular', color: 'gray'}}>Última Atualização: </Text>
          <Text style={{fontFamily: 'Lato_400Regular', color: 'gray'}}>{route.params.updateDate}</Text>
        </View>
      </View>

      <Grid
        dataSet={filteredDataSet}
        activePageControl={false}
        invisibleColumns={invisibleColumns.current}
        widthColumns={widthColumns.current}
        renameColumns={renameColumns.current}
        onRefresh={() => { route.params.onRefresh(); goBack() }}
        sortGrid
      />
    </View>
  )
}

const styles = StyleSheet.create({
  TotalsPanel: {
    width: "95%",
    height: 170,
    backgroundColor: "white",
    borderRadius: 15,
    shadowColor: "#171717",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    margin: 10,
    alignItems: 'center', 
    // justifyContent: 'center'
  },

  FilteredDates: {
    fontFamily: 'Lato_400Regular',
    color: 'gray'
  }
})

export default VendaDetalhada;