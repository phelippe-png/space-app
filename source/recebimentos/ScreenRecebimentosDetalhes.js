import { useRef } from "react";
import Grid from "../grid/ComponentGrid";
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FormatFloat from "../../functions/FormatFloat";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

const ScreenRecebimentosDetalhes = ({ navigation, route }) => {
  navigation.setOptions({
    headerLeft: () => (
      <TouchableOpacity>
        <MaterialIcons
          name="arrow-back-ios"
          style={{ color: "white", fontSize: 20, padding: 5 }}
          onPress={() => { navigation.goBack(); route.params.firstNavigation.setOptions({ headerShown: true }) }}
        ></MaterialIcons>
      </TouchableOpacity>
    )
  })
  BackHandler.addEventListener('hardwareBackPress', () => route.params.firstNavigation.setOptions({ headerShown: true }))

  let groupedFieldName = route.params.groupedFieldName
  const invisibleColumns = useRef(['idCadEmpresa', 'idPagamento', 'empresas', 'pagamentos', groupedFieldName])
  const widthColumns = useRef({
    [groupedFieldName == 'empresa' ? 'meio' : 'empresa']: 40,
    inclusao: 20,
    recebimento: 20,
  })
  const renameColumns = useRef({
    inclusao: "inclusão"
  })

  let completeDataSet = useRef()
  completeDataSet = JSON.parse(route.params.completeDataSet)
  completeDataSet.response = completeDataSet.response.filter((e) => e[groupedFieldName] == route.params.selectedData[groupedFieldName])

  let totalInclusao = 0
  let totalRecebimento = 0
  completeDataSet.response.forEach(e => {
    totalInclusao += e.inclusao
  });
  completeDataSet.response.forEach(e => {
    totalRecebimento += e.recebimento
  });

  const goBack = () => {
    navigation.goBack(); 
    route.params.firstNavigation.setOptions({ headerShown: true })
  }

  return (
    <View style={{flex: 1}}>
      <View style={{width: '100%', flexDirection: 'row', justifyContent: "center"}}>
        <Text style={{fontFamily: 'Lato_400Regular', color: 'gray', padding: 5}}>Data Inicial: {route.params.dataInicio}</Text>
        <Text style={{fontFamily: 'Lato_400Regular', color: 'gray', padding: 5}}>Data Final: {route.params.dataFinal}</Text>
      </View>

      <View style={{width: '100%', alignItems: 'center', justifyContent: "center"}}>
        <Text style={{fontFamily: 'Lato_400Regular', color: 'gray'}}>Agrupado por: {groupedFieldName == 'meio' ? 'MEIO DE PAGAMENTO' : groupedFieldName.toUpperCase()}</Text>
        <Text style={{fontFamily: 'Lato_400Regular', color: 'gray'}}>Selecionado: {route.params.selectedData[groupedFieldName]}</Text>
      </View>

      <View style={styles.totalsPanel}>
        <View style={{marginBottom: 6}}>
          <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{fontFamily: 'Lato_700Bold', fontSize: 45}}>R$ {FormatFloat(totalRecebimento)}</Text>
          <Text style={{fontFamily: 'Lato_700Bold', fontSize: 17}}>Inclusão: R$ {FormatFloat(totalInclusao)}</Text>
        </View>

        <View style={{width: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
          <Text style={{fontFamily: 'Lato_400Regular', color: 'gray'}}>Última Atualização: </Text>
          <Text style={{fontFamily: 'Lato_400Regular', color: 'gray'}}>{route.params.updateDate}</Text>
        </View>
      </View>

      <Grid
        activePageControl={false}
        dataSet={completeDataSet}
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
  totalsPanel: {
    width: "95%",
    height: 110,
    backgroundColor: "white",
    borderRadius: 15,
    shadowColor: "#171717",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    margin: 10,
    alignItems: 'center',
    justifyContent: "center"
  },
})

export default ScreenRecebimentosDetalhes;