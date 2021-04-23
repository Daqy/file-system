const fs = require('fs');

const database = JSON.parse(fs.readFileSync('database.json'));

const endpoints = {
  async queryAllFolders() {
    return database.folders;
  },
  async queryAllFiles() {
    return database.files;
  },
  async queryFileByName(filename, ID) {
    for (let index = 0; index < database.files.length; index++) {
      let currentFile = database.files[index];
      if (currentFile.name == filename && currentFile.parentID == ID) {
        return currentFile;
      }
    }
    return undefined
  },
  async queryFolderByName(foldername) {
    for (let index = 0; index < database.folders.length; index++) {
      let currentFolder = database.folders[index];
      console.log(currentFolder.name, "-=-=", foldername);
      if (currentFolder.name == foldername) {
        return currentFolder;
      }
    }
    return undefined
  },
  async insertFile(fileID, filename, parentID) {
    database.files.push({
      "id": fileID,
      "name": filename,
      "parentID": parentID
    });
    fs.writeFileSync('database.json', JSON.stringify(database, null, 2));
    return "file uploaded";
  },
  async insertFolder(folderID, foldername, parentID) {
    database.folders.push({
      "id": folderID,
      "name": foldername,
      "parentID": parentID
    });
    fs.writeFileSync('database.json', JSON.stringify(database, null, 2));
    return "folder uploaded";
  },
  async queryFilesByParentID(ID) {
    for (let index = 0; index < database.files.length; index++) {
      let currentFile = database.files[index];
      if (currentFile.parentID == ID) {
        return currentFile;
      }
    }
    return undefined
  },
  async queryFoldersByParentID(ID) {
    for (let index = 0; index < database.folders.length; index++) {
      let currentFolder = database.folders[index];
      if (currentFolder.parentID == ID) {
        return currentFolder;
      }
    }
    return undefined
  },
  async deleteFile(ID) {
    const fileIndex = -1;
    for (let index = 0; index < database.files.length; index++) {
      let currentFile = database.files[index];
      if (currentFile.id == ID) {
        fileIndex = index;
      }
    }

    if (fileIndex != -1) {
      database.files.splice(fileIndex, 1)
    }
  },
  async deleteFolder(ID) {
    const folderIndex = -1;
    for (let index = 0; index < database.folders.length; index++) {
      let currentFolder = database.folders[index];
      if (currentFolder.id == ID) {
        folderIndex = index;
      }
    }

    if (folderIndex != -1) {
      database.folders.splice(folderIndex, 1)
    }
  }
}

module.exports.fromJSON = function() {
  return endpoints;
}