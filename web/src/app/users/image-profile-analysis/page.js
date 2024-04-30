'use client'
import { Tooltip, Flex, Button, Modal, Text, Anchor, TextInput, Select, Badge, Menu } from "@mantine/core";

import {useForm} from "@mantine/form";
import Base from "../../../components/Base/Base.js";
import Filter from "../../../components/Filters/Filters.js";
import { IconInfoCircleFilled, IconFilter, IconDownload, IconEdit, IconCircleDashedCheck, IconCircleDashedX, IconEye } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { useEffect, useState } from "react";
import TablePagination from "../../../components/TablePagination/TablePagination.js";
import api from "@/services/api";
import configUrl from "../../../services/configUrl";
const dayjs = require("dayjs");

export default function ImageProfileAnalysis(){

    /* INÍCIO DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    let keywordView = "viewImagesProfileAnalysis";

    const [rkeywordView, setRkeywordView] = useState(null);

    /* FIM DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    const verifyPermissions = ()=>{
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordView}`).then((response)=>{
            setRkeywordView(response.data.access);
        });

    }

    const filterForm = useForm({
        initialValues: {
            user_id: "",
            name: "",
            pcd: "",
            status: "",
            date_order: "",
            alphabetical_order: ""
        }, validate:{
            user_id: (value) => (((new RegExp("^[0-9]+$")).test(value) == true || value == "" || value == null) ? (null) : ('Esse campo só aceita números.')),
            date_order: (value, values)=>(((values.alphabetical_order != "" && values.alphabetical_order != null) && (value != null && value != "") ? ('Só é possível selecionar uma forma de ordenação.') : (null))),
            alphabetical_order: (value, values)=>(((values.date_order != "" && values.date_order != null) && (value != null && value != "") ? ('Só é possível selecionar uma forma de ordenação.') : (null))),
        }
    });

    const [selectedImg, setSelectedImg] = useState(null)
    const [imgs, setImgs] = useState([]);
    const [imgsTable, setImgsTable] = useState([]);
    const [description, setDescription] = useState("");
    const [modalRecuse, modalRecuseHandlers] = useDisclosure(false, {onClose: ()=>{}, onOpen: ()=>{}});
    let dataStatus = [{value: "waiting", label: "Em análise"},{value: "approved", label: "Aprovado"},{value: "recused", label: "Recusado"}];

    const getImages = (values)=>{
        let path = "/image-profile/select?";

        if(values != undefined){
            if(values.user_id != ""){
                path += `user=${values.user_id}&`;
            }
            if(values.name != ""){
                path += `name=${values.name}&`;
            }
            if(values.pcd != "" && values.pcd != null){
                path += `pcd=${values.pcd}&`;
            }
            if(values.status != "" && values.status != null){
                path += `status=${values.status}&`;
            }
            if(values.date_order != "" && values.date_order != null){
                path += `date_order=${values.date_order}&`;
            }
            if(values.alphabetical_order != "" && values.alphabetical_order != null){
                path += `alphabetical_order=${values.alphabetical_order}&`;
            }
        }

        api.get(path).then((response)=>{
            if(response.data.length > 0){
                let aux = [];
                
                response.data.forEach((img)=>{
                    
                    let status = "";
                    let  alter_status = <Menu>
                    <Menu.Target>
                        <Button color="yellow" leftSection={<IconEdit></IconEdit>}>Alterar status</Button>                            
                    </Menu.Target>
                    <Menu.Dropdown>
                    <Menu.Item onClick={()=>{openWaitingModal(img.img_id)}} leftSection={<IconEye></IconEye>}>
                            Em análise
                        </Menu.Item>
                        <Menu.Item onClick={()=>{openApprovedModal(img.img_id)}} leftSection={<IconCircleDashedCheck></IconCircleDashedCheck>}>
                            Aprovado
                        </Menu.Item>
                        <Menu.Item  onClick={()=>{setSelectedImg(img.img_id);modalRecuseHandlers.open()}} leftSection={<IconCircleDashedX></IconCircleDashedX>}>
                            Recusado
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>;
                    let actions = <Flex direction={"row"} gap={"1vh"}><Button component="a" href={"http://" + configUrl.ip+ ":" +configUrl.port+ "/user-images/" +img.img_path} target="_blank" color="blue" leftSection={<IconEye></IconEye>}>Ver</Button>{alter_status}</Flex>
                    if(img.img_status == "approved"){
                        status = <Badge color="green">Aprovado</Badge>;
                    }
                    if(img.img_status == "recused"){
                        status = <Flex direction={"row"} align={"center"}><Badge color="red">Recusado</Badge> <Tooltip label={img.img_status_description} multiline inline withArrow w={220}><IconInfoCircleFilled></IconInfoCircleFilled></Tooltip></Flex>;
                    }
                    if(img.img_status == "waiting"){
                        status = <Badge color="yellow">Aguardando análise</Badge>;
                    }

                    let pcd = "";
                    if(img.user_pcd == "no"){
                        pcd = <Badge color="grey">Não</Badge>
                    }
                    if(img.user_pcd == "yes"){
                        pcd = <Badge color="blue">Sim</Badge>
                    }

                    let date_creation = dayjs(img.img_date_creation).format("DD/MM/YYYY");

                    aux.push({id: img.img_id, date_creation: date_creation, name: img.user_name, pcd: pcd, status: status, actions: actions});
                })
                setImgs(response.data);
                setImgsTable(aux);
            }else{
                setImgs(response.data);
                setImgsTable([{message: "Não encontramos nenhuma foto de perfil."}]);
            }
        }).catch((error)=>{
            console.log(error);
        })
    }

    const changeStatus = (img,status, status_description)=>{
        let path = `/image-profile/change-status?status=${status}`;

        if(status_description != undefined){
            path += `&description=${status_description}`
        }
        api.put(path, {img: img, user: sessionStorage.getItem("id")}).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            });
            getImages();
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            })
        })
    }

    const openApprovedModal = (img)=>{
        modals.openConfirmModal({
            title: "Aprovar foto de perfil",
            centered: true,
            children: (<Text>
                Você confirma a aprovação dessa foto de perfil? Vale ressaltar que a foto de perfil de um usuário fica disponível ao público.
            </Text>),
            labels: {confirm: "Sim, confirmo.", cancel: "Não, cancelar."},
            onCancel: ()=>{},
            onConfirm: ()=>{changeStatus(img,"approved")},
            confirmProps: {color: "green"}
        })
    }

    const openWaitingModal = (img)=>{
        modals.openConfirmModal({
            title: "Foto de perfil em análise",
            centered: true,
            children: (<Text>
                Você confirma a alteração de status para "em análise" dessa foto de perfil?
            </Text>),
            labels: {confirm: "Sim, confirmo.", cancel: "Não, cancelar."},
            onCancel: ()=>{},
            onConfirm: ()=>{changeStatus(img,"waiting")},
            confirmProps: {color: "green"}
        })
    }

    const verifyDescription = (img)=>{
        if(description.length > 0){
            changeStatus(img,"recused",description);
            setDescription("");
            modalRecuseHandlers.close();
        }else{
            notifications.show({
                title: "Erro!",
                message:"É necessário preencher o campo 'Motivo'.",
                color: "red"
                });
        }
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
        getImages();
    },[])

    return(
    <>
        <Base>
        <Modal title="Recusar foto de perfil" opened={modalRecuse}>
            <Flex direction={"column"} gap={"1vh"}>
            <TextInput label="Motivo" placeholder="Motivo da recusa" onChange={(e)=>{setDescription(e.currentTarget.value)}}></TextInput>
            <Text>
                Você confirma a recusa dessa foto de perfil?
            </Text>
            <Button fullWidth color="red" onClick={()=>{
                verifyDescription(selectedImg);
            }}>Recusar</Button>
            </Flex>
        </Modal>
            <div className="baseMain">
                <Filter
                title={<Flex direction={"row"} align={"center"}>Análise de fotos de perfil</Flex>}
                buttons={[<Button rightSection={<IconFilter></IconFilter>} type="submit" >Filtrar</Button>]}
                onSubmit={filterForm.onSubmit((values)=>{getImages(values)})}
                >  
                    <TextInput label="ID do usuário" {...filterForm.getInputProps("user_id")}></TextInput>
                    <TextInput label="Nome" {...filterForm.getInputProps("name")}></TextInput>
                    <Select data={[{value: "yes", label: "Sim"}, {value: "no", label: "Não"}]} label="PCD" {...filterForm.getInputProps("pcd")}></Select>
                    <Select data={dataStatus} label="Status" {...filterForm.getInputProps("status")}></Select>
                    <Select data={[{value: "old", label: "Do mais antigo para o mais recente"},{value: "new", label: "Do mais recente para o mais antigo"}]} label="Ordenar p/ data" {...filterForm.getInputProps("date_order")}></Select>
                    <Select data={[{value: "yes", label: "Sim"},{value: "no", label: "Não"}]} label="Ordenar p/ ordem alfabética" {...filterForm.getInputProps("alphabetical_order")}></Select>
                 </Filter>
                <TablePagination data={imgsTable} head={["ID","Data de envio","Nome do usuário","PCD","Status","Ações"]} numMaxRegsPags={20}></TablePagination>
            </div>
        </Base>
    </>
    )
}