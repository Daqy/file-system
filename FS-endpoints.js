const fs = require("fs");
const SnowflakeId = require('snowflake-id').default;
// const { fromDB } = require("./DB-endpoint");
const { fromJSON } = require("./JSON-endpoints");

const snowflake = new SnowflakeId({
  offset : (2020-1970)*31536000*1000
});

const directory = "root/" 

const endpoints = {
  async requestUploadFile(filename, fileDirectory, binaryData) {

    if (binaryData.length <= 0) {
      return "file failed to upload";
    }

    fileDirectory = fileDirectory.split("/");
    let foldername = fileDirectory[fileDirectory.length-1];
    if (foldername == "") {
      foldername = "root"
    };

    const result = await fromJSON().queryFolderByName(foldername);

    if (result != undefined) {
      const ID = snowflake.generate();
      fs.writeFile(`${directory+ID}.${(filename.split(".")[1])}`, binaryData, function (err) {
        if (err) throw err;
      });

      const queryResult = await fromJSON().insertFile(ID, filename, result.id)
      return queryResult;
    };

    return "file failed to upload"
  },
  async requestUploadFolder(foldername, folderDirectory) {
    const queryResult = await fromJSON().queryFolderByName(foldername);
    console.log(queryResult)
    if (queryResult != undefined) {return "failed to upload folder";}

    folderDirectory = folderDirectory.split("/").slice(1);
    const doesfolderPathExist = await folderPathExist(folderDirectory);
    if (doesfolderPathExist) {
      const parentID = (await fromJSON().queryFolderByName(folderDirectory[folderDirectory.length-1])).id;
      if (parentID != undefined) {
        const ID = snowflake.generate();
        const queryResult = await fromJSON().insertFolder(ID, foldername, parentID);
        return queryResult
      }
    }
    return "failed to upload folder"
  },
  async getFile(filename, folderDirectory) {
    const foldername = folderDirectory.split("/");
    const queryResultFolder = await fromJSON().queryFolderByName(foldername[foldername.length-1]);
    if (queryResultFolder == undefined) {return "failed to find folder";}
    const queryResult = await fromJSON().queryFileByName(filename, queryResultFolder.id);

    const fileData = await new Promise((resolve, reject) => {
      fs.readFile(`${directory+queryResult.id}.${(filename.split(".")[1])}`, function(err, data) {
        if (err) throw err;
        resolve(data);
      });
    });

    const file = Buffer.from(fileData, 'base64');
    return file;
  },
  async getFolder(foldername) {
    foldername = foldername.split("/");
    foldername = foldername[foldername.length-1]

    const folder = await fromJSON().queryFolderByName(foldername);
    const data = await getFolderInformation(folder);

    return data;
  },
  async deleteFile(filename, folderDirectory) {
    const foldername = folderDirectory.split("/");
    const queryResultFolder = await fromJSON().queryFolderByName(foldername[foldername.length-1]);
    if (queryResultFolder == undefined) {return "failed to find folder";}
    const queryResult = await fromJSON().queryFileByName(filename, queryResultFolder.id);
    if (queryResult == undefined) {
      return "file doesn't exist"
    }
    fs.unlink(`${directory+queryResult.id}.${filename.split(".")[1]}`,function(err) {
      if (err) throw err;
    })
    const response = await fromJSON().deleteFile(queryResult.id);
    return response;
  },
  async deleteFolder(foldername) {
    const queryResult = await fromJSON().queryFolderByName(foldername);
    if (queryResult == undefined) {
      return "Folder doesn't exist"
    }

    const files = await fromJSON().queryFilesByParentID(queryResult.id);
    const folders = await fromJSON().queryFoldersByParentID(queryResult.id);

    if (files.length != 0 || folders.length != 0) {
      return "folder contains files/folders"
    }

    const response = await fromJSON().deleteFolder(queryResult.id);
    return response;
  }
};

module.exports.fromFS = function() {
  return endpoints;
};

async function folderPathExist(path) {
  for (let i = path.length-1; i >= 0; i--) {
    if (path[i] == "") {
      path[i] = "root";
    }
    let folder = await fromJSON().queryFolderByName(path[i]);
    if (folder == undefined) {return false;}
    if (i != path.length-1 && parentID != folder.id) {return false;}
    let parentID = folder.parentID;
  }
  console.log("returned true")
  return true;
}

async function getFolderInformation(folder) {
  const folders = await fromJSON().queryFoldersByParentID(folder.id);
  const files = await fromJSON().queryFilesByParentID(folder.id);

  let allFolderArray = []
  for (let index = 0; index < folders.length; index++) {
    allFolderArray.push(await getFolderInformation(folders[index])) 
  }

  let fileArray = []
  for (let index = 0; index < files.length; index++) {
    fileArray.push({
      id: files[index].id,
      name: files[index].name
    });
  }

  return {
    id: folder.id,
      name: folder.name,
      folders: allFolderArray,
      files: fileArray
  }
}