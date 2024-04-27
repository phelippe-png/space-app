import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform
} from "react-native";
import Icon_Ionic from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ApiHttp from "../ApiHttp";
import Grid from "../grid/ComponentGrid";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Modal from "react-native-modal";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from "moment/moment";
import ShowMessage from "../ShowMessage";
import SelectDropdown from "react-native-select-dropdown";
import FormatFloat from "../../functions/FormatFloat";
import AsyncStorage from "@react-native-async-storage/async-storage";
import base64 from "react-native-base64";

const ScreenVendas = ({ navigation, route }) => {
  route.params.firstNavigation.setOptions({
    headerRight: () => (
      <TouchableOpacity>
        <Icon_Ionic
          name="filter"
          style={{ color: "white", fontSize: 25, marginRight: 10, padding: 8 }}
          onPress={() => setOpenModal(true)}
        ></Icon_Ionic>
      </TouchableOpacity>
    ),
  });

  const [user, setUser] = useState({})  
  useEffect(() => { 
    const getUser = async () => {
      setUser(JSON.parse(await AsyncStorage.getItem('user')))
    }
    getUser()
  }, [])

  const drawColumnCell = useRef([
    {
      "field": "cresc",
      "styleType": "negativePositiveValue"
    }
  ])
  const widthColumnsEmpresas = useRef({
    "emp": 10,
    "quantidadeA": 1,
    "vendaA": 50,
    "mkpA": 10,
    "vendaO": 50,
    "cresc": 30
  })
  const widthColumnsVendedores = useRef({
    "vendedor": 10,
    "quantidadeA": 1,
    "vendaA": 50,
    "mkpA": 10
  })
  const renameColumns = useRef({
    "quantidadeA": "qtd",
    "vendaA": "venda",
    "mkpA": "mkp",
    "vendaA": "atual",
    "vendaO": "anterior",
  })

  const invisibleColumns = useRef([
    'empresas', 'emp', 'qtdVenA', 'custoA', 'tktMedioA', 'precoMedioA', 'qtdVenO', 'quantidadeO', 'custoO', 'mkpO', 'tktMedioO', 'precoMedioO', 'vendaO', 'cresc'
  ])

  const [forceUpdate, setForceUpdate] = useState(true)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [response, setResponse] = useState();
  const [openModal, setOpenModal] = useState(false)
  const [confirmFilter, setConfirmFilter] = useState(false)
  const dataInicioAtual = useRef(moment().format('DD/MM/YYYY'))
  const dataFimAtual = useRef(moment().format('DD/MM/YYYY'))
  const dataInicioAnterior = useRef(moment().format('DD/MM/YYYY'))
  const dataFimAnterior = useRef(moment().format('DD/MM/YYYY'))
  const updateDate = useRef(moment().format('DD/MM/YYYY HH:mm:ss'))
  const filterType = useRef(0)
  const groupFilter = useRef(0)
  const totals = response?.totais
  const selectedDataGrid = useRef()

  useEffect(() => {
    comboBoxFilter(0)
  }, [])

  useEffect(() => {
    if (user?.connection?.url != undefined)
      ApiHttp( base64.decode(user?.connection?.url) ).post("/spaceapp/vendas", {
        dataInicioAtual: dataInicioAtual.current,
        dataFimAtual: dataFimAtual.current,
        dataInicioAnterior: dataInicioAnterior.current,
        dataFimAnterior: dataFimAnterior.current,
        user: user?.id
      }).then((response) => { 
          setResponse(response.data); 
          setLoading(false); 
          // console.log('CHAMOU') 
        })
        .catch((err) => {
          setError(true)
          setLoading(false)
          console.log("Erro ao se conectar a API: " + err)
        });
  }, [confirmFilter, user]);

  if (response?.empresas?.response.length == 1)  
    groupFilter.current = 1

  const ShowDatePickerAndroid = (date, refDate) => {
    DateTimePickerAndroid.open({
      value: moment(date, 'DD/MM/YYYY').toDate(),
      onChange: (event, selectedDate) => {
        refDate.current = moment(selectedDate).format('DD/MM/YYYY')
        setForceUpdate(!forceUpdate)
      }
    })
  }

  const onChangeDatePickerIOS = (event, selectedDate, refDate) => {
    if (event.type == 'set')  
      refDate.current = moment(selectedDate).format('DD/MM/YYYY')
  }

  const comboBoxFilter = (itemIndex) => {
    let currentStartDate
    let currentEndDate
    let previousStartDate
    let previousEndDate

    let today = new Date()
    let firstDayMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    let firstDayYear = new Date(today.getFullYear(), 0, 1)

    let firstDayWeek = new Date()
    let day = firstDayWeek.getDay() || 7
    if (day != 1) 
      firstDayWeek.setHours(-24 * (day))

    if (itemIndex == 0)
      currentStartDate = moment().format('DD/MM/YYYY')
    if (itemIndex == 1)
      currentStartDate = moment(firstDayWeek).format('DD/MM/YYYY')
    if (itemIndex == 2)
      currentStartDate = moment(firstDayMonth).format('DD/MM/YYYY')
    if (itemIndex == 3) 
      currentStartDate = moment(firstDayYear).format('DD/MM/YYYY')

    currentEndDate = moment(today).format('DD/MM/YYYY')

    let date = moment(currentStartDate, 'DD/MM/YYYY').toDate()
    date.setDate(date.getDate() - 365)
    previousStartDate = moment(date).format('DD/MM/YYYY')

    date = moment(currentEndDate, 'DD/MM/YYYY').toDate()
    date.setDate(date.getDate() - 365)
    previousEndDate = moment(date).format('DD/MM/YYYY')

    //inicio
    let currentStart = moment(currentStartDate, 'DD/MM/YYYY').toDate()
    let previousStart = moment(previousStartDate, 'DD/MM/YYYY').toDate()
    if (currentStart.getDay()+1 > previousStart.getDay()+1 && itemIndex != 2 && itemIndex != 3) {
      let result = (currentStart.getDay()+1) - (previousStart.getDay()+1)
      previousStart.setDate(previousStart.getDate() + result)
    }
    if (currentStart.getDay()+1 < previousStart.getDay()+1 && itemIndex != 2 && itemIndex != 3) {
      previousStart.setDate(previousStart.getDate() + currentStart.getDay()+1)
    }

    //fim
    let currentEnd = moment(currentEndDate, 'DD/MM/YYYY').toDate()
    let previousEnd = moment(previousEndDate, 'DD/MM/YYYY').toDate()
    if (currentEnd.getDay()+1 > previousEnd.getDay()+1 && itemIndex != 2 && itemIndex != 3) {
      let result = (currentEnd.getDay()+1) - (previousEnd.getDay()+1)
      previousEnd.setDate(previousEnd.getDate() + result)
    }
    if (currentEnd.getDay()+1 < previousEnd.getDay()+1 && itemIndex != 2 && itemIndex != 3) {
      previousEnd.setDate(previousEnd.getDate() + currentEnd.getDay()+1)
    }

    dataInicioAtual.current = moment(currentStart).format('DD/MM/YYYY')
    dataFimAtual.current = moment(currentEnd).format('DD/MM/YYYY')
    dataInicioAnterior.current = moment(previousStart).format('DD/MM/YYYY')
    dataFimAnterior.current = moment(previousEnd).format('DD/MM/YYYY')

    filterType.current = itemIndex
    setForceUpdate(!forceUpdate)
  }

  const detailVenda = useCallback(() => {
    route.params.firstNavigation.setOptions({ headerShown: false })

    navigation.navigate("Venda Detalhada", {
      title: selectedDataGrid.current,
      data: JSON.stringify(response),
      dataInicioAtual: dataInicioAtual.current,
      dataInicioAnterior: dataInicioAnterior.current,
      dataFimAtual: dataFimAtual.current,
      dataFimAnterior: dataFimAnterior.current,
      updateDate: updateDate.current,
      onRefresh: searchDetailsAPI,
      forceUpdateLastScreen: forceUpdate,
      setForceUpdateLastScreen: setForceUpdate
    })
  }, [response])

  let responseDataEmpresas = response?.empresas?.response
  if (responseDataEmpresas != undefined) {
    responseDataEmpresas = responseDataEmpresas.sort((a, b) => b.vendaA - a.vendaA)
    response.empresas.response = responseDataEmpresas
  }
  let responseDataVendedores = response?.vendedores?.response
  if (responseDataVendedores != undefined) {
    responseDataVendedores = responseDataVendedores.sort((a, b) => b.vendaA - a.vendaA)
    response.vendedores.response = responseDataVendedores
  }

  const searchDetailsAPI = useCallback(() => {
    setConfirmFilter(!confirmFilter)
    setOpenModal(false)
    setLoading(true)
    updateDate.current = moment().format('DD/MM/YYYY HH:mm:ss')
  }, [response])

  return (
    <View style={{flex: 1}}>
      {error && 
        <ShowMessage 
          text={'ERRO AO CONECTAR NO SERVIDOR!'} 
          messageType={'error'}
          onClick={() => { setError(false); setConfirmFilter(!confirmFilter); setLoading(true) }}
        />
      }
      {loading ? (
        <ActivityIndicator size={50} color={"#072e3f"} style={styles.Loading}></ActivityIndicator>
      ) : (
        <View style={{flex: 1}}>
          <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <View style={{margin: 5}}>
              <Text style={styles.FilteredDates}>Início Atual: {dataInicioAtual.current}</Text>
              <Text style={styles.FilteredDates}>Fim Atual: {dataFimAtual.current}</Text>
            </View>

            <View style={{margin: 5}}>
              <Text style={styles.FilteredDates}>Início Anterior: {dataInicioAnterior.current}</Text>
              <Text style={styles.FilteredDates}>Fim Anterior: {dataFimAnterior.current}</Text>
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
                    (<MaterialIcons name="arrow-downward" style={{fontSize: 35, textAlign: "center", color: 'red', marginTop: 5}}></MaterialIcons>) 
                    :
                    (<MaterialIcons name="arrow-upward" style={{fontSize: 35, textAlign: "center", color: 'green', marginTop: 5}}></MaterialIcons>)
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
              <Text style={{fontFamily: 'Lato_400Regular', color: 'gray'}}>{updateDate.current}</Text>
            </View>
          </View>

          <Grid 
            drawColumnCell={drawColumnCell.current}
            dataSet={groupFilter.current == 0 ? response?.empresas : response?.vendedores}
            activePageControl={groupFilter.current == 0 ? false : true}
            widthColumns={groupFilter.current == 0 ? widthColumnsEmpresas.current : widthColumnsVendedores.current}
            doubleClick={groupFilter.current == 0 ? detailVenda : undefined}
            selectedData={selectedDataGrid}
            renameColumns={renameColumns.current}
            onRefresh={searchDetailsAPI}
            invisibleColumns={groupFilter.current == 0 ? undefined : invisibleColumns.current}
            sortGrid
          />

          <Modal isVisible={openModal} animationOutTiming={200} useNativeDriverForBackdrop={true} useNativeDriver={true}>
            <SafeAreaView style={{flex: 1, alignItems: "center", justifyContent: "center", fontFamily: "Lato_400Regular"}}>
              <View style={styles.Modal}> 
                <SafeAreaView style={{flexDirection: "row", justifyContent: "center", flexWrap: 'wrap'}}>
                  <View style={{width: '90%', margin: 7}}>
                    <Text style={styles.InputLabelsModal}>Filtros</Text>
                    <SelectDropdown 
                      data={['Hoje', 'Esta semana', 'Este mês', 'Este ano']}
                      buttonStyle={{width: '100%', height: 40, backgroundColor: Platform.OS == 'ios' ? '#EDEDED' : '#DBDFDF', borderRadius: 7}}
                      buttonTextStyle={{fontFamily: 'Lato_400Regular', fontSize: 17 }}
                      rowTextStyle={{fontFamily: 'Lato_400Regular'}}
                      defaultValueByIndex={filterType.current}
                      onSelect={(index, i) => { comboBoxFilter(i) }}/>
                  </View>

                  <View style={[styles.datesPickers, {margin: 7}]}>
                    <Text style={styles.InputLabelsModal}>Início atual</Text>
                    {Platform.OS == 'ios' ? 
                      (
                        <DateTimePicker 
                          style={{width: '85%'}} 
                          themeVariant="light"
                          locale="pt-BR" 
                          value={moment(dataInicioAtual.current, 'DD/MM/YYYY').toDate()}
                          onChange={(e, date) => { onChangeDatePickerIOS(e, date, dataInicioAtual) }}/>
                      ) : 
                      (
                        <TouchableOpacity onPress={() => { ShowDatePickerAndroid(dataInicioAtual.current, dataInicioAtual) }} style={styles.DatePickerFilter}>
                          <Text style={{fontFamily: 'Lato_400Regular'}} >{dataInicioAtual.current}</Text>
                        </TouchableOpacity>
                      )
                    }

                  </View>

                  <View style={[styles.datesPickers, {margin: 7, }]}>
                    <Text style={[styles.InputLabelsModal, {paddingLeft: Platform.OS == 'ios' ? 10 : 0}]}>Início anterior</Text>
                    {Platform.OS == 'ios' ? 
                      (
                        <DateTimePicker 
                          style={{width: '95%'}}
                          themeVariant="light"
                          locale="pt-BR" 
                          value={moment(dataInicioAnterior.current, 'DD/MM/YYYY').toDate()}
                          onChange={(e, date) => { onChangeDatePickerIOS(e, date, dataInicioAnterior) }}/>
                      ) : 
                      (
                        <TouchableOpacity onPress={() => ShowDatePickerAndroid(dataInicioAnterior.current, dataInicioAnterior)} style={styles.DatePickerFilter}>
                          <Text style={{fontFamily: 'Lato_400Regular'}}>{dataInicioAnterior.current}</Text>
                        </TouchableOpacity>
                      )
                    }
                  </View>

                  <View style={{margin: 7}}>
                    <Text style={styles.InputLabelsModal}>Fim atual</Text>
                    {Platform.OS == 'ios' ? 
                      (
                        <DateTimePicker 
                          style={{width: '85%'}}
                          themeVariant="light"
                          locale="pt-BR" 
                          value={moment(dataFimAtual.current, 'DD/MM/YYYY').toDate()}
                          onChange={(e, date) => { onChangeDatePickerIOS(e, date, dataFimAtual) }}/>
                      ) : 
                      (
                        <TouchableOpacity onPress={() => ShowDatePickerAndroid(dataFimAtual.current, dataFimAtual)} style={styles.DatePickerFilter}>
                          <Text style={{fontFamily: 'Lato_400Regular'}}>{dataFimAtual.current}</Text>
                        </TouchableOpacity>
                      )
                    }
                  </View>

                  <View style={{margin: 7}}>
                    <Text style={[styles.InputLabelsModal, {paddingLeft: Platform.OS == 'ios' ? 10 : 0}]}>Fim anterior</Text>
                    {Platform.OS == 'ios' ? 
                      (
                        <DateTimePicker 
                          style={{width: '95%'}}
                          themeVariant="light"
                          locale="pt-BR" 
                          value={moment(dataFimAnterior.current, 'DD/MM/YYYY').toDate()}
                          onChange={(e, date) => { onChangeDatePickerIOS(e, date, dataFimAnterior) }}/>
                      ) : 
                      (
                        <TouchableOpacity onPress={() => ShowDatePickerAndroid(dataFimAnterior.current, dataFimAnterior)} style={styles.DatePickerFilter}>
                          <Text style={{fontFamily: 'Lato_400Regular'}}>{dataFimAnterior.current}</Text>
                        </TouchableOpacity>
                      )
                    }
                  </View>
                </SafeAreaView>

                <SafeAreaView style={{width: '100%', alignItems: "center"}}>
                  <Text style={[styles.InputLabelsModal, {width: '93%'}]}>Agrupar por</Text>
                  <SelectDropdown 
                    data={['Empresas', 'Vendedores']}
                    buttonStyle={{width: '93%', height: 40, backgroundColor: Platform.OS == 'ios' ? '#EDEDED' : '#DBDFDF', borderRadius: 7}}
                    buttonTextStyle={{fontFamily: 'Lato_400Regular', fontSize: 17 }}
                    rowTextStyle={{fontFamily: 'Lato_400Regular'}}
                    defaultValueByIndex={groupFilter.current}
                    onSelect={(index, i) => { groupFilter.current = i }}
                  />
                </SafeAreaView>


                <SafeAreaView style={{flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "center"}}>
                  <TouchableOpacity style={styles.ActionButtonsModal} onPress={() => { searchDetailsAPI() }}>
                    <Text style={{color: 'white', fontFamily: 'Lato_900Black'}}>CONFIRMAR</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setOpenModal(false)} style={styles.ActionButtonsModal}>
                    <Text style={{color: 'white', fontFamily: 'Lato_900Black'}}>CANCELAR</Text>
                  </TouchableOpacity>
                </SafeAreaView>
              </View>
            </SafeAreaView>
          </Modal>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ViewFilterButton: {
    width: "100%",
    alignItems: "flex-end",
    position: "absolute",
  },

  FilterButton: {
    backgroundColor: "#072e3f",
    width: 60,
    height: 60,
    borderRadius: 50,
    margin: 7,
    alignItems: "center",
    justifyContent: "center",
    shadowRadius: 5,
    shadowOpacity: 3,
    shadowRadius: 3,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    elevation: 12,
  },

  Loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  Modal: {
    width: 300, 
    height: 323, 
    backgroundColor: 'white', 
    borderRadius: 15, 
    elevation: 12
  },

  ActionButtonsModal: {
    width: 123,
    height: 40,
    backgroundColor: '#072e3f',
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    margin: 15,
  },

  DatePickerFilter: {
    // borderWidth: 1, 
    // borderColor: 'gray',
    backgroundColor: '#DBDFDF',
    width: 130,
    height: 30,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center"
  },

  InputLabelsModal: {
    fontFamily: "Lato_900Black"
  },

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
  },

  datesPickers: {
    
  }
});

export default ScreenVendas;
