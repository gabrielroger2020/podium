const phoneExtract = (value)=>{
    let phone = value;
    phone = phone.replaceAll("(","");
    phone = phone.replaceAll(")","");
    phone = phone.replaceAll(" ","");
    phone = phone.replaceAll("-","");
    return phone;
}

module.exports = {phoneExtract}