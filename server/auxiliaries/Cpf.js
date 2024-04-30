const cpfExtract = (value)=>{
    let cpf = value;
    cpf = cpf.replaceAll(".","");
    cpf = cpf.replaceAll("-","");
    return cpf;
}

module.exports = {cpfExtract}