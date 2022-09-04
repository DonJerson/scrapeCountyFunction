const getCountyIndex=(countyName)=>{
  switch (countyName) {
    case 'Volusia':
      return 'finder.searchAddress(page, address,countyStructure,countyurl)'
      break;
    case 'Marion':
      return 'finder.searchAddress2(page, address,countyStructure,countyurl)'
    default:
      return 'finder.searchAddress2(page, address,countyStructure,countyurl)'
  }
  
}

exports.getCountyIndex = getCountyIndex