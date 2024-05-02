import { Text, FlatList, View, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useState, memo, useEffect, useRef, createContext, useCallback } from "react";
import { ActivityIndicator } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TextInput } from "react-native";
import FormatFloat from "../../functions/FormatFloat";
import StyleColumn from "./StyleColumnTypes";
import StringIsNumber from "../../functions/StringIsNumber";
import { RefreshControl } from "react-native-gesture-handler";

const Grid = (props) => {
  if (props.dataSet == undefined || props.dataSet['response'] == undefined || props.dataSet['response'] == [])
    return null

  const fieldTypesFloat = useRef(['bcd', 'fmtbcd', 'currency', 'float'])

  // console.log('GRID')

  const refSortGrid = useRef({})
  const dataSetMain = useRef(JSON.stringify(props.dataSet['response']))
  const [showLoading, setShowLoading] = useState(false)
  const quantityPerPage = props.pages == undefined ? 50 : props.pages
  const quantityPages = Math.trunc(props.dataSet['response'].length / quantityPerPage) + 1
  const windowWidth = Dimensions.get('window').width
  const [pagination, setPagination] = useState({
    "currentPage": 1,
    "accumulatorPaginate": 0
  });

  let sortableGrid = props.sortGrid == undefined ? false : true
  let activePageControl = props.activePageControl == undefined ? true : props.activePageControl
  let DataWidthColumn = {}
  let gridWidth = 0;
  let filteredDataSet = props.dataSet['response'].filter((item, index) => index >= pagination.accumulatorPaginate && index < pagination.accumulatorPaginate+quantityPerPage)
  let columns = Object.keys(props.dataSet['response'].length > 0 ? props.dataSet['response'][0] : []);
  
  if (props?.invisibleColumns != undefined && props?.invisibleColumns.length > 0)
    columns = columns?.filter((e) => props.invisibleColumns.indexOf(e) < 0 )

  if (filteredDataSet.length > 0) { 
    if (props?.widthColumns != undefined) {
      Object.keys(props.widthColumns).map((column) => { 
        DataWidthColumn[column] = props.widthColumns[column]
        gridWidth = gridWidth + DataWidthColumn[column]
      })

      if (windowWidth > gridWidth) {
        let incrementWidthColumns = (windowWidth - gridWidth) / Object.keys(props.widthColumns).length
        Object.keys(props.widthColumns).map((column) => {DataWidthColumn[column] = DataWidthColumn[column] + incrementWidthColumns})  
      }
    } else {
      columns.map((column) => {
        var getTextLength = FormatFloat(filteredDataSet.reduce((a, b) => String(a[column]).length >= String(b[column]).length ? a : b)[column])?.toString().replace(',', '').replace('.', '').length
        DataWidthColumn[column] = (getTextLength == undefined ? 0 : getTextLength) * 8
        DataWidthColumn[column] = (DataWidthColumn[column] >= (column.length * 8) ? DataWidthColumn[column] : (column.length * 8)) + 15

        gridWidth = gridWidth + DataWidthColumn[column]
      })

      if (windowWidth > gridWidth) {
        let incrementWidthColumns = (windowWidth - gridWidth) / columns.length
        columns.map((column) => {DataWidthColumn[column] = DataWidthColumn[column] + incrementWidthColumns})  
      }
    }
  }

  Dimensions.addEventListener('change', () => {
    setShowLoading(true)
  })

  useEffect(() => {
    setTimeout(() => {
      setShowLoading(false)
    }, 0);
  }, [showLoading])

  PreviousPage = () => {  
    setPagination({
      "currentPage": pagination.currentPage - 1,
      "accumulatorPaginate": pagination.accumulatorPaginate-quantityPerPage
    })

    setShowLoading(true)
  }

  NextPage = () => {  
    setPagination({
      "currentPage": pagination.currentPage + 1,
      "accumulatorPaginate": pagination.accumulatorPaginate+quantityPerPage
    })

    setShowLoading(true)
  }

  FieldChangePage = () => {
    setPagination({
      "currentPage": pagination.currentPage < 1 || pagination.currentPage > quantityPages ? 1 : pagination.currentPage,
      "accumulatorPaginate": quantityPerPage * (pagination.currentPage - 1)
    })

    setShowLoading(true)
  }

  PageControl = () => {
    if (!activePageControl)
      return null
    else
    return(
      <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 3, borderColor: 'black', borderTopWidth: 0.2}}>
        <TouchableOpacity 
          style={{marginRight: 5, opacity: (pagination.currentPage <= 1 ? 0.3 : 1)}} 
          onPress={() => { PreviousPage() }} 
          disabled={pagination.currentPage <= 1}
        >
          <MaterialIcons name="arrow-back-ios" style={{ fontSize: 20 }}></MaterialIcons>
        </TouchableOpacity>

        <Text>Página</Text>
        <TextInput 
          defaultValue={String(pagination.currentPage)}
          maxLength={5} 
          inputMode={'numeric'}
          onChangeText={(text) => {pagination.currentPage = (text == undefined || text == '' ? 1 : Number(text))}}
          onSubmitEditing={() => FieldChangePage()}
          style={styles.inputPaginate}
        />
        <Text>de {quantityPages}</Text>

        <TouchableOpacity 
          style={{marginLeft: 5, opacity: (pagination.currentPage >= quantityPages ? 0.3 : 1)}} 
          onPress={() => { NextPage() }}
          disabled={pagination.currentPage >= quantityPages}
        >
          <MaterialIcons name="arrow-forward-ios" style={{ fontSize: 20 }}></MaterialIcons>
        </TouchableOpacity>
      </View>
    )
  }

  const SortGrid = (columnName) => {
    if (!sortableGrid)
      return null

    if (refSortGrid.current[columnName] == undefined) {
      props.dataSet['response'] = props.dataSet['response'].sort((a, b) => StringIsNumber(props.dataSet['response'][0][columnName]) ? (a[columnName] - b[columnName]) : (a[columnName] > b[columnName] ? 1 : -1))
      refSortGrid.current = {
        [columnName]: 'ascending'
      }
    } else if (refSortGrid.current[columnName] == 'ascending') {
      props.dataSet['response'] = props.dataSet['response'].sort((a, b) => StringIsNumber(props.dataSet['response'][0][columnName]) ? (b[columnName] - a[columnName]) : (a[columnName] > b[columnName] ? -1 : 1))
      refSortGrid.current = {
        [columnName]: 'descending'
      }
    } else if (refSortGrid.current[columnName] == 'descending') {
      props.dataSet['response'] = JSON.parse(dataSetMain.current)
      refSortGrid.current = {}
    }

    setShowLoading(true)
  }

  const doubleClickRef = useRef(0)
  const doubleClickKeyRefPrevious = useRef({})
  const doubleClickKeyRef = useRef({})
  const doubleClickGrid = (functionExecute, clickedKey) => {
    props.selectedData.current = clickedKey
    doubleClickRef.current += 1
    doubleClickKeyRefPrevious.current = doubleClickKeyRef.current
    doubleClickKeyRef.current = clickedKey

    if (doubleClickRef.current == 2 && doubleClickKeyRefPrevious.current == clickedKey) {
      functionExecute()
    } else {
      setTimeout(() => {
        doubleClickRef.current = 0
      }, 500)
    }
  }

  HeaderGrid = () => {
    return( 
      <View style={styles.containerLineTitleGrid}>
        {columns.map((column) => 
          (
            <TouchableOpacity key={column} style={[{width: DataWidthColumn[column]}, styles.lineTitleGrid]} onPress={() => { SortGrid(column) }}>
              <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.titleGridText}>
                {props?.renameColumns != undefined && props?.renameColumns[column] != undefined ? props?.renameColumns[column] : column}
              </Text>
              {sortableGrid && (refSortGrid.current[column] == 'ascending' || refSortGrid.current[column] == 'descending') ? 
                <MaterialIcons name={refSortGrid.current[column] == 'ascending' ? "arrow-upward" : "arrow-downward"} color={'white'}></MaterialIcons> : 
                <></>
              }
            </TouchableOpacity>
          )
        )}
      </View>
    )
  }

  ContentGrid = ({ item }) => {
    return(
      <TouchableOpacity key={item} style={{flexDirection: "row", backgroundColor: zebrarGrid()}} onPress={() => {props.doubleClick != undefined && doubleClickGrid(props.doubleClick, item)}}>
        {columns.map((column, index) => (
          <View key={index} style={[{width: DataWidthColumn[column]}, styles.lineGridDataSet]}>
            {
              props.drawColumnCell == undefined || props.drawColumnCell.find((element) => element.field == column) == undefined ? 
                <Text 
                  adjustsFontSizeToFit={true} 
                  numberOfLines={1} 
                  style={[styles.gridText, StringIsNumber(item[column]) && {textAlign: 'right'}]}
                >
                  {fieldTypesFloat.current.find((e) => e == props.dataSet['fieldTypes'][column]) != undefined ? FormatFloat(item[column]) : item[column]}
                </Text> 
                : 
                StyleColumn(item[column], props.drawColumnCell.find((element) => element.field == column).styleType)
            }
          </View>
        ))}
      </TouchableOpacity>
    )
  }

  const zebraGridRef = useRef(false)
  const zebrarGrid = () => {
    zebraGridRef.current = !zebraGridRef.current
    if(zebraGridRef.current)
      return '#EDEDED'
    else
      return 'white'
  }
  
  return (
    <View style={{flex: 1}}>
      <ScrollView horizontal>
        <View style={{flex: 1}}>
          <HeaderGrid></HeaderGrid>

          {showLoading ? (
            <View style={{position: 'absolute', width: windowWidth, height: '100%', alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator size={50} color={'#072e3f'}></ActivityIndicator>
            </View>
          ) : ( 
            <FlatList
              data={filteredDataSet}
              renderItem={ContentGrid}
              refreshControl={
                props.onRefresh != undefined &&
                  <RefreshControl onRefresh={props.onRefresh} tintColor={'#072e3f'} colors={['#072e3f']} />
              }
              // ItemSeparatorComponent={() => (<View style={{ height: 0.5, backgroundColor: "#cdcaca" }}></View>)}
              onEndReached={() => isLoading = false}
              ListFooterComponent={load => {}}
            />
          )}
        </View>
      </ScrollView>
      <PageControl></PageControl>
    </View>
  );
};

const styles = StyleSheet.create({
  containerLineTitleGrid: {
    flexDirection: "row",
    backgroundColor: "#072e3f",
    overflow: "hidden"
  },

  titleGridText: {
    fontSize: 10, 
    color: "white",
    fontFamily: "Lato_900Black",
    textTransform: "uppercase",
  },

  gridText: {
    fontSize: 13,
    textTransform: "uppercase",
    fontFamily: "Lato_400Regular"
  },

  lineTitleGrid: {
    paddingTop: 7,
    paddingBottom: 7, 
    borderLeftWidth: 0.4, 
    borderLeftColor: '#cdcaca',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },

  lineGridDataSet: {
    paddingLeft: 3, 
    paddingRight: 3, 
    paddingTop: 7,
    paddingBottom: 7,
    borderLeftWidth: 0.4, 
    borderLeftColor: '#cdcaca',
    justifyContent: "center"
  },

  inputPaginate: {
    width: 50, 
    padding: 2, 
    borderColor: 'black', 
    borderWidth: 0.5, 
    borderRadius: 7,
    marginLeft: 3,
    marginRight: 3
  }
});

export default memo(Grid);
