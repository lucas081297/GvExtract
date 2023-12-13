const { error, time } = require('console');
const {remote} = require('webdriverio');
const { Key } = require ('webdriverio');
const gauth = require('google-auth-library')
const gspread = require('google-spreadsheet')
const keys = require ('./keys.json')

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const serviceAccountAuth = new gauth.JWT({
  email: keys.client_email,
  key: keys.private_key,
  scopes: SCOPES,
})

let carapTime = 0;
let sayTimeCarap = ''

const capabilities = {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:appPackage": "br.com.geocontrol.pontual_previsao_cordova",
    "appium:deviceName": "device",
    "appium:appActivity": "br.com.geocontrol.pontual_previsao_cordova.MainActivity"
};

const wdOpts = {
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: 'info',
  capabilities,
};
async function runTest() {
  const driver = await remote(wdOpts);
  try {
    const el1 = await driver.$("id:com.android.packageinstaller:id/permission_allow_button");
    await el1.click();
    const el2 = await driver.$("xpath://android.widget.Button[@text=\"OK\"]");
    await el2.click();
    const el3 = await driver.$("xpath://android.widget.TextView[@text=\"HORÁRIOS\"]");
    await el3.click();
    const el4 = await driver.$("xpath://android.widget.Button[@text=\"Transcol\"]");
    await el4.click();
    await new Promise(resolve => setTimeout(resolve, 3000))
    const el5 = await driver.$("class name:android.widget.EditText");
    await el5.click();
    await driver.executeScript("mobile: pressKey", [{"keycode":11}]);
    await new Promise(resolve => setTimeout(resolve, 1000))
    await driver.executeScript("mobile: pressKey", [{"keycode":11}]);
    await new Promise(resolve => setTimeout(resolve, 1000))
    await driver.executeScript("mobile: pressKey", [{"keycode":7}]);
    await new Promise(resolve => setTimeout(resolve, 1000))
    await driver.executeScript("mobile: pressKey", [{"keycode":14}]);
    await new Promise(resolve => setTimeout(resolve, 1000))
    await driver.executeScript("mobile: pressKey", [{"keycode":7}]);
    await new Promise(resolve => setTimeout(resolve, 3500))
    await driver.executeScript("mobile: pressKey", [{"keycode":15}]);
    await new Promise(resolve => setTimeout(resolve, 5000))
    el6 = await driver.$("xpath:(//android.widget.TextView[@text=\"Avenida Guarapari, Serra\"])[1]");
    while (typeof(el6['elementId'])=="undefined") {
      await driver.executeScript("mobile: pressKey", [{"keycode":66}]);
      await new Promise(resolve => setTimeout(resolve, 3000))
      el6 = await driver.$("xpath:(//android.widget.TextView[@text=\"Avenida Guarapari, Serra\"])[1]");
    }
    await el6.click();
    const el17 = await driver.$('xpath:(//android.widget.ListView/android.view.View/android.view.View)');
    const el18 = await el17.$$('//*');
    const el19 = await el18[4];
    carapTime = await el19.getText();
    carapTime = carapTime.trim()
    carapTime = carapTime.split('m');
    carapTime = carapTime[0]
    console.log("\n\n\n\n")
    loadDoc();
    //console.log(carapTime);
  } finally {
    await driver.pause(1000);
    await driver.deleteSession();
  }
}

runTest().catch(console.error);

//let larcarapTime = 0;
const doc = new gspread.GoogleSpreadsheet(keys.table_id,serviceAccountAuth);
const loadDoc = async () =>{
  await doc.loadInfo()
  let sheet = doc.sheetsByIndex[0];
  await sheet.loadCells('A1:D5');
  sheet.getCellByA1('A2').value = carapTime
  //sheet.getCellByA1('B2').value = 18
  await sheet.saveUpdatedCells();
  carapTime = sheet.getCellByA1('A2').value;
  //larcarapTime = sheet.getCellByA1('B2').value;
  carapTime!=0 ? sayTimeCarap = `${carapTime} minutos` : sayTimeCarap = 'Não foi possível obter o tempo'
  //larcarapTime!=0 ? saycarapTimeLar = `${larcarapTime} minutos` : saycarapTimeLar = 'Não foi possível obter o tempo'
  console.log(sayTimeCarap)
}