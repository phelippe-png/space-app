const StringIsNumber = (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value)
};

export default StringIsNumber;