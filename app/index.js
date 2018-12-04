const fs = require('fs');
const path = require('path');
const promisify = require('./helpers/promisify');
const config = require('../config');
const jsonManager = require('./json-manager');

const jsonLinksList = {};
const jsonFilesName = [];
const readDir = promisify(fs.readdir);

function nextDir(filesName, dir) {
  let result;

  filesName.forEach(file => {
    const newPath = path.join(dir, file);
    const isDirectory = fs.lstatSync(newPath).isDirectory();
    if (isDirectory) {
      result = readDir(newPath).then(fileNames => nextDir(fileNames, newPath))
    } else {
      jsonFilesName.push(file);
      jsonLinksList[dir] ? jsonLinksList[dir].push(newPath) : jsonLinksList[dir] = [newPath];
    }
  });

  return result;
}

function findJson(dir) {
  readDir(dir)
    .then(fileNames => nextDir(fileNames, dir))
    .then(() => requireJsons(jsonLinksList))
    .then(result => union(result))
    .then(mergedJsons => jsonManager.createNewJsons(mergedJsons, { filesName: filterMatches(jsonFilesName) }))
    .catch(error => console.log(error));
}

function requireJsons(jsonList) {
  let result = {};
  for (let prop in jsonList) {
    jsonList[prop].forEach(path => {
      result[prop] ? result[prop].push(require(path)) : result[prop] = [require(path)];
    })
  }
  return result;
}

function union(folderJsons) {
  const destrArr = []
  for( let prop in folderJsons) {
    destrArr.push(folderJsons[prop])
  }

  const [ firstDir, secondDir ] = destrArr;
  let mergedJsons = [];
  for (let i = 0; i < firstDir.length; i++) {
    mergedJsons.push(Object.assign(firstDir[i], secondDir[i]))
  }
  return mergedJsons;
}

function filterMatches(arr) {
  return Array.from(new Set(arr));
}

findJson(config.inputPath);
