'use client'
import api from "@/services/api";
import Base from "../../../components/Base/Base.js";
import Filter from "../../../components/Filters/Filters.js";
import {Button, Modal, Text, Flex} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useDisclosure } from "@mantine/hooks";
import {IconPlus, IconTrash, IconEdit} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import TablePagination from "../../../components/TablePagination/TablePagination.js";
import Add from "./add/Add.js";
import Edit from "./edit/Edit.js";
import { notifications } from "@mantine/notifications";

export default function EntitiesCategories(){

    /* INÍCIO DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    let keywordView = "viewEntitiesCategories";
    let keywordDel = "delEntitiesCategories";
    let keywordAdd = "addEntitiesCategories";
    let keywordEdit = "editEntitiesCategories";

    const [rkeywordView, setRkeywordView] = useState(null);
    const [rkeywordDel, setRkeywordDel] = useState(null);
    const [rkeywordAdd, setRkeywordAdd] = useState(null);
    const [rkeywordEdit, setRkeywordEdit] = useState(null);

    /* FIM DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    const [openedModalAdd, {open, close}] = useDisclosure(false);
    const [openedModalEdit, modalEditHandlers] = useDisclosure(false, {onOpen: ()=>{}, onClose: ()=>{}})
    const [cateogiriesEntities, setCateogiriesEntities] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const openDeleteModal = (value) => {
        modals.openConfirmModal({
            title: "Deletar categoria de entidade",
            centered: true,
            children: (
                <Text size="sm">
                    Você tem certeza que deseja deletar essa categoria de entidade? Essa ação não poderá ser desfeita.
                </Text>
            ),
            labels: {confirm: "Deletar", cancel: "Não, eu não quero deletar"},
            confirmProps: {color: "red"},
            onCancel: ()=> {},
            onConfirm: ()=> deleteData(value)
        })
    }

    const deleteData = (value)=>{
        api.delete(`/entities/category/delete/${value}`).then((response)=>{
            getAllCategoriesEntities()
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

    const getAllCategoriesEntities = ()=>{
        api.get("/entities/category/select").then((response)=>{
            let aux = [];
            if(response.data.length > 0){
                response.data.forEach((category)=>{
                    let actions = <Flex direction="row" gap="1vh"><Button onClick={()=>{openDeleteModal(category.id)}} leftSection={<IconTrash></IconTrash>} color="red" disabled={!rkeywordDel}>Excluir</Button><Button onClick={()=>{setSelectedCategory(category.id);modalEditHandlers.open()}} leftSection={<IconEdit></IconEdit>} color="yellow" disabled={!rkeywordEdit}>Editar</Button></Flex>;
                    aux.push({id: category.id, name: category.name, actions: actions})
                })

                setCateogiriesEntities(aux);
            }else{
                setCateogiriesEntities([{message: "Não encontramos nenhuma categoria de entidade."}]);
            }

        }).catch((error)=>{
            setCateogiriesEntities([{message: "Não encontramos nenhuma categoria de entidade."}]);
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
        getAllCategoriesEntities()
    },[rkeywordAdd,rkeywordDel,rkeywordEdit,rkeywordView])

    return(<>
    <Base>
        <Modal opened={openedModalAdd} onClose={close} title="Cadastrar categoria de entidade">
            <Add closeModal={close} getAllCategoriesEntities={getAllCategoriesEntities}></Add>
        </Modal>
        <Modal opened={openedModalEdit} onClose={()=>{modalEditHandlers.close()}} title="Editar grupo de acesso">
            <Edit id={selectedCategory} closeModal={()=>{modalEditHandlers.close()}} getAllCategoriesEntities={getAllCategoriesEntities}></Edit>
        </Modal>
        <div className="baseMain">
            <Filter
                title="Categorias de entidades"
                buttons={[<Button color="green" rightSection={<IconPlus></IconPlus>} onClick={open} disabled={!rkeywordAdd}>Cadastrar</Button>]}>
            </Filter>
            <TablePagination data={cateogiriesEntities} head={["ID", "Nome", "Ações"]} numMaxRegsPags={20}/>
        </div>
    </Base>
    </>)
}