const fs = require('fs');
const SnowflakeId = require('snowflake-id').default;
const { fromDB } = require('./DB-endpoint');
// const { fromJSON } = require('./JSON-endpoints');

const snowflake = new SnowflakeId({
  offset : (2020-1970)*31536000*1000
});

const directory = 'root/' 

const endpoints = {
  async requestUploadFile(filename, fileDirectory, binaryData) {

    if (binaryData.length <= 0) {
      return 'file failed to upload';
    }

    fileDirectory = fileDirectory.split('/');
    let foldername = fileDirectory[fileDirectory.length-1];
    if (foldername == '') {
      foldername = 'root'
    };

    const result = await fromDB().queryFolderByName(foldername);

    if (result != undefined) {
      const ID = snowflake.generate();
      fs.writeFile(`${directory+ID}.${(filename.split('.')[1])}`, binaryData, function (err) {
        if (err) throw err;
      });

      const queryResult = await fromDB().insertFile(ID, filename, result.ID)
      return queryResult;
    };

    return "file failed to upload"
  },
  async requestUploadFolder(foldername, folderDirectory) {
    const queryResult = await fromDB().queryFolderByName(foldername);
    if (queryResult != undefined) {return "failed to upload folder";}

    folderDirectory = folderDirectory.split('/').slice(1);
    const doesfolderPathExist = await folderPathExist(folderDirectory);
    if (doesfolderPathExist) {
      const parentID = (await fromDB().queryFolderByName(folderDirectory[folderDirectory.length-1])).ID;
      if (parentID != undefined) {
        const ID = snowflake.generate();
        const queryResult = await fromDB().insertFolder(ID, foldername, parentID);
        return queryResult
      }
    }
    return "failed to upload folder"
  },
  async getFile(filename, folderDirectory) {
    const foldername = folderDirectory.split('/');
    const queryResultFolder = await fromDB().queryFolderByName(foldername[foldername.length-1]);
    if (queryResultFolder == undefined) {return 'failed to find folder';}
    const queryResult = await fromDB().queryFileByName(filename, queryResultFolder.ID);

    const fileData = await new Promise((resolve, reject) => {
      fs.readFile(`${directory+queryResult.ID}.${(filename.split('.')[1])}`, function(err, data) {
        if (err) throw err;
        resolve(data);
      });
    });

    const file = Buffer.from(fileData, 'base64');
    return file;
  },
  async getFolder(foldername) {
    foldername = foldername.split('/');
    foldername = foldername[foldername.length-1]
    console.log(foldername);

    if (foldername == '') {
      foldername = 'root'
    };

    const folder = await fromDB().queryFolderByName(foldername);
    const data = await getFolderInformation(folder);

    return data;
  },
  async deleteFile(filename, folderDirectory) {
    const foldername = folderDirectory.split('/');
    const queryResultFolder = await fromDB().queryFolderByName(foldername[foldername.length-1]);
    if (queryResultFolder == undefined) {return 'failed to find folder';}
    const queryResult = await fromDB().queryFileByName(filename, queryResultFolder.ID);
    if (queryResult == undefined) {
      return "file doesn't exist"
    }
    fs.unlink(`${directory+queryResult.ID}.${filename.split('.')[1]}`,function(err) {
      if (err) throw err;
    })
    const response = await fromDB().deleteFile(queryResult.ID);
    return response;
  },
  async deleteFolder(foldername) {
    const queryResult = await fromDB().queryFolderByName(foldername);
    if (queryResult == undefined) {
      return "Folder doesn't exist"
    }

    const files = await fromDB().queryFilesByParentID(queryResult.ID);
    const folders = await fromDB().queryFoldersByParentID(queryResult.ID);

    if (files.length != 0 || folders.length != 0) {
      return "folder contains files/folders"
    }

    const response = await fromDB().deleteFolder(queryResult.ID);
    return response;
  }
};

module.exports.fromFS = function() {
  return endpoints;
};

async function folderPathExist(path) {
  for (let i = path.length-1; i >= 0; i--) {
    if (path[i] == '') {
      path[i] = 'root';
    }
    let folder = await fromDB().queryFolderByName(path[i]);
    if (folder == undefined) {return false;}
    if (i != path.length-1 && parentID != folder.ID) {return false;}
    let parentID = folder.parentID;
  }
  return true;
}

async function getFolderInformation(folder) {
  const folders = await fromDB().queryFoldersByParentID(folder.ID);
  const files = await fromDB().queryFilesByParentID(folder.ID);

  let allFolderArray = []
  for (let index = 0; index < folders.length; index++) {
    allFolderArray.push(await getFolderInformation(folders[index])) 
  }

  let fileArray = []
  for (let index = 0; index < files.length; index++) {
    fileArray.push({
      id: files[index].ID,
      name: files[index].name
    });
  }

  return {
    id: folder.ID,
      name: folder.name,
      folders: allFolderArray,
      files: fileArray
  }
}