'use client'
import { useState } from "react";
import { Container } from "@mantine/core";
import Login from "@/app/access/Login";
import Register from "@/app/access/Register";
import RecoveryPassword from "@/app/access/RecoveryPassword";
import './login.css';

export default function Home() {

  //Sistema para arbetura das modais Login, Cadastro e Recuperação de senha
  const [modalLogin, setModalLogin] = useState(true);
  const [modalRegister, setModalRegister] = useState(false);
  const [modalRecoveryPassword, setModalRecoveryPassword] = useState(false);

  const openModal = (modal)=>{
    if(modal == "login"){
      setModalLogin(true)
      setModalRegister(false);
      setModalRecoveryPassword(false);
    }
    if(modal == "register"){
      setModalLogin(false)
      setModalRegister(true);
      setModalRecoveryPassword(false);
    }
    if(modal == "recoveryPassword"){
      setModalLogin(false)
      setModalRegister(false);
      setModalRecoveryPassword(true);
    }
    if(modal == "login"){
      setModalLogin(true)
      setModalRegister(false);
      setModalRecoveryPassword(false);
    }
    if(modal == "register"){
      setModalLogin(false)
      setModalRegister(true);
      setModalRecoveryPassword(false);
    }
  }

  return (
    <Container className="background" fluid h="100vh">
      {modalRecoveryPassword == true ? (<RecoveryPassword openModal={openModal}></RecoveryPassword>) : (null)}
      {modalRegister == true ? (<Register openModal={openModal}></Register>) : (null)}
      {modalLogin == true ? (<Login openModal={openModal}></Login>) : (null)}
    </Container>
  );
}
