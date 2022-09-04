const chromium = require('chrome-aws-lambda'); 
const puppeteer = chromium.puppeteer;
const axios = require('axios'); 
const defaultCounty = require('./Functions/defaultCounty.js');
const getCountyIndex = require('./Functions/getCountyIndex.js');
const finder = require('./Functions/finder.js');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const getCounty = async (county) => {
  let token
  let countyStructure
  await axios.post('http://localhost:8081/token-auth/', {username:"donjerson",password:"W3lcome77"})
  .then(function (response) {
    console.log(response.data.token);
    token = response.data.token;
  }).catch(function (error) {
    console.log(error);
  })
  axios.defaults.headers.post['Authorization'] = 'JWT ' + token;
  
  await axios.post('http://127.0.0.1:8081/maps/getCounty/',{county})
  // console.log(countyStructure.data,"q ha pasado")
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
  let address = inputData.address
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
    });

    try {
      let countyStructure = await getCounty(county)
      const start = new Date();
      let countyurl = 'https://google.com';
      if(countyStructure.propertySearchUrl){
        countyurl = countyStructure.propertySearchUrl
      }
      else{
        countyStructure = defaultCounty.county;
      }
      const browserURL = 'http://127.0.0.1:9222';
      const browser = await puppeteer.connect({  browserURL,ignoreHTTPSErrors: true, headless:false,  devtools: false, args: ['--no-sandbox', '--disable-setuid-sandbox']});
      let page = await browser.pages();
      page = page[0];
      if (await page.url() !== countyurl) {
        await page.goto(countyurl);
        await sleep(500);
      }else{console.log("already on page");};
      
    //await finder.searchAddress(page,address);
    var instructions = countyStructure.searchFunction
    const countyIndex=getCountyIndex(county)
    //eval('finder.searchAddress'+countyIndex+'(page, address)');
    eval(countyIndex);
    
    await sleep(2500);
    console.log(countyStructure['use'],"countyStructure")
    
    let property=await finder.run(defaultCounty.attributes,page,countyStructure);
    await sleep(100);
    console.log(property,"propertyx");
    
    //end timer
    const end = new Date();
    const time = end - start;
    console.log(time/1000,"seg County scraping time");
    await sleep(100000000);
    await browser.close();
} catch (e) {
  console.log("errrorrr",e)
}finally {
  await browser.close();
  console.log("rico working4")
  
  return (
    `El mejor`)
}
};
