require("dotenv").config();
const bcrypt = require("bcrypt");
const Airtable = require('airtable');
const saltRounds = 10

let AirApi = process.env.airtableapikey;
const base = new Airtable({ apiKey: AirApi }).base('applyzD2lWXnyGHWs');


function airtableGet() {
  return new Promise((accept, reject) => {
    base("Users")
      .select({
        view: "Grid view",
      })
      .firstPage(function (err, records) {
        if (err) {
          return reject(err);
        }
        let air = [];
        records.forEach(function (record) {
          air.push(record.fields);
        });
        return accept(air);
      });
  });
}

module.exports = {
  async index(req, res) {
    let result = await airtableGet();
    return res.json(result);
  },

  async store(req, res) {
    const { name, email, cpf, password } = req.body;

    function hashPassword() {
      return new Promise((accept, reject) => {
        bcrypt.hash(password, saltRounds, function(err, hash) {
          return accept(hash)
        })
      })
    }

    //       [Check password hash] 
    //  async function checkPassword() {
    //    let hash = await hashPassword()
    //   return new Promise((accept, reject) => {
    //     bcrypt.compare(password, hash, function(err, result) {
    //       return accept(result)
    //     })
    //   })
    // }
    
    
    async function addUser() {
      let passwordhash = await hashPassword()
      return new Promise((accept, reject) => {
        base("Users").create(
          [
            {
              fields: {
                Name: name,
                Email: email,
                CPF: cpf,
                Password: passwordhash
              },
            },
          ],
          function (err, records) {
            if (err) {
              console.log(err);
              return reject(err);
            }
            return accept(records);
          }
        );
      });
    }
    let add = await addUser();
    
    return res.json(add);
  }
}

