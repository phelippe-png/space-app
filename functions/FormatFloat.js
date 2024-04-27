import StringIsNumber from "./StringIsNumber";

const FormatFloat = (value, symbol) => {
  if (value == undefined)
    return (0).toLocaleString("pt-BR", symbol ? { style: "currency", currency: "BRL" } : { minimumFractionDigits: 2 })

  if (StringIsNumber(value))
    return value.toLocaleString("pt-BR", symbol ? { style: "currency", currency: "BRL" } : { minimumFractionDigits: 2 })
  else
    return value
};

export default FormatFloat;
