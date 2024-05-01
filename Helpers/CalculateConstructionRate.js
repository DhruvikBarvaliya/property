let calculatePrice = async (years) => {
  if (years >= 1 && years <= 10) {
    return 1200;
  } else if (years >= 11 && years <= 20) {
    return 1100;
  } else if (years >= 21 && years <= 30) {
    return 1000;
  } else if (years >= 31) {
    return 900;
  } else {
    return "Invalid input";
  }
};
module.exports = { calculatePrice };
