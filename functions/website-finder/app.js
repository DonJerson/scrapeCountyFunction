const chromium = require('chrome-aws-lambda'); 
const puppeteer = chromium.puppeteer;

let downpaymentRaw;
let totalPremiumRaw;
let totalPremium;
let downpayment;
let monthlyPayment;

exports.lambdaHandler = async (event, context) => {
  console.log("hay bobo",event,context)
  let newCustomer
  if (event.body !== null && event.body !== undefined) {
    let body = JSON.parse(event.body)
    newCustomer = {...body}
    if (body.time) 
        time = body.time;
}else{
  newCustomer={...event}
}
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
    });

    try {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36');
  page.setViewport({ width: 999, height: 754 });
  await page.goto('https://www.uaig.net/uaichome/#/uaichome', {waitUntil: 'networkidle2'
  });
  //wair for login button
  //fix wait for selector bug on headless
  await page.waitForSelector('.login-button');
  await page.click('.login-button > button:nth-child(1)');
  await page.type('#mainFormAgent > div:nth-child(2) > div:nth-child(2) > input:nth-child(1)', '100495');
  await page.type('#mainFormAgent > div:nth-child(4) > div:nth-child(2) > input:nth-child(1)', 'Sebanda#41');
  await page.click('button.home-page-button:nth-child(6)');

  //wait for cmn button
  await page.waitForSelector('#CMN_SideNav');
  await page.click('#CMN_SideNav > li:nth-child(1) > a > img');
  await page.click('#CMN_Links > li:nth-child(1) > a:nth-child(1)');
  //wait for tbxvin1
  await page.waitForSelector('#tbxVIN1');
  await page.type('#tbxDOB1',newCustomer.dob);
  await page.select('#dbxSTATE1', newCustomer.driversLicense?newCustomer.state:'PS');
  
  await page.type('#dbxLICM1',(2000-parseInt(newCustomer.dob.substring(newCustomer.dob.length-4,newCustomer.dob.length))).toString());
  await page.waitFor(1000);
  await page.type('#tbxVIN1',newCustomer.vin);
  await page.keyboard.press('Tab');
  //wait 2 secondsssss
  await page.waitFor(1000);
  await page.type('#tbxFname', newCustomer.firstName);
  // await page.waitFor(2000000);
  await page.type('#tbxMname', newCustomer.middleName);
  await page.type('#tbxLname', newCustomer.lastName);
  await page.type('#zip',newCustomer.zipcode);
  await page.type('#txtEmail',newCustomer.email);

  if(newCustomer.comprehensiveDeductible){
    await page.select('#dbxCMPD1',newCustomer.comprehensiveDeductible);
  }
  if(newCustomer.biCoverage){
    await page.select('#dbxBILMT',newCustomer.biCoverage);
  }
  await page.select('#prev_pol_term','0');
  await page.select('#drpPIPDED','IO '+newCustomer.pipDeductible);
  await page.select('#dbxPDLMT',(parseInt(newCustomer.propertyDamageCoverage)*1000).toString());
  await page.type('#txtHmphcde',newCustomer.phone.substring(0,3));
  await page.type('#txtHmphpfix',newCustomer.phone.substring(3,6));
  await page.type('#txtHmphno',newCustomer.phone.substring(6,10));

  console.log("rico working1")
  await page.type('#HomDisc',newCustomer.homeOwner? 'Y':'N');
  console.log("rico working2")
  await page.type('#tbxLICNO1',newCustomer.driversLicense?
  newCustomer.driversLicense:newCustomer.passport);
  await page.type('#dbxCREDIT','E');

  console.log("rico working22");
  await page.waitFor(100);
  console.log("rico working23");
  await page.click('#btnCont');
  
  console.log("rico working3");
  await page.waitForSelector('#compare-tbl > tbody > tr:nth-child(2) > td:nth-child(5) > a');
  downpaymentRaw = await page.$eval('#compare-tbl > tbody > tr:nth-child(2) > td:nth-child(5) > a', el => el.innerText);
  totalPremiumRaw = await page.$eval('#compare-tbl > tbody > tr:nth-child(2) > td:nth-child(2) > a', el => el.innerText);
  totalPremium = totalPremiumRaw.replace(/[^0-9.]/g, '');
  downpayment = downpaymentRaw.replace(/[^0-9.]/g, '');
  
  // await page.screenshot({path: './uaigresult.png'});
  //get downpayment from #compare-tbl > tbody > tr:nth-child(2) > td:nth-child(5) > a element and total premium

} catch (e) {
  console.log("errrorrr",e)
}finally {
  await browser.close();
  console.log("rico working4")
  monthlyPayment = ((parseFloat(totalPremium)-parseFloat(downpayment))/5).toFixed(2);
  console.log(`Downpayment: ${downpayment}`,
  `Total Premium: ${totalPremium}`,
  `Monthly Payment: ${monthlyPayment}`);
  
  
  return (
    `Downpayment: ${downpayment} Total Premium: ${totalPremium}
    Monthly Payment: ${monthlyPayment}`)
}
};
