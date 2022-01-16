const {ipcRenderer, contextBridge, dialog} = require('electron');

contextBridge.exposeInMainWorld('node',{
  showSaveDialog: (text)=>{
    ipcRenderer.invoke('showSaveDialog',text);
  },
  showOpenDialog: ()=>{
    ipcRenderer.invoke('showOpenDialog');
  },
  overwriteSave: (text)=>{
    ipcRenderer.invoke('overwriteSave',text);
  }
})
