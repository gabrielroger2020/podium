'use client'
import {useState} from "react";
import { Container, Modal } from "@mantine/core";
import { TextInput, PasswordInput, Button, Anchor, Divider } from "@mantine/core";
import { IconUser, IconLogin, IconLock, IconIdBadge, IconBallFootball } from "@tabler/icons-react/dist/esm/tabler-icons-react";
import { useForm } from "@mantine/form";
import '../login.css';
import api from "../../services/api";
import { notifications } from "@mantine/notifications";
import Login2FA from "./Login2FA.js";

export default function Login(props) {

  //2FA
  const [id, setId] = useState(null);
  const [token, setToken] = useState(null);
  const [tokenLogin, setTokenLogin] = useState(null);
  const [twofaModal, setTwofaModal] = useState(false);


  //Criação e validação do formulário.
  const form = useForm({
    initialValues:{
      login: "",
      password: "",
    },

    validate:{
      login: (value) => (value.length > 0 ? null : "Preencha esse campo."),
      password: (value) => (value.length > 0 ? null : "Preencha esse campo.")
    }
  })

  //Função que vai enviar os dados coletados para API.

  const sendData = (values)=>{
    api.post("/users/login",values).then((response)=>{
      console.log(response);
      if(response.status == 200){
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("token-login", response.data.token_login);
        sessionStorage.setItem("id", response.data.id);
        window.location.replace("/home");
      }if(response.status == 201){
        setId(response.data.id);
        setTokenLogin(response.data.token_login);
        setToken(response.data.token);

        setTwofaModal(true);
      }
    }).catch((error)=>{
      notifications.show({
        title: "Erro!",
        message: error.response.data.message,
        color: "red"
      })
    })
  }

  return (
    <div className="groupLogin">
      {/* ESSE SISTEMA DE MODAIS SERVE PARA ABRIR A JANELA PARA DIGITAR O CÓDIGO 2FA QUANDO NECESSÁRIO */}
      {twofaModal == true ? (<Login2FA user={id} closeModal={()=>{setTwofaModal(false);}} token={token} tokenLogin={tokenLogin}></Login2FA>):(
        <Container className="containerMain">
        <h1>Login</h1>
        <form onSubmit={form.onSubmit((values)=>{sendData(values)})}>
          <TextInput placeholder="CPF / E-mail / Telefone" radius="xl" leftSection={<IconUser></IconUser>} {...form.getInputProps("login")}></TextInput>
          <PasswordInput placeholder="Digite sua senha" radius="xl" leftSection={<IconLock></IconLock>} {...form.getInputProps("password")}></PasswordInput>
          <Button type="submit" fullWidth rightSection={<IconLogin></IconLogin>}>Entrar</Button>
          <Button fullWidth variant="light" rightSection={<IconIdBadge></IconIdBadge>} onClick={()=>{props.openModal("register")}}>Cadastrar-se</Button>
        </form>
        <Divider my="md" className="hr" label={<IconBallFootball></IconBallFootball>}/>
        <Anchor onClick={()=>{props.openModal("recoveryPassword")}}>Esqueceu a senha?</Anchor>
      </Container>
     )}
      
    </div>
  );
}
