'use client'
import { Container } from "@mantine/core";
import { TextInput, Button, Anchor, Divider, Text } from "@mantine/core";
import {IconBallFootball, IconAt, IconRepeat } from "@tabler/icons-react/dist/esm/tabler-icons-react";
import { useForm } from "@mantine/form";
import '../login.css';
import api from "../../services/api";
import { notifications } from "@mantine/notifications";

export default function RecoveryPassword(props) {
  
  //Criação e validação do formulário.
  const form = useForm({
    initialValues:{
      email: "",
    },

    validate:{
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Verifique esse campo.'),
    }
  })

  //Função responsável por enviar os dados coletados do form para a API;
  const sendData = (values)=>{
    api.put("/users/recovery-password",values).then((response)=>{
      notifications.show({
        title: "Sucesso!",
        message: response.data.message,
        color: "green"
      });
      props.openModal("login");
    }).catch((error)=>{
      notifications.show({
        title: "Erro!",
        message: error.response.data.message,
        color: "red"
      });
    })
  }

  return (
      <Container className="containerMain">
        <h1>Recuperar senha</h1>
        <form onSubmit={form.onSubmit((values)=>{sendData(values)})}>
          <TextInput placeholder="E-mail" radius="xl" leftSection={<IconAt></IconAt>} {...form.getInputProps("email")}></TextInput>
          <Text size="xs" ta="center" c="black">Ao clicar em "Recuperar <IconRepeat size="10"></IconRepeat>" uma nova senha para a sua conta irá ser gerada e encaminhada para o seu e-mail.</Text>
          <Button type="submit" fullWidth rightSection={<IconRepeat></IconRepeat>}>Recuperar</Button>
        </form>
        <Divider my="md" className="hr" label={<IconBallFootball></IconBallFootball>}/>
        <Anchor onClick={()=>{props.openModal("login")}}>Voltar para tela de login.</Anchor>
      </Container>
  );
}
