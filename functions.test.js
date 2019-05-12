const { cashIn, cashOutJuridical, cashOutNatural } = require('./functions.js');

describe('cashIn', () => {
  const cashInTests = [
    { amount: 400, expected: '0.12' },
    { amount: 4000, expected: '1.20' },
    { amount: 1200000, expected: '5.00' },
    { amount: 999999999999999999900000, expected: '5.00' },
    { amount: 121.12, expected: '0.04' }
  ];
  
  const options = { percents: 0.03, max: { amount: 5, currency: 'EUR' } }

  cashInTests.forEach(item => {
    test(`${item.amount} ===> ${item.expected}`, () => {
      expect(cashIn(item.amount, options)).toBe(item.expected);
    });
  });
});

describe('cashOutJuridical', () => {
  const cashOutJurTests = [
    { amount: 400, expected: '1.20' },
    { amount: 4000, expected: '12.00' },
    { amount: 1200000, expected: '3600.00' },
    { amount: 121.12, expected: '0.50' },
    { amount: 30.12, expected: '0.50' }
  ];
  
  const options = { percents: 0.3, min: { amount: 0.5, currency: 'EUR' }};

  cashOutJurTests.forEach(item => {
    test(`${item.amount} ===> ${item.expected}`, () => {
      expect(cashOutJuridical(item.amount, options)).toBe(item.expected);
    });
  });
});

test('cashOutNatural', () => {
  const ops = [
    { date: '2019-05-06', user_id: 1, operation: { amount: 1300, currency: 'EUR' }},
    { date: '2019-05-07', user_id: 1, operation: { amount: 2000, currency: 'EUR' }},
    { date: '2019-05-07', user_id: 1, operation: { amount: 100, currency: 'EUR' }},
    { date: '2019-05-10', user_id: 1, operation: { amount: 100, currency: 'EUR' }},
    { date: '2019-05-10', user_id: 3, operation: { amount: 100, currency: 'EUR' }},
    { date: '2019-05-12', user_id: 3, operation: { amount: 1100, currency: 'EUR' }},
    { date: '2019-05-13', user_id: 3, operation: { amount: 1000, currency: 'EUR' }},
    { date: '2019-05-15', user_id: 1, operation: { amount: 300, currency: 'EUR' }}
  ];
  const options = { percents: 0.3, week_limit: { amount: 1000 }};
  let natOps = {}, commissions = [];

  ops.forEach(item => {
    const result = cashOutNatural(item, options, natOps);
    natOps = result.natOps;
    commissions.push(result.commission);
  });

  expect(commissions).toEqual(['0.90', '6.00', '0.30', '0.30', '0.00', '0.60', '0.00', '0.00']);
});
