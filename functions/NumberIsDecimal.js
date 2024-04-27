const NumberIsDecimal = (value) => {
    return !isNaN(value) && /^\d+(?:\.\d+)?$/.test(value)
};

export default NumberIsDecimal;