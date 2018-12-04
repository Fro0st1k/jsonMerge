const path = require('path');
const fs = require('fs');
const config = require('../config.json');

class JsonManager {
  constructor() {
    this.dirName = config.outputPath;
  }

  createDirectory() {
    fs.mkdir(`${this.dirName}`, (error) => {
      if (error) return;
    });
  }

  createFile(options) {
    fs.writeFile(`${this.dirName}/${options.fileName}`, JSON.stringify(options.fileData, null, 2), (error) => {
      if (error) return;
    })
    console.log(`file name was created: ${options.fileName}`);
  }

  createNewJson(options) {
    this.createFile(options);
  }

  createNewJsons(mergedJsons, options) {
    this.createDirectory()
    mergedJsons.forEach((jsonData, index) => {
      options.fileName = options.filesName[index];
      options.fileData = jsonData;
      this.createNewJson(options);
    })
  }
}

module.exports = new JsonManager();
