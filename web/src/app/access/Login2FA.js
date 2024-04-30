'use client'
import { Container,Image } from "@mantine/core";
import { Button, Anchor, Divider, PinInput} from "@mantine/core";
import { IconLogin, IconBallFootball } from "@tabler/icons-react/dist/esm/tabler-icons-react";
import { useForm } from "@mantine/form";
import '../login.css';
import api from "../../services/api";
import { notifications } from "@mantine/notifications";

export default function Login2FA(props) {

  //Criação e validação do formulário.
  const form = useForm({
    initialValues:{
      token: ""
    },

    validate:{
      token: (value) => (value.length > 0 ? null : "Preencha esse campo."),
    }
  })

  //Função que vai enviar os dados coletados para API.

  const sendData = ()=>{
    console.log(form.values.token)
    api.post("/users/2fa-verify",{id: props.user, token: form.values.token}).then((response)=>{
      if(response.status == 200){
        sessionStorage.setItem("token", props.token);
        sessionStorage.setItem("token-login", props.tokenLogin);
        sessionStorage.setItem("id", props.user);
        window.location.replace("/home");
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
      <Container className="containerMain container2FA">
        <h1>Login - 2FA</h1>
        <form onSubmit={form.onSubmit(()=>{sendData()})}>
            <PinInput length={6} type={"number"} {...form.getInputProps("token")}/>
            <Button fullWidth type="submit" rightSection={<IconLogin></IconLogin>}>Entrar</Button>
        </form>
        <Divider my="md" className="hr" label={<IconBallFootball></IconBallFootball>}/>
        <Anchor onClick={()=>{props.closeModal()}}>Voltar</Anchor>
      </Container>
  );
}
