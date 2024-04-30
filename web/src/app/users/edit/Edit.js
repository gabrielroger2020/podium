'use client'
import { TextInput, Switch, Button, Tooltip, Text, Flex } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IMaskInput } from "react-imask";
import { DatePickerInput, DatesProvider } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import api from "@/services/api";
import { useEffect, useState } from "react";
import {IconInfoCircleFilled, IconPower, IconEdit } from "@tabler/icons-react/dist/esm/tabler-icons-react";


export default function Edit(props){

    const [infosUser, setInfosUser] = useState({name: "", cpf: ""});

    const twofaForm = useForm();
    const statusForm = useForm(
        {
            initialValues: {
                status: false
            }
        }
    );

    const infosForm = useForm({
        initialValues: {
            email: "",
            phoneNumber: ""
        }, validate:{
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Verifique esse campo.'),
            phoneNumber: (value) => (value.length == 16 ? null : "Verifique esse campo."),
        }
    });

    const disableTwofa = ()=>{
        api.put(`/users/disable-2fa/${props.user}`,{user: props.user}).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            });
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            });
        })
    }

    const updateStatus = (values)=>{
        api.put(`/users/update-status/${props.user}?status=${values.status}`).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            });
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            });
        })
    }

    const updateInfos = (values)=>{
        api.put(`/users/${props.user}?email=${values.email}&cellphone=${values.phoneNumber}`).then((response)=>{
            if(response.status == 200){
                notifications.show({
                    title: "Sucesso!",
                    message: response.data.message,
                    color: "green"
                })
            }
        }).catch((error)=>{
            console.log(error);
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            })
        })
    }

    useEffect(()=>{
        api.get(`/users/${props.user}`).then((response)=>{
            setInfosUser(response.data);
            statusForm.setValues({status: response.data.status});
            infosForm.setValues({email: response.data.email, phoneNumber: response.data.phone_number});
        }).catch((error)=>{
            console.log(error);
        })
    },[]);

    return(
        <Flex direction={"column"} gap={"1vh"}>
            <div className="settingGroup">
                <h3>Autenticação de dois fatores (2FA)
                    <Tooltip label="A ativação da autenticação de dois fatores só pode ser realizada pelo próprio usuário, porém usuários administradores possuem poder para desativar." multiline inline withArrow w={220}><IconInfoCircleFilled></IconInfoCircleFilled></Tooltip>
                </h3>
                <form onSubmit={twofaForm.onSubmit(disableTwofa)}>
                    <Text size="sm">É recomendado utilizar essa função quando os usuários perdem o acesso ao Google Authenticator ou ao aparelho celular.</Text>
                <Button type="submit" className="submitButton" color="red" leftSection={<IconPower></IconPower>}>Desativar 2FA</Button>
                </form>
            </div>
            <div className="settingGroup">
                <h3>Status
                    <Tooltip label="Um usuário desativado fica impossibilitado de acessar o sistema, porém suas informações ainda continuam armazenadas." multiline inline withArrow w={220}><IconInfoCircleFilled></IconInfoCircleFilled></Tooltip>
                </h3>
                <form onSubmit={statusForm.onSubmit((values)=>{updateStatus(values)})}>
                <Switch checked={statusForm.values.status} label="Deseja ativar o acesso do usuário?" labelPosition="left" onLabel="ON" offLabel="OFF" size="md" {...statusForm.getInputProps("status")}/>
                <Button type="submit" className="submitButton" color="yellow" leftSection={<IconEdit></IconEdit>}>Editar</Button>
                </form>
            </div>
            <div className="settingGroup">
                <h3>Alterar dados cadastrais
                    <Tooltip label="Por questões de segurança as informações CPF e nome não podem ser alteradas. " multiline inline withArrow w={220}><IconInfoCircleFilled></IconInfoCircleFilled></Tooltip>
                </h3>
                <form onSubmit={infosForm.onSubmit((values)=>{updateInfos(values)})}>
                    <TextInput label="Nome" defaultValue={infosUser.name} disabled></TextInput>
                    <TextInput label="CPF" defaultValue={infosUser.cpf} disabled></TextInput>
                    <TextInput label="E-mail" {...infosForm.getInputProps("email")}></TextInput>
                    <TextInput label="Celular" component={IMaskInput} mask="(00) 0 0000-0000" {...infosForm.getInputProps("phoneNumber")} ></TextInput>
                    <Button type="submit" className="submitButton">Alterar</Button>
                </form>
            </div>
        </Flex>
    );
}