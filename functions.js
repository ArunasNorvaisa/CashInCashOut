const previousMondayFn = function (date) {
  date = new Date(date);
  const day = date.getDay();
  const diff = date.getDate() - day + (day == 0 ? -6 : 1);
  let previousMonday = new Date(date.setDate(diff));
  previousMonday.setHours(0, 0, 0);
  return previousMonday;
};

const cashIn = function(amount, options) {
  let commission = (amount * options.percents) / 100;
  //Apvalinam komisinius iki centų, į didžiąją pusę:
  commission = (Math.ceil(commission * 100) / 100).toFixed(2);
  commission =
    commission < options.max.amount
      ? commission
      : options.max.amount.toFixed(2);
  return commission;
};

const cashOutJuridical = function(amount, options) {
  let commission = (amount * options.percents) / 100;
  commission = (Math.ceil(commission * 100) / 100).toFixed(2);
  commission =
    commission > options.min.amount
      ? commission
      : options.min.amount.toFixed(2);
  return commission;
};

const cashOutNatural = function({ date, user_id, operation }, options, natOps) {
  const weeklyLimit = options.week_limit.amount;
  const perc = options.percents;
  const previousMonday = new Date(previousMondayFn(date));
  const activeThisWeek =
    !!natOps[user_id] && (natOps[user_id].lastOpDate >= previousMonday);
  if (!natOps[user_id]) natOps[user_id] = { amount: 0 };
  if (!activeThisWeek) natOps[user_id].amount = 0;
  natOps[user_id].amount += operation.amount;
  natOps[user_id].lastOpDate = new Date(date);
  let overLimit = natOps[user_id].amount - weeklyLimit;
  if (overLimit < 0) overLimit = 0;
  if (overLimit > operation.amount) overLimit = operation.amount;
  let commission = (overLimit * perc) / 100;
  commission = (Math.ceil(commission * 100) / 100).toFixed(2);
  return { commission, natOps };
};

module.exports = { cashIn, cashOutJuridical, cashOutNatural };
