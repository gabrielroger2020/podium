'use client'
import api from "@/services/api";
import Base from "../../components/Base/Base.js";
import Filter from "../../components/Filters/Filters.js";
import {Button, Modal, Text} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useDisclosure } from "@mantine/hooks";
import {IconPlus, IconTrash, IconEdit} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import TablePagination from "../../components/TablePagination/TablePagination.js";
import Add from "./add/Add.js";
import Edit from "./edit/Edit.js";
import { notifications } from "@mantine/notifications";

export default function AccessGroups(){

    /* INÍCIO DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    let keywordView = "viewGroups";
    let keywordDel = "delGroups";
    let keywordAdd = "addGroups";
    let keywordEdit = "editGroups";

    const [rkeywordView, setRkeywordView] = useState(null);
    const [rkeywordDel, setRkeywordDel] = useState(null);
    const [rkeywordAdd, setRkeywordAdd] = useState(null);
    const [rkeywordEdit, setRkeywordEdit] = useState(null);

    /* FIM DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    const [openedModalAdd, {open, close}] = useDisclosure(false);
    const [openedModalEdit, modalEditHandlers] = useDisclosure(false, {onOpen: ()=>{}, onClose: ()=>{}})
    const [accessGroups, setAccessGroups] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    const openDeleteModal = (value) => {
        modals.openConfirmModal({
            title: "Deletar grupo de acesso",
            centered: true,
            children: (
                <Text size="sm">
                    Você tem certeza que deseja deletar esse grupo de acesso? Essa ação não poderá ser desfeita.
                </Text>
            ),
            labels: {confirm: "Deletar", cancel: "Não, eu não quero deletar"},
            confirmProps: {color: "red"},
            onCancel: ()=> {},
            onConfirm: ()=> deleteData(value)
        })
    }

    const deleteData = (value)=>{
        api.delete(`/access-group/del/${value}`).then((response)=>{
            getAllAccessGroups();
            console.log(response)
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

    }

    const getAllAccessGroups = ()=>{
        api.get("/access-group/all").then((response)=>{
            let acGroupAux = [];

            response.data.forEach((acGroup)=>{
                acGroupAux.push({id: acGroup.id, name: acGroup.name, actions: <div className="tableActions"><Button size="xs" onClick={(button)=>{openDeleteModal(acGroup.id)}} color="red" leftSection={<IconTrash></IconTrash>} disabled={!rkeywordDel} >Deletar</Button><Button size="xs" onClick={()=>{setSelectedUser(acGroup.id); modalEditHandlers.open();}} color="yellow" leftSection={<IconEdit></IconEdit>} disabled={!rkeywordEdit}>Editar</Button></div>})
            })
            setAccessGroups(acGroupAux);
        }).catch((error)=>{
            
        })
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
    },[])

    useEffect(()=>{
       getAllAccessGroups();
    },[rkeywordAdd,rkeywordDel,rkeywordEdit,rkeywordView])

    return(<>
    <Base>
        <Modal opened={openedModalAdd} onClose={close} title="Cadastrar grupo de acesso">
            <Add closeModal={close} getAllAccessGroups={getAllAccessGroups}></Add>
        </Modal>
        <Modal opened={openedModalEdit} onClose={()=>{modalEditHandlers.close()}} title="Editar grupo de acesso">
            <Edit user={selectedUser} closeModal={()=>{modalEditHandlers.close()}} getAllAccessGroups={getAllAccessGroups}></Edit>
        </Modal>
        <div className="baseMain">
            <Filter
                title="Grupos de acesso"
                buttons={[<Button color="green" rightSection={<IconPlus></IconPlus>} onClick={open} disabled={!rkeywordAdd}>Cadastrar</Button>]}>
            </Filter>
            <TablePagination data={accessGroups} head={["ID", "Nome", "Ações"]} numMaxRegsPags={20}/>
        </div>
    </Base>
    </>)
}