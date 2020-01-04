var mysql = require('mysql');
var inquirer = require('inquirer');

var colors = require('colors');

var connection = mysql.createConnection({
  host: 'localhost',
  port: '3000',
  user: 'root',
  password: '1234',
  database: 'amazone',
});


connection.connect(function (err) {
  if (err) {
    throw err;
  }
  console.log("connected as id" + connection.threadid);

  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      console.log("Available for sale - ".green + (colors.yellow("Item ID: " + res[i].item_id + "," + " Product: "
        + res[i].product_name + "," + " $" + res[i].price)));

    }
    start(res);
  });
});

function start(results) {


  inquirer.prompt([
    {

      type: "list",
      name: "selectItemID",
      message: "What is the Item ID of the product you would like to buy?",
      choices: function () {
        var choiceArrayItemId = [];
        for (var i = 0; i < results.length; i++) {
          choiceArrayItemId.push(results[i].item_id.toString());
        }
        return choiceArrayItemId;
      }
    },
    {
      type: "input",
      name: "selectNumUnits",
      message: "How many would you like to buy?"
    }

  ])

    .then(function (answer) {
      CheckUnits(answer.selectItemID, answer.selectNumUnits);
    });
};


function updateUnits(itemID, NumUnits, stock_quantity) {
  console.log(" Updating units".cyan);
  var query = connection.query(
    `UPDATE products SET stock_quantity = ${stock_quantity - NumUnits} WHERE ${itemID} = item_id`, function (err, results) {
      if (err) {
        throw err;
      }
      console.log("Your order has been placed successfully!".bold);
    }
  )
}

function CheckUnits(ItemID, NumUnits) {


  // query the database for the unit count of items being sold
  connection.query(`SELECT stock_quantity FROM products WHERE ${ItemID} = products.item_id`, function (err, results) {

    if (err) {
      throw err;
    }
    else if (parseInt(NumUnits) > results[0].stock_quantity) {

      console.log("Insufficient quantity - cannot complete your order.")
      start();
    }



    else if (parseInt(NumUnits) <= results[0].stock_quantity) {


      updateUnits(ItemID, NumUnits, results[0].stock_quantity);
      connection.end();
    };
  })
}
