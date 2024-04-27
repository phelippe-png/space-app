import { useCallback, useEffect, useRef, useState } from "react";
import ApiHttp from "../ApiHttp";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Grid from "../grid/ComponentGrid";
import { View } from "react-native-animatable";
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity } from "react-native";
import FormatFloat from "../../functions/FormatFloat";
import Modal from "react-native-modal";
import SelectDropdown from "react-native-select-dropdown";
import moment from "moment";
import Icon_Ionic from 'react-native-vector-icons/Ionicons'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ActivityIndicator } from "react-native";
import ShowMessage from "../ShowMessage";
import base64 from "react-native-base64";

const ScreenRecebimentos = ({ navigation, route }) => {
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
  const [response, setResponse] = useState({})
  const [openModal, setOpenModal] = useState(false)
  const [confirmFilter, setConfirmFilter] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const groupBy = useRef(0)
  const selectedData = useRef()
  const dataInicio = useRef(moment().format('DD/MM/YYYY'))
  const dataFinal = useRef(moment().format('DD/MM/YYYY'))
  const updateDate = useRef(moment().format('DD/MM/YYYY HH:mm:ss'))
  const filterType = useRef(0)

  const widthColumnsEmpresas = useRef({
    empresa: 50,
    recebimento: 20,
  })
  const widthColumnsPagamentos = useRef({
    meio: 50,
    inclusao: 20,
    recebimento: 20,
  })
  const renameColumns = useRef({
    inclusao: "inclusão"
  })

  const invisibleColumns = [groupBy.current == 0 ? 'inclusao' : '']

  useEffect(() => {
    const getUser = async () => {
      setUser(JSON.parse(await AsyncStorage.getItem('user')))
    }
    getUser()
  }, [])

  useEffect(() => {
    if(user?.connection?.url != undefined)
      ApiHttp( base64.decode(user?.connection?.url) ).post('/spaceapp/recebimentos', {
        dataInicio: dataInicio.current,
        dataFinal: dataFinal.current,
        user: user?.id
      })
      .then((response) => {
        setResponse(response.data)
        setLoading(false)
        // console.log(JSON.stringify(response.data))
      })
      .catch((error) => {
        console.log("ERRO AO BUSCAR RECEBIMENTOS: "+error)
        setError(true)
        setLoading(false)
      })
  }, [confirmFilter, user])

  let totalInclusao = 0
  let totalRecebimento = 0
  response?.empresas?.response.forEach(e => {
    totalInclusao += e.inclusao
  })
  response?.empresas?.response.forEach(e => {
    totalRecebimento += e.recebimento
  })

  let dataSet = useRef({})
  if (groupBy.current == 0)
    dataSet = response?.empresas 
  else
    dataSet = response?.pagamentos

  const loadingScreen = () => {
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
    }, 500);
  }

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

  const comboBoxChangeFilter = (itemIndex) => {
    let today = new Date()
    let firstDayMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    let firstDayYear = new Date(today.getFullYear(), 0, 1)

    let firstDayWeek = new Date()
    let day = firstDayWeek.getDay() || 7
    if (day != 1) 
      firstDayWeek.setHours(-24 * (day))

    if (itemIndex == 0)
      dataInicio.current = moment().format('DD/MM/YYYY')
    if (itemIndex == 1)
      dataInicio.current = moment(firstDayWeek).format('DD/MM/YYYY')
    if (itemIndex == 2)
      dataInicio.current = moment(firstDayMonth).format('DD/MM/YYYY')
    if (itemIndex == 3) 
      dataInicio.current = moment(firstDayYear).format('DD/MM/YYYY')

    dataFinal.current = moment(today).format('DD/MM/YYYY')

    filterType.current = itemIndex
    setForceUpdate(!forceUpdate)
  }

  const detailRecebimento = useCallback(() => {
    route.params.firstNavigation.setOptions({headerShown: false})

    navigation.navigate("Crediário Detalhado", {
      dataInicio: dataInicio.current,
      dataFinal: dataFinal.current,
      groupedFieldName: Object.keys(dataSet.response[0])[0],
      completeDataSet: JSON.stringify(response?.completeResponse),
      selectedData: selectedData.current,
      updateDate: updateDate.current,
      onRefresh: searchDetailsAPI
    })
  }, [response, dataSet])

  const searchDetailsAPI = useCallback(() => {
    setConfirmFilter(!confirmFilter); 
    setOpenModal(false); 
    setLoading(true); 
    updateDate.current = moment().format('DD/MM/YYYY HH:mm:ss')
  }, [response])

  return(
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
        <View style={{flex: 1, alignItems: "center"}}>
          <View style={{width: '100%', flexDirection: 'row', justifyContent: "center"}}>
            <Text style={{fontFamily: 'Lato_400Regular', color: 'gray', padding: 5}}>Data Inicial: {dataInicio.current}</Text>
            <Text style={{fontFamily: 'Lato_400Regular', color: 'gray', padding: 5}}>Data Final: {dataFinal.current}</Text>
          </View>

          <View style={{width: '90%', flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
            <Text style={{fontFamily: 'Lato_700Bold', marginRight: 10}}>Agrupar</Text>
            <SelectDropdown 
              data={['Por empresa', 'Por meio de pagamento']}
              buttonStyle={{width: '80%', height: 40, backgroundColor: '#DBDFDF', borderRadius: 7}}
              buttonTextStyle={{fontFamily: 'Lato_400Regular', fontSize: 17 }}
              rowTextStyle={{fontFamily: 'Lato_400Regular'}}
              defaultValueByIndex={groupBy.current}
              onSelect={(index, i) => { groupBy.current = i; loadingScreen() }}/>
          </View>

          <View style={styles.totalsPanel}>
            <View style={{marginBottom: 6}}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{fontFamily: 'Lato_700Bold', fontSize: 45}}>R$ {FormatFloat(totalRecebimento)}</Text>
              {groupBy.current != 0 ? <Text style={{fontFamily: 'Lato_700Bold', fontSize: 17}}>Inclusão: R$ {FormatFloat(totalInclusao)}</Text> : <></>}
            </View>

            <View style={{width: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
              <Text style={{fontFamily: 'Lato_400Regular', color: 'gray'}}>Última Atualização: </Text>
              <Text style={{fontFamily: 'Lato_400Regular', color: 'gray'}}>{updateDate.current}</Text>
            </View>
          </View>

          <Grid
            dataSet={dataSet}
            activePageControl={false}
            widthColumns={groupBy.current == 0 ? widthColumnsEmpresas.current : widthColumnsPagamentos.current}
            doubleClick={detailRecebimento}
            selectedData={selectedData}
            renameColumns={renameColumns.current}
            invisibleColumns={invisibleColumns}
            onRefresh={searchDetailsAPI}
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
                      onSelect={(index, i) => { comboBoxChangeFilter(i) }}/>
                  </View>

                  <View style={{margin: 7}}>
                    <Text style={styles.InputLabelsModal}>Data Inicial</Text>
                    {Platform.OS == 'ios' ? 
                      (
                        <DateTimePicker 
                          style={{width: '89%'}}
                          themeVariant="light"
                          locale="pt-BR" 
                          value={moment(dataInicio.current, 'DD/MM/YYYY').toDate()}
                          onChange={(e, date) => { onChangeDatePickerIOS(e, date, dataInicio) }}/>
                      ) : 
                      (
                        <TouchableOpacity onPress={() => ShowDatePickerAndroid(dataInicio.current, dataInicio)} style={styles.DatePickerFilter}>
                          <Text style={{fontFamily: 'Lato_400Regular'}}>{dataInicio.current}</Text>
                        </TouchableOpacity>
                      )
                    }
                  </View>

                  <View style={{margin: 7}}>
                    <Text style={[styles.InputLabelsModal, {paddingLeft: Platform.OS == 'ios' ? 10 : 0}]}>Data Final</Text>
                    {Platform.OS == 'ios' ? 
                      (
                        <DateTimePicker
                          style={{width: '95%'}}
                          themeVariant="light"
                          locale="pt-BR" 
                          value={moment(dataFinal.current, 'DD/MM/YYYY').toDate()}
                          onChange={(e, date) => { onChangeDatePickerIOS(e, date, dataFinal) }}/>
                      ) : 
                      (
                        <TouchableOpacity onPress={() => ShowDatePickerAndroid(dataFinal.current, dataFinal)} style={styles.DatePickerFilter}>
                          <Text style={{fontFamily: 'Lato_400Regular'}}>{dataFinal.current}</Text>
                        </TouchableOpacity>
                      )
                    }
                  </View>
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

  Loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  Modal: {
    width: 300, 
    height: 205, 
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

  InputLabelsModal: {
    fontFamily: "Lato_900Black"
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
})

export default ScreenRecebimentos;