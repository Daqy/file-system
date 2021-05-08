const { Client } = require('pg');
const { config } = require("./database-config");

const endpoints = {
  async queryAllFolders() {
    const client = new Client(config);
    client.connect();

    const queryResult = await new Promise((resolve, reject) => {
      client.query('SELECT * FROM folders', (err, res) => {
        if (err) throw err;
        resolve(res);
      });
    });

    client.end();
    return queryResult.rows;
  },
  async queryAllFiles() {
    const client = new Client(config);
    client.connect();

    const queryResult = await new Promise((resolve, reject) => {
      client.query('SELECT * FROM files', (err, res) => {
        if (err) throw err;
        resolve(res);
      });
    });

    client.end();
    return queryResult.rows;
  },
  async queryFileByName(filename, ID) {
    const client = new Client(config);
    client.connect();

    const queryResult = await new Promise((resolve, reject) => {
      client.query(`SELECT * FROM files where name='${filename}' and "parentID"=${ID}`, (err, res) => {
        if (err) throw err;
        resolve(res);
      });
    });

    client.end();
    return queryResult.rows[0];
  },
  async queryFolderByName(filename) {
    const client = new Client(config);
    console.log(client);
    console.log(filename)
    client.connect();

    const queryResult = await new Promise((resolve, reject) => {
      console.log("---", filename)
      client.query(`SELECT * FROM folders where name='${filename}}'`, (err, res) => {
        if (err) throw err;
        resolve(res);
      });
    });

    client.end();
    console.log(queryResult.rows);
    return queryResult.rows[0];
  },
  async insertFile(fileID, filename, parentID) {
    const client = new Client(config);
    client.connect();

    const queryResult = await new Promise((resolve, reject) => {
      client.query(`insert into files ("ID", name, "parentID") values (${fileID}, '${filename}', ${parentID})`, (err, res) => {
        if (err) throw err;
        resolve("file uploaded")
      })
    });

    client.end();
    return queryResult;
  },
  async insertFolder(folderID, foldername, parentID) {
    const client = new Client(config);
    client.connect();

    const queryResult = await new Promise((resolve, reject) => {
      client.query(`insert into folders ("ID", name, "parentID") values (${folderID}, '${foldername}', ${parentID})`, (err, res) => {
        if (err) throw err;
        resolve("folder uploaded")
      })
    });

    client.end();
    return queryResult;
  },
  async queryFilesByParentID(ID) {
    const client = new Client(config);
    client.connect();

    const queryResult = await new Promise((resolve, reject) => {
      client.query(`SELECT * FROM files where "parentID"=${ID}`, (err, res) => {
        if (err) throw err;
        resolve(res);
      });
    });

    client.end();
    return queryResult.rows;
  },
  async queryFoldersByParentID(ID) {
    const client = new Client(config);
    client.connect();

    const queryResult = await new Promise((resolve, reject) => {
      client.query(`SELECT * FROM folders where "parentID"=${ID}`, (err, res) => {
        if (err) throw err;
        resolve(res);
      });
    });

    client.end();
    return queryResult.rows;
  },
  async deleteFile(ID) {
    const client = new Client(config);
    client.connect();

    const queryResult = await new Promise((resolve, reject) => {
      client.query(`delete from files where "ID"=${ID}`, (err, res) => {
        if (err) throw err;
        resolve("file Deleted");
      });
    });

    client.end();
    return queryResult;
  },
  async deleteFolder(ID) {
    const client = new Client(config);
    client.connect();

    const queryResult = await new Promise((resolve, reject) => {
      client.query(`delete from folders where "ID"=${ID}`, (err, res) => {
        if (err) throw err;
        resolve("Folder Deleted");
      });
    });

    client.end();
    return queryResult;
  }
}

module.exports.fromDB = function() {
  return endpoints;
}