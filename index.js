const {app, BrowserWindow, dialog, Menu, ipcMain} = require('electron');
const fs = require('fs');
const Store = require('electron-store');
const store = new Store();
let win;
let title = '無題';
let filepath = '';

function nw(){
  win=new BrowserWindow({
    width: store.get('width', 800),
    height: store.get('height', 500),
    icon: `&{__dirname}/src/icon.png`,
    webPreferences: {
      preload: `${__dirname}/src/preload.js`
    }
  })
  win.webContents.loadFile(`${__dirname}/src/index.html`);

  win.webContents.on('close',()=>{
    store.set('width', win.getSize()[0]);
    store.set('height', win.getSize()[1]);
  })
}

app.on('ready',nw);
app.on('window-all-closed', ()=>app.quit());
app.on('activate',()=>{if (win === null) nw});

function showSaveDialog(text){
  let isSave = dialog.showMessageBoxSync(win,{
    message: `${title} への変更内容を保存しますか?`,
    title: 'Notebook',
    buttons: [
      '保存する',
      '保存しない',
      'キャンセル'
    ]
  })
  if (isSave == 0){
    let saveDialog=dialog.showSaveDialogSync(win,{
      title: '名前を付けて保存'
    });
    if (saveDialog!=undefined) {
      fs.writeFileSync(saveDialog, text);
    }
    filepath=saveDialog;
  }
}
function openFile() {

}

ipcMain.handle('showSaveDialog',(e,text)=>{
  showSaveDialog(text);
})
ipcMain.handle('overwriteSave',(e,text)=>{
  fs.writeFile(filepath, text, (err, dat)=>{
    if (err) throw err;
  });
})

let menu=Menu.buildFromTemplate([
  {
    label: 'ファイル',
    submenu: [
      {
        label: '上書き保存',
        accelerator: 'CmdOrCtrl+S',
        click: ()=>{
          if (filepath == ''){
            win.webContents.executeJavaScript(`
              node.showSaveDialog(document.getElementsByTagName('textarea')[0].value)
            `);
          } else if (filepath != '') {
            win.webContents.executeJavaScript(`
              node.overwriteSave(document.getElementsByTagName('textarea')[0].value)
            `)
          }
        }
      },
      {
        label: '名前を付けて保存',
        accelerator: 'CmdOrCtrl+Shift+S',
        click: ()=>{
          win.webContents.executeJavaScript(`
            node.showSaveDialog(document.getElementsByTagName('textarea')[0].value)
          `);
        }
      },
      {
        label: '開く',
        accelerator: 'CmdOrCtrl+O',
        click: ()=>{
          win.webContents.executeJavaScript(`
            node.showOpenDialog();
          `)
        }
      }
    ]
  }
])

Menu.setApplicationMenu(menu);
