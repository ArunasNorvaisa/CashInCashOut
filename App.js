const fs = require('fs');
const axios = require('axios');
const { cashIn, cashOutJuridical, cashOutNatural } = require('./functions.js');

let json = process.argv.slice(2);
json = json[0];
const data = JSON.parse(fs.readFileSync(`${json}`, 'utf8'));

async function loadConfiguration() {
  let cashInOptions,
      cashOutOptionsJuridical,
      cashOutOptionsNatural;
  await axios
    .all([
      axios.get(
        'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-in'
      ),
      axios.get(
        'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/juridical'
      ),
      axios.get(
        'http://private-38e18c-uzduotis.apiary-mock.com/config/cash-out/natural'
      )
    ])
    .then(
      axios.spread((cashIn, cashOutJuridical, cashOutNatural) => {
        cashInOptions = cashIn.data;
        cashOutOptionsJuridical = cashOutJuridical.data;
        cashOutOptionsNatural = cashOutNatural.data;
      })
    )
    .catch(err => process.stdout.write(err.message));

  return { cashInOptions, cashOutOptionsJuridical, cashOutOptionsNatural };
}

loadConfiguration().then(config => {
  // Čia saugosim fizinių asmenų operacijas:
  let natOps = {};
  data.forEach(item => {
    let commission = -1;
    if (item.type === 'cash_in') {
      commission = cashIn(item.operation.amount, config.cashInOptions);
    } else if (item.user_type === 'juridical') {
      commission = cashOutJuridical(
        item.operation.amount,
        config.cashOutOptionsJuridical
      );
    } else if (item.user_type === 'natural') {
      const result = cashOutNatural(item, config.cashOutOptionsNatural, natOps);
      natOps = result.natOps;
      commission = result.commission;
    }
    process.stdout.write(commission + '\n');
  });
})
