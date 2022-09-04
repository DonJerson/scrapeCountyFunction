const chromium = require('chrome-aws-lambda'); 
const puppeteer = chromium.puppeteer;
const axios = require('axios'); 
const finder = require('./Functions/finder.js');

let property
exports.sleep = (ms) =>{
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
exports.run=async function(attributes,page,countyStructure){
  let property = {}
  let attrListComplex=attributes
  for(let i=0;i<attrListComplex.length;i++){
    let attr= attrListComplex[i];
    if(attr.single){
      let holder = await exports.getFeature(page,attr.attribute,countyStructure[attr.attribute])
      try {
        if(attr.integer && parseInt(holder)>0){
        //delete all non-numeric characters
          property[attr.attribute]=parseInt(holder.replace(/[^0-9]/g, ''))
        }else{
          property[attr.attribute]=holder
        }
        } catch (error) {
          property[attr.attribute]=holder
        }
           
    }else{
      let holder = await exports.getFeatures(page,attr.attribute,countyStructure[attr.attribute])
      console.log(holder,"holder")
      property[attr.attribute]=holder
    }
    
}return property}

exports.getFeatures = async (page,feature,searchTerm) => {
  let features =[]
  let featureVal
  let featureEls = await page.$x(`//div[contains(.,'${searchTerm}')]`);
  let featureTds = await page.$x(`//tr[contains(.,'${searchTerm}')]`);
  let featureBs = await page.$x(`//b[contains(.,'${searchTerm}')]`);
  let mergedEls = featureEls.concat(featureTds).concat(featureBs)
  for (let i = 0; i < mergedEls.length; i++) {
    const element = mergedEls[i];
    const elementText = (await element.getProperty('textContent'))._remoteObject.value
    if(elementText.includes(searchTerm) && elementText.length<500){
      let field = (await element.getProperty('textContent'))._remoteObject.value.replace(/^\s*$(?:\r\n?|\n)/gm, "").replace(/\s+/g, "")
      try {
        if(field.includes(':')){
        featureVal = field.split(':')[1]
        }else{
          featureVal = field
        }
      } catch (error) {
        console.log("bobito porch")
      }
    
      console.log('found '+feature+' '+featureVal)
      features.push(featureVal)
  }
  }
  return features
}

exports.getFeature = async (page,feature,searchTerm) => {
  let featureVal
  console.log("searching for "+feature)
  let featureEls = await page.$x(`//div[contains(.,'${searchTerm}')]`);
  let featureTds = await page.$x(`//tr[contains(.,'${searchTerm}')]`);
  let featureBs = await page.$x(`//b[contains(.,'${searchTerm}')]`);
  let mergedEls = featureEls.concat(featureTds).concat(featureBs)
  console.log(featureTds.length, "featureTds.length",feature);
  console.log(featureEls.length, "featureEls.length",feature);

  for (let i = 0; i < mergedEls.length; i++) {
  const element = mergedEls[i];
  const elementText = (await element.getProperty('textContent'))._remoteObject.value
  if(elementText.includes(searchTerm) && elementText.length<500){
    let field = (await element.getProperty('textContent'))._remoteObject.value.replace(/^\s*$(?:\r\n?|\n)/gm, "").replace(/\s+/g, "")
    try {
      if(field.includes(':')){
      featureVal = field.split(':')[1]
      }else{
        featureVal = field
      }
    } catch (error) {
      console.log("bobito porch")
    }
  
    console.log('found '+feature+' '+featureVal)
    return featureVal
  }
  }
  // if (featureEls.length > 0) {
  // for (let i = 0; i < featureEls.length; i++) {
  //   const element = featureEls[i];
  //   const elementText = (await element.getProperty('textContent'))._remoteObject.value
  //   if(elementText.includes(searchTerm) && elementText.length<500){
  //     let field = (await element.getProperty('textContent'))._remoteObject.value.replace(/^\s*$(?:\r\n?|\n)/gm, "").replace(/\s+/g, "")
  //     try {
  //       if(field.includes(':')){
  //       featureVal = field.split(':')[1]
  //       }else{
  //         featureVal = field
  //       }
  //     } catch (error) {
  //       console.log("bobito porch")
  //     }
    
  //     console.log('found '+feature+' '+featureVal)
  //     return featureVal
  // }
  // }
  // }else{
  //   for (let i = 0; i < featureTds.length; i++) {
  //     const element = featureTds[i];
  //     const elementText = (await element.getProperty('textContent'))._remoteObject.value
      
  //     if(elementText.includes(searchTerm) && elementText.length<500){
  //       let field = (await element.getProperty('textContent'))._remoteObject.value.replace(/^\s*$(?:\r\n?|\n)/gm, "").replace(/\s+/g, "")
  //       try {
  //         if(field.includes(':')){
  //         featureVal = field.split(':')[1]
  //         }else{
  //           featureVal = field
  //         }
  //         console.log('found '+feature+' '+featureVal)
  //       } catch (error) {
  //         console.log("bobito porch")
  //       }
      
        
  //       return featureVal
  //   }else{
  //   }
  //   }
  // }
  return featureVal
}

exports.findInnerText= async (page, selector,list) => {
  console.log(list.length, "list length");
  for(let i = 0; i < list.length; i++){
    const input = list[i];
    const inputId = (await input.getProperty('id'))._remoteObject.value
    const inputType = (await input.getProperty('type'))._remoteObject.value
    const inputValue = (await input.getProperty('value'))._remoteObject.value
    const inputContent = (await input.getProperty('textContent'))._remoteObject.value
  
    if((inputContent.includes(selector))){
      console.log('found text input',inputId)
      console.log(inputContent,"inputContent")
      input.focus();
      await sleep(100);
      await page.keyboard.type('534 N Florida Ave');
      break;
    }
    //console.log(inputId)
  }
}

exports.searchClient = async (page) => {
  await page.goto('https://vcpa.vcgov.org/search/real-property#gsc.tab=0');

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36');
  page.setViewport({ width: 1499, height: 1000 });
  


  //find all input elements
  let inputs = await page.$$('input');
  let teteo =await page.evaluate('document.querySelector("input").getAttribute("id")')
  //searchwordspool
  let searchwordspool = ['search','srch'];
  //print input id
  console.log(inputs.length);
  let inputId
  let inputType
  for(let i = 0; i < inputs.length; i++){
    const input = inputs[i];
    inputId = (await input.getProperty('id'))._remoteObject.value
    inputType = (await input.getProperty('type'))._remoteObject.value
    if((inputId.includes('search') || inputType.includes('search'))&& inputType!='hidden'){
      console.log('found search input',inputId)
      input.focus();
      await sleep(100);
      await page.keyboard.type('534 N Florida Ave');
      break;
    }
    //console.log(inputId)
  }
  await page.keyboard.press('Enter');
  await sleep(1000);
  const address = '534 N Florida Ave';
  //find div that containes the address in its text content
  const [addressel] = await page.$x("//td[contains(., '534 N')]");
  // const el = await page.waitForFunction(
  //   'document.querySelector("body").innerText.includes("534 N Florida Ave")'
  // );
  //await page.click('#2214376');
  //Assess html page and determine current step
  //let html = await page.content();
  await addressel.click()
  const [button] = await page.$x("//button[contains(., 'Parcel')]");
  await button.click();
  //await wait page to load networkidle2
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
}
exports.type = (function(global) {
  var cache = {};
  return function(obj) {
      var key;
      return obj === null ? 'null' // null
          : obj === global ? 'global' // window in browser or global in nodejs
          : (key = typeof obj) !== 'object' ? key // basic: string, boolean, number, undefined, function
          : obj.nodeType ? 'object' // DOM element
          : cache[key = ({}).toString.call(obj)] // cached. date, regexp, error, object, array, math
          || (cache[key] = key.slice(8, -1).toLowerCase()); // get XXXX from [object XXXX], and cache it
  };
}(this));

exports.findNode = async (page, selector) => {
  const node = await page.$(selector);
  if (node) {
    return node;
  }
  return null;
}

//Create a function that finds the nearest input element to the given node
//find x and y distance between two nodes

exports.findElements = async (page, selector) => {
  const elements = await page.$x(`//*[contains(text(),"${selector}")]`);
  console.log(elements.length,"elements length")
  return elements;
}
exports.findInput = async (page, keyWord) => {
  const inputs = await page.$x('//input');
  let distance = 0;
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const inputId = (await input.getProperty('id'))._remoteObject.value
    const inputType = (await input.getProperty('type'))._remoteObject.value
    const inputValue = (await input.getProperty('value'))._remoteObject.value
    const inputContent = (await input.getProperty('textContent'))._remoteObject.value
    if((inputContent.includes(keyWord))){
      console.log('found text input',inputId)
      console.log(inputContent,"inputContent")
      return input;
    }
    else if(inputId.includes(keyWord)){
      console.log('found text input',inputId)
      console.log(inputContent,"inputContent")
      return input;
    }
    else if(inputType.includes(keyWord)){
      console.log('found text input',inputId)
      console.log(inputContent,"inputContent")
      return input;
    }
    else if(inputValue.includes(keyWord)){
      console.log('found text input',inputId)
      console.log(inputContent,"inputContent")
      return input;
    }
    else if(inputContent.includes(keyWord)){
      console.log('found text input',inputId)
      console.log(inputContent,"inputContent")
      return input;
    }
  }
  const labels = await page.$x('//label[contains(text(),"' + keyWord + '")]');
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const labelId = (await label.getProperty('id'))._remoteObject.value
    const labelType = (await label.getProperty('type'))._remoteObject.value
    const labelValue = (await label.getProperty('value'))._remoteObject.value
    const labelContent = (await label.getProperty('textContent'))._remoteObject.value
    if((labelContent.includes(keyWord))){
      console.log('found text input',labelId)
      console.log(labelContent,"labelContent")
      return label;
    }
    else if(labelId.includes(keyWord)){
      console.log('found text input',labelId)
      console.log(labelContent,"labelContent")
      return label;
    }
    else if(labelType.includes(keyWord)){
      console.log('found text input',labelId)
      console.log(labelContent,"labelContent")
      return label;
    }
    else if(labelValue.includes(keyWord)){
      console.log('found text input',labelId)
      console.log(labelContent,"labelContent")
      return label;
    }
    else if(labelContent.includes(keyWord)){
      console.log('found text input',labelId)
      console.log(labelContent,"labelContent")
      return label;
    }
  }
}

// Create a function called grandParent that gets all parent tree nodes of a given node until the root node is reached which changes original textContent.

exports.grandParent = async (page, node) => {
  const ogContent = (await node.getProperty('textContent'))._remoteObject.value;
  let parent = await node.getProperty('parentNode');
  let parentContent = (await parent.getProperty('textContent'))._remoteObject.value;
  while (ogContent===parentContent) {
    parent = await parent.getProperty('parentNode');
    parentContent = (await parent.getProperty('textContent'))._remoteObject.value;
  }
  return parent
}
exports.findEl = async (page,elTypee, keyWord,maxLength) => {
  const els = await page.$x(`//${elTypee}`);
  let distance = 0;
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    const elId = (await el.getProperty('id'))._remoteObject.value
    const elType = (await el.getProperty('type'))._remoteObject.value
    const elValue = (await el.getProperty('value'))._remoteObject.value

    const elContent = (await el.getProperty('textContent'))._remoteObject.value
    if((elContent.includes(keyWord)&&elContent.length<maxLength)){
      console.log('found text input',elId)
      console.log(elContent,"elContent",elTypee)
      return el;
    }
    else if(elId.includes(keyWord)&&elContent.length<maxLength){
      console.log('found text input',elId)
      console.log(elContent,"elContent",elTypee)
      return el;
    }
  }
}


exports.searchAddress = async (page, address) => {
  
  let agree = await page.$x('//*[contains(text(), "Agree")]');

  agree.forEach( async (ag) => {
    await ag.click();
  });
  console.log("agree clicked",agree.length);


  // let recordSearch = await page.$x('//*[contains(text(), "Record Search")]');
  // //filter out hidden inputs
  
  // await recordSearch[0].click();
  let propertySearch = await page.$x('//input');
  //filter out hidden inputs
  propertySearch = await propertySearch.filter(async (input) => {
    return (await input.getProperty('type'))._remoteObject.value !== 'hidden';
  })
  console.log(propertySearch.length,"longitud de propertySearch");
  await propertySearch[2].click();
  //keyboard.type('534 N Florida Ave');
  
  await page.keyboard.type(address);
  await page.keyboard.press('Enter');
  console.log("address entered");
  await sleep(1500)
  let foundAddress = await page.$x(`//*[contains(text(), "${address.toUpperCase()}")]`);
  foundAddress.forEach( async (found) => {
    await found.click();
    return;
  } );
  await sleep(700);
  console.log("address found",foundAddress.length);
  try {
    let viewSelected = await page.$x('//*[contains(text(), "View Selected")]');
    viewSelected[0].click();
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    console.log("navigated");
  } catch (error) {
    //
  }

  //await networkidle2


  let buildingButton = await page.$x('//button[contains(text(), "Building")]');
  buildingButton[0].click();
  console.log("building clicked");
  await sleep(800);
}

  exports.searchAddress2 = async (page, address) => {

    //const els = await findElements(page,'Address')
    const addressInput =await findInput(page,'Address')
    await addressInput.click()
    // press TAB
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.type(address);
    await page.keyboard.press('Enter');
    await sleep(2000)
    const el =await findEl(page,'td',address.toUpperCase(),100)
    //run js script
    await page.evaluate(function(){

      const someVal = document.querySelector('#srch > table.mctable > tbody > tr > td:nth-child(1) > a')
      someVal.click()
      console.log("clicked")
  });
    // const father = (await el.getProperty('parentNode'))
    // console.log("hola",(await father.getProperty('textContent'))._remoteObject.value.substring(6,17))
    // //get all elements children and console log textContent of each
    // const children = await page.$x(`//td[contains(text(),"${(await father.getProperty('textContent'))._remoteObject.value.substring(6,17)}")]//*`);
    // console.log((await children.getProperty('textContent'))._remoteObject.value,"children")

    
  }

exports.defaultCounty= {"county":{
  "id": 4,
  "name": "Marion",
  "description": "Description:",
  "url": "https://www.pa.marion.fl.us/PropertySearch.aspx",
  "propertySearchUrl": "https://www.pa.marion.fl.us/PropertySearch.aspx",
  "yearBuilt": "Year Built",
  "qualityGrade": "Quality Grd",
  "squareFootage": "Total SFLA",
  "land": null,
  "landValue": "Total Land Value",
  "buildingValue": "Total Building Value",
  "totalBuildingArea": "Total Building Area",
  "foundation": "Foundation:",
  "use": "Property Use:",
  "heatSource": "Heat Source",
  "heatMethod": "Heat Method",
  "stories": "Stories",
  "baths": "2 Fixture Baths,3 Fixture Baths,4 Fixture Baths,5 Fixture Baths,6 Fixture Baths,7 Fixture Baths",
  "bedrooms": "# Bedrooms:",
  "parcelId": "Parcel ID:",
  "address": null,
  "owner": "Owner(s)",
  "mailingAddress": "Mailing Address",
  "patios": "Patio",
  "porches": "Porch",
  "garage": null,
  "floorType": "Floor Type",
  "roofType": "Roof Type",
  "roofShape": null,
  "roofCover": "Roof Cover",
  "wallHeight": null,
  "extWall": "Exterior Wall",
  "intWall": "Wall Type",
  "pool": null,
  "purchasePrice": null,
  "purchaseDate": null,
  "state": 1
},
"attributes": [{attribute:'yearBuilt',integer:true,single:true},{attribute:'foundation',integer:false,single:true},
{attribute:'parcelId',integer:false,single:false},
{attribute:'owner',integer:false,single:false},
{attribute:'mailingAddress',integer:false,single:false},
{attribute:'description',integer:false,single:false},{attribute:'heatSource',integer:false,single:true},{attribute:'heatMethod',integer:false,single:true},
{attribute:'roofCover',integer:false,single:true},
{attribute:'roofType',integer:false,single:true},
{attribute:'extWall',integer:false,single:true},
{attribute:'floorType',integer:false,single:true},
{attribute:'intWall',integer:false,single:true},{attribute:'squareFootage',integer:true,single:true},
{attribute:'totalBuildingArea',integer:true,single:true},{attribute:'qualityGrade',integer:false,single:true},
{attribute:'description',integer:false,single:true},{attribute:'stories',integer:true,single:true},
{attribute:'baths',integer:true,single:true},
{attribute:'bedrooms',integer:true,single:true},
{attribute:'use',integer:false,single:false},
{attribute:'land',integer:false,single:true},{attribute:'buildingValue',integer:true,single:true},
{attribute:'otherStruct',integer:false,single:true},{attribute:'porches',integer:false,single:false},
{attribute:'patios',integer:false,single:false},{attribute:'garage',integer:false,single:false},
{attribute:'pool',integer:false,single:true},{attribute:'alarms',integer:false,single:true},
{attribute:'security',integer:false,single:true},
{attribute:'landValue',integer:true,single:true}
]
}

exports.getCountyIndex=(countyName)=>{
  switch (countyName) {
    case 'Volusia':
      return 'exports.searchAddress(page, address,countyStructure,countyurl)'
      break;
    case 'Marion':
      return 'exports.searchAddress2(page, address,countyStructure,countyurl)'
    default:
      return 'exports.searchAddress2(page, address,countyStructure,countyurl)'
  }
  
}

exports.getCounty = async (county,token) => {
  let countyStructure

  try {
    axios.defaults.headers.post['Authorization'] = 'JWT ' + token;
  } catch (error) {
      await axios.post('https://backends.smartrater.us/token-auth/', {username:"donjerson",password:"W3lcome77"})
    .then(function (response) {
      console.log(response.data.token);
      token = response.data.token;
    }).catch(function (error) {
      console.log(error);
    })
  }


  await axios.post('https://backends.smartrater.us/maps/getCounty/',{county})

  // let countyObj = await axios.post('https://u2f8ql6avi.execute-api.us-east-1.amazonaws.com/',{county})
  .then(function(response){
    console.log("deberia funcar",response.data.propertySearchUrl)
    countyStructure= response.data
    
  }).catch(function(error){
    console.log(error);
    countyStructure = {error:"error"}
     
  })
  return countyStructure
}


exports.lambdaHandler = async (event, context) => {
  console.log("hay bobo",event,context)
  let inputData
  if (event.body !== null && event.body !== undefined) {
    let body = JSON.parse(event.body)
    inputData = {...body}
    if (body.time) 
        time = body.time;
}else{
  inputData={...event}
}
  let county = inputData.county
  console.log(county,"county")
  let address = inputData.address
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
    });
    let countyStructure
    //let countyStructure = await exports.getCounty(county,inputData.token)
    if(inputData.countyStructure){
      countyStructure = inputData.countyStructure
    }else{
      countyStructure = await exports.getCounty(county,inputData.token)
    }
    let defaultCounty = exports.defaultCounty
    try {
      
      const start = new Date();
      let countyurl = 'https://google.com';
      if(countyStructure.propertySearchUrl){
        countyurl = countyStructure.propertySearchUrl
      }
      else{
        countyStructure = defaultCounty.county;
      }
      // const browserURL = 'http://127.0.0.1:9222';
      // const browser = await puppeteer.connect({  browserURL,ignoreHTTPSErrors: true, headless:false,  devtools: false, args: ['--no-sandbox', '--disable-setuid-sandbox']});
      // let page = await browser.pages();
      // page = page[0];
        const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
    });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36');
  page.setViewport({ width: 999, height: 754 });
      if (await page.url() !== countyurl) {
        await page.goto(countyurl);
        await sleep(500);
      }else{console.log("already on page");};
      
    //await finder.searchAddress(page,address);
    var instructions = countyStructure.searchFunction
    const countyIndex=exports.getCountyIndex(county)
    //eval('finder.searchAddress'+countyIndex+'(page, address)');
    await eval(countyIndex);
    
    await sleep(500);
    console.log(countyStructure['use'],"countyStructure")
    
    property=await exports.run(defaultCounty.attributes,page,countyStructure);
    await sleep(100);
    console.log(property,"propertyx");
    
    //end timer
    const end = new Date();
    const time = end - start;
    console.log(time/1000,"seg County scraping time");
    await browser.close();
} catch (e) {
  console.log("errrorrr",e)
}finally {
  await browser.close();
  return (JSON.stringify(property))
}
};
