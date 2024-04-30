'use client'
import { useEffect, useState } from "react";
import "./users.css";
import api from "@/services/api";
import Base from "../../components/Base/Base.js";
import Filter from "../../components/Filters/Filters.js";
import {Button, TextInput, Select, Modal, Text, Badge} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useDisclosure } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendarEvent, IconFilter, IconPlus, IconTrash, IconEdit, IconUsersGroup } from "@tabler/icons-react";
import Add from "./add/Add.js";
import Edit from "./edit/Edit";
import Groups from "./groups/Groups";
import TablePagination from "../../components/TablePagination/TablePagination.js";
import { useForm } from "@mantine/form";
const dayjs = require("dayjs");

export default function Users(){

    /* INÍCIO DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    let keywordView = "viewUsers";
    let keywordDel = "delUsers";
    let keywordAdd = "addUsers";
    let keywordEdit = "editUsers";
    let keywordGroup = "groupUsers";

    const [rkeywordView, setRkeywordView] = useState(null);
    const [rkeywordDel, setRkeywordDel] = useState(null);
    const [rkeywordAdd, setRkeywordAdd] = useState(null);
    const [rkeywordEdit, setRkeywordEdit] = useState(null);
    const [rkeywordGroup, setRkeywordGroup] = useState(null);

    /* FIM DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/
    
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const [groups, setGroups] = useState([]);

    const [modalAdd, modalAddHandlers] = useDisclosure(false, {onOpen: ()=>{}, onClose: ()=>{}});
    const [modalEdit, modalEditHandlers] = useDisclosure(false, {onOpen: ()=>{}, onClose: ()=>{getAllUsers()}});
    const [modalGroups, modalGroupsHandlers] = useDisclosure(false, {onOpen: ()=>{}, onClose: ()=>{}});

    const filterForm = useForm({
        initialValues: {
            name: "",
            group: "",
            gender: "",
            date_birth: "",
            status: ""
        },
    })

    const openDeleteModal = (value) => {
        modals.openConfirmModal({
            title: "Deletar usuário",
            centered: true,
            children: (
                <Text size="sm">
                    Você tem certeza que deseja deletar esse usuário? Essa ação não poderá ser desfeita e todo o histórico dessa pessoa será perdido.
                </Text>
            ),
            labels: {confirm: "Deletar", cancel: "Não, eu não quero deletar"},
            confirmProps: {color: "red"},
            onCancel: ()=> {},
            onConfirm: ()=> deleteData(value)
        })
    }

    const deleteData = (value)=>{
        api.delete(`/users/${value}`).then((response)=>{
            getAllUsers();
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

    const getAllUsers = (values)=>{
        if(values == undefined || (values.name == "" && values.group == "" && values.gender == "" && values.date_birth == "" && values.status == "")){
            api.get("/users/users/all/").then((response)=>{
                let usersAux = [];
    
                response.data.forEach((user)=>{
                    let pcd = user.pcd;
                    if(pcd == "no"){
                        pcd = <Badge color="grey">Não</Badge>
                    }
                    if(pcd == "yes"){
                        pcd = <Badge color="blue">Sim</Badge>
                    }
                    usersAux.push({name: user.name, gender: user.gender, pcd: pcd, date_birth: user.date_birth, email: user.email, phone_number: user.phone_number, actions: <div className="tableActions"><Button size="xs" onClick={()=>{openDeleteModal(user.id)}} color="red" leftSection={<IconTrash></IconTrash>} disabled={!rkeywordDel}>Deletar</Button><Button size="xs" onClick={()=>{setSelectedUser(user.id);modalEditHandlers.open()}} color="yellow" leftSection={<IconEdit></IconEdit>} disabled={!rkeywordEdit}>Editar</Button><Button size="xs" onClick={()=>{setSelectedUser(user.id);modalGroupsHandlers.open()}} color="blue" leftSection={<IconUsersGroup></IconUsersGroup>} disabled={!rkeywordGroup}>Grupos</Button></div>});
                })
    
                setUsers(usersAux);
            });
        }else{
            let query = "";

            if(values.name.length > 0){
                query += `name=${values.name}&`;
            }
            if(values.group != null && values.group.length > 0){
                query += `group=${values.group}&`;
            }
            if(values.gender != null && values.gender.length > 0){
                query += `gender=${values.gender}&`;
            }
            if(values.date_birth.length > 0 && values.date_birth[0] != null){
                query += `date_birth_ini=${dayjs(values.date_birth[0]).format("YYYY-MM-DD")}&date_birth_end=${dayjs(values.date_birth[1]).format("YYYY-MM-DD")}`;
            }
            if(values.status != null && values.status.length > 0){
                query += `status=${values.status}&`;
            }

            api.get("/users/users/all?"+query).then((response)=>{
                let usersAux = [];
    
                response.data.forEach((user)=>{
                    let pcd = user.pcd;
                    if(pcd == "no"){
                        pcd = <Badge color="blue">Sim</Badge>
                    }
                    if(pcd == "yes"){
                        pcd = <Badge color="grey">Não</Badge>
                    }
                    usersAux.push({name: user.name, gender: user.gender, pcd: pcd, date_birth: user.date_birth, email: user.email, phone_number: user.phone_number, actions: <div className="tableActions"><Button size="xs" onClick={()=>{openDeleteModal(user.id)}} color="red" leftSection={<IconTrash></IconTrash>} disabled={!rkeywordDel}>Deletar</Button><Button size="xs" onClick={()=>{setSelectedUser(user.id);modalEditHandlers.open()}} color="yellow" leftSection={<IconEdit></IconEdit>} disabled={!rkeywordEdit}>Editar</Button><Button size="xs" onClick={()=>{setSelectedUser(user.id);modalGroupsHandlers.open()}} color="blue" leftSection={<IconUsersGroup></IconUsersGroup>} disabled={!rkeywordGroup}>Grupos</Button></div>});
                })
    
                setUsers(usersAux);
            }).catch((err)=>{
                console.log(err)
                setUsers([{message: "Nenhum usuário encontrado!"}])
            });
        }
        
    }

    const getAllGroups = ()=>{
        api.get("/access-group/all").then((response)=>{
            let acGroupAux = [];

            response.data.forEach((acGroup)=>{
                acGroupAux.push({value: `${acGroup.id}`, label: acGroup.name})
            })
           
            setGroups(acGroupAux);
        }).catch((error)=>{
            
        })
    }

    const verifyPermissions = ()=>{
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordView}`).then((response)=>{
            setRkeywordView(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordAdd}`).then((response)=>{
            setRkeywordAdd(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordDel}`).then((response)=>{
            setRkeywordDel(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordEdit}`).then((response)=>{
            setRkeywordEdit(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordGroup}`).then((response)=>{
            setRkeywordGroup(response.data.access);
        });

    }

    const dateBirthSelect = (value)=>{
        filterForm.setValues({date_birth: value})
    }

    useEffect(()=>{
        if(rkeywordView == false){
            notifications.show({
                title: "Erro!",
                message: "Você não possui permissão para acessar essa página.",
                color: "red"
            })
            window.location.href = "/home";
        }
    },[rkeywordView])

    useEffect(()=>{
        verifyPermissions();
        getAllGroups();
    },[])

    useEffect(()=>{
       getAllUsers();
    },[rkeywordAdd,rkeywordDel,rkeywordEdit,rkeywordView,rkeywordGroup])

    return(<>
    <Base>
        <Modal opened={modalAdd} onClose={modalAddHandlers.close} title="Cadastrar usuário">
            <Add closeModal={modalAddHandlers.close} getAllUsers={getAllUsers}></Add>
        </Modal>
        <Modal opened={modalEdit} onClose={modalEditHandlers.close} title="Editar usuário">
            <Edit user={selectedUser} closeModal={modalEditHandlers.close} getAllUsers={getAllUsers}></Edit>
        </Modal>
        <Modal opened={modalGroups} onClose={modalGroupsHandlers.close} title="Grupos de acesso">
            <Groups user={selectedUser} closeModal={modalGroupsHandlers.close} getAllUsers={getAllUsers}></Groups>
        </Modal>
        <div className="baseMain">
            <Filter onSubmit={filterForm.onSubmit((values)=>{getAllUsers(values)})}
                title="Usuários"
                buttons={[<Button rightSection={<IconFilter></IconFilter>} type="submit" >Filtrar</Button>,<Button  onClick={()=>{modalAddHandlers.open()}} color="green" rightSection={<IconPlus></IconPlus>} disabled={!rkeywordAdd} >Cadastrar</Button>]}>
                    <TextInput label="Nome" {...filterForm.getInputProps("name")}></TextInput>
                    <Select label="Grupo" data={groups} {...filterForm.getInputProps("group")}></Select>
                    <Select label="Gênero" data={[{value:"female", label:"Feminino"},{value:"male", label: "Masculino"}]} {...filterForm.getInputProps("gender")}></Select>
                    <DatePickerInput className="dateBirthInput" w={"calc(12.938rem * var(--mantine-scale)"} type="range" label={"Data de nascimento"} rightSection={<IconCalendarEvent></IconCalendarEvent>} onChange={(d)=>dateBirthSelect(d)}>
                    </DatePickerInput>
                    <Select label="Status" data={[{value:"active", label:"Ativado"},{value:"desactive", label: "Desativado"}]} {...filterForm.getInputProps("status")}></Select>
            </Filter>
            <TablePagination data={users} head={["Nome", "Gênero", "PCD", "Data de nascimento", "E-mail", "Celular", "Ações"]} numMaxRegsPags={20}></TablePagination>
        </div>
    </Base>
    </>)
}