'use client'
import {useEffect, useState} from "react";
import { Paper,Button,Switch,Tooltip, Modal, Flex, Text, Mark, TextInput, PasswordInput, FileInput, Badge, Image} from "@mantine/core"
import { IconEdit, IconEye, IconInfoCircleFilled, IconPhoto, IconUpload } from "@tabler/icons-react"
import {useForm} from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import api from "@/services/api";
import { notifications } from "@mantine/notifications";
import { IMaskInput } from "react-imask";
import configUrl from "../../services/configUrl";

export default function UserSettings(){

    const [infosUser, setInfosUser] = useState({});
    const form2FA = useForm({initialValues:{
        twofa: false
    }});
    const formAlterInfos = useForm({initialValues: {
        email: "",
        phoneNumber: ""
    }, validate:{
        email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Verifique esse campo.'),
        phoneNumber: (value) => (value.length == 16 ? null : "Verifique esse campo."),
    }
    });
    const formAlterPassword = useForm({initialValues: {
        password: "",
        confPassword: ""
    }, validate: {
        password: (value) => (value.length >= 8 ? null : "A senha precisa ter no mínimo 8 caracteres."),
        confPassword: (value, values) => (value === values.password ? null : "As senhas precisam ser iguais.")
    }})
    const formImageProfile = useForm({initialValues: {
        user: sessionStorage.getItem("id"),
        file: null
    }, validate: {
        file: (value) => (value != null) ? (null):("Nenhuma imagem foi selecionada.")
    }})

    const [opened2FA, handlers2FA] = useDisclosure(false);
    const [qrcode2FA, setQrCode2FA] = useState(null);
    const [profileImageInfos, setProfileImageInfos] = useState({
        path: null,
        status: null,
        description: null
    });

    const getProfileImageInfos = ()=>{
        api.get(`/users/profile-image/${sessionStorage.getItem("id")}`).then((response)=>{
            if(response.data != null && response.data != undefined && response.data != ""){
                let status = "";
                if(response.data.status == "approved"){
                    status = <Badge color="green">Aprovado</Badge>
                }
                if(response.data.status == "recused"){
                    status = <Flex direction={"row"} align={"center"}><Badge color="red">Recusado</Badge> <Tooltip label={response.data.status_description} multiline inline withArrow w={220}><IconInfoCircleFilled></IconInfoCircleFilled></Tooltip></Flex>
                }
                if(response.data.status == "waiting"){
                    status = <Badge color="yellow">Em análise</Badge>
                }
                setProfileImageInfos({
                    path: response.data.path,
                    status: status,
                    description: response.data.status_description
                });
            }else{
                setProfileImageInfos({
                    path: null,
                    status: <Badge color="grey">Não enviado</Badge>,
                    description: null
                });
            }
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: "Não foi possível obter as informações sobre a foto de perfil do usuário.",
                color: "red"
            })
        })
    }

    useEffect(()=>{
        api.get(`/users/${sessionStorage.getItem("id")}`).then((response)=>{
            form2FA.setValues({
                twofa: response.data.twofa
            });
            formAlterInfos.setValues({
                email: response.data.email,
                phoneNumber: response.data.phone_number
            })
            setInfosUser(response.data);
        }).catch((error)=>{
            console.log(error);
        });

        getProfileImageInfos();
    },[]);


    //Formulário para controlar a autenticação 2FA
    const form2FASendData = (e)=>{
        e.preventDefault();
        if(form2FA.values.twofa != infosUser.twofa && form2FA.values.twofa == 1){
            api.post("/users/2fa",{user: sessionStorage.getItem("id")}).then((response)=>{
                setQrCode2FA(response.data.qrcode);
                
                notifications.show({
                    title: "Sucesso!",
                    message: "Autenticação de dois fatores ativada com sucesso.",
                    color: "green"
                });
                handlers2FA.open();
                let aux = infosUser;
                aux.twofa = 1;
                setInfosUser(aux);
            }).catch((error)=>{
                notifications.show({
                    title: "Erro!",
                    message: "Erro ao desativar autenticação de dois fatores.",
                    color: "red"
                });
            })
        }else{  

        }
        if(form2FA.values.twofa != infosUser.twofa && form2FA.values.twofa == 0){
            api.post("/users/2fa-deactivation",{user: sessionStorage.getItem("id")}).then((response)=>{
                notifications.show({
                    title: "Sucesso!",
                    message: "Autenticação de dois fatores desativada com sucesso.",
                    color: "green"
                });
                let aux = infosUser;
                aux.twofa = 0;
                setInfosUser(aux);
            }).catch((error)=>{
                notifications.show({
                    title: "Erro!",
                    message: "Erro ao desativar autenticação de dois fatores.",
                    color: "red"
                });
            })
        }else{  

        }
    }

    //Formulário para alterar os dados cadastrais
    const formAlterInfosSendData = (values)=>{
        if(values.email != infosUser.email || values.phoneNumber != infosUser.phone_number){
            api.put(`/users/${sessionStorage.getItem("id")}?email=${values.email}&cellphone=${values.phoneNumber}`).then((response)=>{
                if(response.status == 200){
                    notifications.show({
                        title: "Sucesso!",
                        message: response.data.message,
                        color: "green"
                    })
                    let aux = infosUser;
                    aux.email = values.email;
                    aux.phone_number = values.phoneNumber;
                    setInfosUser(aux);
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
    }

    const formAlterPasswordSendData = (values)=>{
        api.put("/users/password/",{user: sessionStorage.getItem("id"), password: formAlterPassword.values.password}).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            });
        }).catch((err)=>{
            notifications.show({
                title: "Erro!",
                message: err.response.data.message,
                color: "red"
            });
        });
    }

    const formImageProfileSenData = (values)=>{

        let formData = new FormData();
        formData.append("file", values.file);

        api.post(`/users/image-profile?user=${values.user}`, formData, {headers: {
            "Content-Type": `multipart/form-data;`
            }}).then((response)=>{
                let infos = values;
                infos.file = response.data.filename;
                api.post("/users/save-image-profile", infos).then((response)=>{
                    notifications.show({
                        title: "Sucesso!",
                        message: "A imagem de perfil foi enviada com sucesso!",
                        color: "green"
                    });

                    getProfileImageInfos()
                }).catch((error)=>{
                    console.log(error)
                    notifications.show({
                        title: "Erro!",
                        message: error.response.data.message,
                        color: "red"
                    })
                })

        }).catch((error)=>{
            console.log(error)
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            })
        })
    }

    return(
        <>
        <Modal title={"Autenticação de dois fatores (2FA)"} opened={opened2FA} onClose={()=>{handlers2FA.close()}} withCloseButton={true} >
            <Flex direction={"column"} justify={"center"} align={"center"}>
            <h2 style={{textAlign: "center"}}>Autenticação de dois fatores ativada com sucesso!</h2>
            <img src={qrcode2FA}></img>
            <Text ta={"center"}>A autenticação de dois fatores foi ativada, escaneie o QR Code acima no aplicativo <Mark>Google Authenticator ou similizares</Mark> e conclua a configuração 2FA.</Text>
            <Text ta={"center"} fw="700">Tome muito cuidado, não feche essa aba sem concluir o processo de configuração no aplicativo. Esse QRCode não poderá ser recuperado!</Text>
            </Flex>
        </Modal>


        <Paper p={"1vh"}>
        <Flex direction={"column"} gap={"1vh"}>
            <div className="settingGroup">
                    <h3>Autenticação de dois fatores (2FA)
                        <Tooltip label="Para ativar esta funcionalidade é necessário ter o aplicativo Google Authenticator instalado em seu celular." multiline inline withArrow w={220}><IconInfoCircleFilled></IconInfoCircleFilled></Tooltip>
                    </h3>
                    <form onSubmit={(e)=>{form2FA.onSubmit(form2FASendData(e))}}>
                        <Switch checked={form2FA.values.twofa} label="Deseja ativar a autenticação de 2 fatores em sua conta?" labelPosition="left" onLabel="ON" offLabel="OFF" size="md" {...form2FA.getInputProps("twofa")}/>
                        <Button w={"10%"} type="submit" className="submitButton" color="yellow" leftSection={<IconEdit></IconEdit>}>Alterar</Button>
                    </form>
                </div>

                <div className="settingGroup">
                    <h3>Foto de perfil</h3>
                    <form onSubmit={formImageProfile.onSubmit((e)=>{formImageProfileSenData(e)})}>
                        <FileInput radius={"xl"} accept={".png,.jpg,.jpeg"} leftSection={<IconPhoto></IconPhoto>} rightSection={<IconUpload></IconUpload>} label={"Foto de perfil"} placeholder={"Enviar foto de perfil"} {...formImageProfile.getInputProps('file')}></FileInput>
                        <Flex direction={"row"} align={"center"} gap={"1vh"}><Text size="xs"><Text span fw={700} inherit>Status: </Text></Text>{profileImageInfos.status}</Flex>
                        <Text size="xs"><Text span fw={700} inherit>Tipos de arquivos suportados: </Text> .png,.jpg,.jpeg</Text>
                        <Flex className="buttonsSettings" direction={"row"} align={"center"} gap={"1vh"}>
                            <Button w={"10%"} type="submit" className="submitButton" color="yellow" leftSection={<IconEdit></IconEdit>}>Alterar</Button>
                            {(profileImageInfos.path != null) ? (<Button w={"10%"} component="a" href={"http://" + configUrl.ip+ ":" +configUrl.port+ "/user-images/" +profileImageInfos.path} target="_blank" type="submit" className="submitButton" leftSection={<IconEye></IconEye>}>Ver</Button>) : (null)}
                        </Flex>
                        
                    </form>
                </div>

                <div className="settingGroup">
                    <h3>Alterar dados cadastrais
                    <Tooltip label="Por questões de segurança as informações CPF e nome não podem ser alteradas. " multiline inline withArrow w={220}><IconInfoCircleFilled></IconInfoCircleFilled></Tooltip>
                    </h3>
                    <form onSubmit={formAlterInfos.onSubmit((values)=>{formAlterInfosSendData(values)})}>
                        <TextInput label="Nome" defaultValue={infosUser.name} disabled></TextInput>
                        <TextInput label="CPF" defaultValue={infosUser.cpf} disabled></TextInput>
                        <TextInput label="E-mail" value={formAlterInfos.values.email} {...formAlterInfos.getInputProps("email")}></TextInput>
                        <TextInput label="Celular" component={IMaskInput} mask="(00) 0 0000-0000" value={formAlterInfos.values.phoneNumber} {...formAlterInfos.getInputProps("phoneNumber")}></TextInput>
                        <Button w={"10%"} type="submit" className="submitButton" color="yellow" leftSection={<IconEdit></IconEdit>}>Alterar</Button>
                    </form>
                </div>

                <div className="settingGroup">
                    <h3>Alterar senha</h3>
                    <form onSubmit={formAlterPassword.onSubmit((values)=>{formAlterPasswordSendData(values)})}>
                        <PasswordInput label="Senha" {...formAlterPassword.getInputProps("password")}/>
                        <PasswordInput label="Confirme a senha" {...formAlterPassword.getInputProps("confPassword")}/>
                        <Button w={"10%"} type="submit" className="submitButton" color="yellow" leftSection={<IconEdit></IconEdit>}>Alterar</Button>
                    </form>
                </div>
            </Flex>
        </Paper>
        </>
    )
}