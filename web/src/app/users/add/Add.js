'use client'
import { TextInput, Select, Button,PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IMaskInput } from "react-imask";
import { DatePickerInput, DatesProvider } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import api from "@/services/api";
import { IconUser, IconLock, IconIdBadge, IconGenderBigender, IconCalendarEvent, IconAt, IconDeviceMobile, IconPlus, IconDisabled } from "@tabler/icons-react/dist/esm/tabler-icons-react";


export default function Add(props){

    const genderData = [{value: "female", label: "Feminino"},{value: "male", label: "Masculino"}];

    const form = useForm({
        initialValues:{
          name: "",
          gender: "female",
          pcd: "no",
          birth: new Date(),
          cpf: "",
          email: "",
          cellphone: "",
          password: "",
          confPassword: "",
          user_creator: sessionStorage.getItem("id")
        },
    
        validate:{
          name: (value) => (value.length > 0 ? null : "Preencha esse campo."),
          gender: (value) => (value == "female" || value == "male" ? null : "Preencha esse campo."),
          pcd: (value) => (value == "no" || value == "yes" ? null : "Preencha esse campo."),
          birth: (value) => ((typeof value) === "object" ? null : "Preencha esse campo."),
          cpf: (value) => (value.length == 14 ? null : "Verifique esse campo."),
          email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Verifique esse campo.'),
          cellphone: (value) => (value.length == 16 ? null : "Verifique esse campo."),
          password: (value) => (value.length >= 8 ? null : "A senha precisa ter no mínimo 8 caracteres."),
          confPassword: (value, values) => (value === values.password ? null : "As senhas precisam ser iguais.")
        }
      });

    const sendData = (values)=>{

        api.post("/users/register",values).then((response)=>{
            if(response.status == 200){
                notifications.show({
                    title: "Sucesso!",
                    message: "O cadastro foi realizado com sucesso!",
                    color: "green"
                })
                props.getAllUsers();
                props.closeModal();
            }
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: "Já existe um usuário cadastrado com algumas dessas informações: CPF, e-mail ou celular.",
                color: "red"
            })
        })

    }

    return(
        <form onSubmit={form.onSubmit((values)=>{sendData(values)})}>
           <TextInput placeholder="Nome" radius="xl" leftSection={<IconUser></IconUser>}{...form.getInputProps("name")}></TextInput>
           <Select placeholder="Gênero" data={genderData} defaultValue="female" radius="xl" checkIconPosition="left" leftSection={<IconGenderBigender></IconGenderBigender>}{...form.getInputProps("gender")}></Select>
           <Select placeholder="Pessoa com deficiência (PCD)" data={[{value: "yes", label: "Sim"},{value: "no", label: "Não"}]} defaultValue="no" radius="xl" checkIconPosition="left" leftSection={<IconDisabled></IconDisabled>}{...form.getInputProps("pcd")}></Select>
                <DatesProvider><DatePickerInput placeholder="Data de nascimento" radius="xl" leftSection={<IconCalendarEvent></IconCalendarEvent>}{...form.getInputProps("birth")}/></DatesProvider>
                <TextInput placeholder="CPF" component={IMaskInput} mask="000.000.000-00" radius="xl" leftSection={<IconIdBadge></IconIdBadge>}{...form.getInputProps("cpf")}></TextInput>
                <TextInput placeholder="E-mail" radius="xl" leftSection={<IconAt></IconAt>} {...form.getInputProps("email")}></TextInput>
                <TextInput placeholder="Celular" component={IMaskInput} mask="(00) 0 0000-0000" radius="xl" leftSection={<IconDeviceMobile></IconDeviceMobile>}{...form.getInputProps("cellphone")}></TextInput>
                <PasswordInput w="100%" placeholder="Senha" radius="xl" leftSection={<IconLock></IconLock>}{...form.getInputProps("password")}></PasswordInput>
                <PasswordInput w="100%" placeholder="Confime sua senha" radius="xl" leftSection={<IconLock></IconLock>}{...form.getInputProps("confPassword")}></PasswordInput>
            <Button color="green" type="submit" fullWidth leftSection={<IconPlus></IconPlus>}>Cadastrar</Button> 
        </form>
    );
}