'use client'
import { Button, TextInput, Select, Badge, Tooltip, Flex, Modal, Text, Menu } from "@mantine/core";
import Base from "../../../components/Base/Base";
import Filters from "../../../components/Filters/Filters";
import TablePagination from "../../../components/TablePagination/TablePagination"
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { IconFilter, IconEye, IconCircleDashedX, IconCircleDashedCheck, IconEdit, IconInfoCircleFilled  } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import api from "@/services/api";
import configUrl from "@/services/configUrl";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useDisclosure } from "@mantine/hooks";

export default function ImageAnalysis(){

    /* INÍCIO DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    let keywordView = "viewShieldsEntitiesAnalysis";

    const [rkeywordView, setRkeywordView] = useState(null);

    /* FIM DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    const verifyPermissions = ()=>{
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordView}`).then((response)=>{
            setRkeywordView(response.data.access);
        });

    }

    const filterForm = useForm({
        initialValues: {
            id: "",
            entity: "",
            email: "",
            date_order: "",
            alphabetical_order: ""
        }, validate: {
            id: (value) => (((new RegExp("^[0-9]+$")).test(value) == true || value == "" || value == null) ? (null) : ('Esse campo só aceita números.')),
            date_order: (value, values)=>(((values.alphabetical_order != "" && values.alphabetical_order != null) && (value != null && value != "") ? ('Só é possível selecionar uma forma de ordenação.') : (null))),
            alphabetical_order: (value, values)=>(((values.date_creation != "" && values.date_creation != null) && (value != null && value != "") ? ('Só é possível selecionar uma forma de ordenação.') : (null))),
        }
    });

    const [data, setData] = useState([]);
    const [dataTable, setDataTable] = useState([]);
    const [description, setDescription] = useState("");
    const [modalRecuse, modalRecuseHandlers] = useDisclosure(false, {onClose: ()=>{}, onOpen: ()=>{}});
    const [selectedShield, setSelectedShield] = useState(null);

    const openApprovedModal = (img)=>{
        modals.openConfirmModal({
            title: "Aprovar escudo",
            centered: true,
            children: (<Text>
                Você confirma a aprovação desse escudo? Vale ressaltar que o escudo fica disponível ao público.
            </Text>),
            labels: {confirm: "Sim, confirmo.", cancel: "Não, cancelar."},
            onCancel: ()=>{},
            onConfirm: ()=>{changeStatus(img,"approved")},
            confirmProps: {color: "green"}
        })
    }

    const openWaitingModal = (img)=>{
        modals.openConfirmModal({
            title: "Escudo em análise",
            centered: true,
            children: (<Text>
                Você confirma a alteração de status para "em análise" desse escudo?
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

    const changeStatus = (img,status, status_description)=>{
        let path = `/entities/shield-image/change-status?status=${status}`;

        if(status_description != undefined){
            path += `&description=${status_description}`
        }
        api.put(path, {id: img}).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            });
            getShields();
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            })
        })
    }

    const getShields = (values)=>{
        let path = `/entities/shield-image/select/all?`;

        if(values != undefined){
            if(values.id != "" && values.id != undefined){
                path += `id=${values.id}&`;
            }
            if(values.entity != "" && values.entity != undefined){
                path += `entity=${values.entity}&`;
            }
            if(values.email != "" && values.email != undefined){
                path += `email=${values.email}&`;
            }
            if(values.date_order != "" && values.date_order != undefined){
                path += `date_order=${values.date_order}&`;
            }
            if(values.alphabetical_order != "" && values.alphabetical_order != undefined){
                path += `alphabetical_order=${values.alphabetical_order}&`;
            }
        }

        api.get(path).then((response)=>{
            if(response.data.length > 0){
                let shieldAux = [];
                setData(response.data);
                response.data.forEach((shield)=>{
                    let  alter_status = <Menu>
                    <Menu.Target>
                        <Button color="yellow" leftSection={<IconEdit></IconEdit>}>Alterar status</Button>                            
                    </Menu.Target>
                    <Menu.Dropdown>
                    <Menu.Item onClick={()=>{openWaitingModal(shield.id)}} leftSection={<IconEye></IconEye>}>
                            Em análise
                        </Menu.Item>
                        <Menu.Item onClick={()=>{openApprovedModal(shield.id)}} leftSection={<IconCircleDashedCheck></IconCircleDashedCheck>}>
                            Aprovado
                        </Menu.Item>
                        <Menu.Item  onClick={()=>{setSelectedShield(shield.id);modalRecuseHandlers.open()}} leftSection={<IconCircleDashedX></IconCircleDashedX>}>
                            Recusado
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>;

                    let actions = <Flex direction={"row"} gap={"1vh"}><Button component="a" href={"http://" + configUrl.ip+ ":" +configUrl.port+ "/entity-shields/" + shield.image} target="_blank" color="blue" leftSection={<IconEye></IconEye>}>Ver</Button>{alter_status}</Flex>

                    let aux = {
                        id: shield.id,
                        image_send_date: shield.image_send_date,
                        name_official: shield.name_official,
                        email: shield.email,
                        status_image: shield.status_image,
                        actions: actions
                    };

                    aux.image_send_date = dayjs(aux.image_send_date).format("DD/MM/YYYY");

                    if(shield.status_image == "waiting"){
                        aux.status_image = <Badge color="yellow">Em análise</Badge>
                    }
        
                    if(shield.status_image == "approved"){
                        aux.status_image = <Badge color="green">Aprovado</Badge>
                    }
        
                    if(shield.status_image == "recused"){
                        aux.status_image = <Flex direction={"row"} align={"center"}><Badge color="red">Recusado</Badge> <Tooltip label={shield.status_description}><IconInfoCircleFilled></IconInfoCircleFilled></Tooltip></Flex>
                    }
        
                    shieldAux.push(aux);
                })
                setDataTable(shieldAux);
            }else{
                setData([]);
                setDataTable([{message: "Nenhum escudo encontrado."}]);
            }
        }).catch((error)=>{
            console.log(error);
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
        getShields();
    },[rkeywordView])

    useEffect(()=>{
        verifyPermissions();
    },[])

    return(<>
        <Base>
            <Modal title="Recusar foto de perfil" opened={modalRecuse}>
                <Flex direction={"column"} gap={"1vh"}>
                <TextInput label="Motivo" placeholder="Motivo da recusa" onChange={(e)=>{setDescription(e.currentTarget.value)}}></TextInput>
                <Text>
                    Você confirma a recusa dessa foto de perfil?
                </Text>
                <Button fullWidth color="red" onClick={()=>{
                    verifyDescription(selectedShield);
                }}>Recusar</Button>
                </Flex>
            </Modal>
            <div className="baseMain">
            <Filters
            title={"Análise de escudos"}
            buttons={[<Button type="submit" leftSection={<IconFilter></IconFilter>}>Filtrar</Button>]} onSubmit={filterForm.onSubmit((e)=>{getShields(e)})}>
                <TextInput label="ID" {...filterForm.getInputProps("id")}></TextInput>
                <TextInput label="Entidade" {...filterForm.getInputProps("entity")}></TextInput>
                <TextInput label="E-mail" {...filterForm.getInputProps("email")}></TextInput>
                <Select data={[{value: "yes", label: "Sim"},{value: "no", label: "Não"}]} label="Ordernar p/ data" {...filterForm.getInputProps("date_order")}></Select>
                <Select data={[{value: "yes", label: "Sim"},{value: "no", label: "Não"}]} label="Ordernar p/ ordem alfabética" {...filterForm.getInputProps("alphabetical_order")}></Select>
            </Filters>
            <TablePagination data={dataTable} head={["ID", "Data de envio", "Entidade", "E-mail", "Status", "Ações"]}></TablePagination>
            </div>
        </Base>
        </>)
}