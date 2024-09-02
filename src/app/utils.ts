export const convertCurrency = ({
  amount,
  selectedCurrency,
}: {
  amount: number;
  selectedCurrency: {
    rate: number;
  };
}) => {
  return (amount * selectedCurrency.rate).toFixed(2);
};
