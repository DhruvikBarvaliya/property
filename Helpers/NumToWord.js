let numberToWords = async (number) => {
  // Arrays for one through nineteen, and tens multiples
  const oneThroughNineteen = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tensMultiples = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  // Function to recursively convert a number less than 1000 into words
  function convertLessThanOneThousand(n) {
    if (n < 20) {
      return oneThroughNineteen[n];
    }
    if (n < 100) {
      return (
        tensMultiples[Math.floor(n / 10)] +
        " " +
        convertLessThanOneThousand(n % 10)
      );
    }
    return (
      oneThroughNineteen[Math.floor(n / 100)] +
      " Hundred " +
      convertLessThanOneThousand(n % 100)
    );
  }

  // Function to convert a number into words
  function convert(number) {
    if (number === 0) return "Zero";
    let result = "";
    let crore = Math.floor(number / 10000000);
    let lakh = Math.floor((number % 10000000) / 100000);
    let thousand = Math.floor((number % 100000) / 1000);
    let hundred = number % 1000;

    if (crore > 0) {
      result += convertLessThanOneThousand(crore) + " Crore ";
    }
    if (lakh > 0) {
      result += convertLessThanOneThousand(lakh) + " Lakh ";
    }
    if (thousand > 0) {
      result += convertLessThanOneThousand(thousand) + " Thousand ";
    }
    if (hundred > 0) {
      result += convertLessThanOneThousand(hundred);
    }

    return result.trim();
  }

  return convert(number);
};
module.exports = { numberToWords };
