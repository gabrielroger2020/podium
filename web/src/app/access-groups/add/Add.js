'use client'
import { TextInput,Button, MultiSelect } from "@mantine/core";
import { IconId, IconLicense, IconPlus } from "@tabler/icons-react";
import {useForm} from "@mantine/form";
import api from "@/services/api";
import { notifications } from "@mantine/notifications";

export default function Add (props){

    const permissions = [
    {group:"Usuários", items: [
    {value: "viewUsers", label: "Visualizar Usuários"},
    {value: "addUsers", label: "Cadastrar Usuários"},
    {value: "editUsers", label: "Editar Usuários"},
    {value: "delUsers", label: "Deletar Usuários"},
    {value: "groupUsers", label: "Adicionar/Remover Usuários de Grupos de Acesso"},
    {value: "viewImagesProfileAnalysis", label: "Analisar fotos de perfil"}]},
    
    {group:"Grupos de Acesso", items: [
        {value: "viewGroups", label: "Visualizar Grupos de Acesso"},
        {value: "addGroups", label: "Cadastrar Grupos de Acesso"},
        {value: "editGroups", label: "Editar Grupos de Acesso"},
        {value: "delGroups", label: "Deletar Grupos de Acesso"}]},

    {group:"Documentos", items: [
        {value: "viewDocs", label: "Visualizar Documentos"},
        {value: "addDocs", label: "Cadastrar Documentos"},
        {value: "editDocs", label: "Editar Documentos"},
        {value: "delDocs", label: "Deletar Documentos"},
        {value: "viewDocsAnalysis", label: "Analisar Documentos"}]},
        
        {group: "Entidades", items: [
            {value: "viewEntitiesCategories", label: "Visualizar Categorias de Entidades"},
            {value: "addEntitiesCategories", label: "Cadastrar Categorias de Entidades"},
            {value: "delEntitiesCategories", label: "Deletar Categorias de Entidades"},
            {value: "editEntitiesCategories", label: "Editar Categorias de Entidades"},
            {value: "viewMyEntities", label: "Visualizar Minhas Entidades"},
            {value: "viewEntities", label: "Visualizar Entidades"},
            {value: "addEntities", label: "Cadastrar Entidades"},
            {value: "delEntities", label: "Deletar Entidades"},
            {value: "editEntities", label: "Editar Entidades"},
            {value: "managersEntities", label: "Gerenciar Gerentes de Entidades"},
            {value: "viewShieldsEntitiesAnalysis", label: "Analisar Escudos"}
            
        ]},

        {group: "Modalidades", items: [
            {value: "viewModalities", label: "Visualizar Modalidades"},
            {value: "delModalities", label: "Cadastrar Modalidades"},
            {value: "addModalities", label: "Deletar Modalidades"},
            {value: "editModalities", label: "Editar Modalidades"},
            
        ]},
        {group: "Equipes", items: [
            {value: "viewTeams", label: "Visualizar Times"},
            {value: "delTeams", label: "Cadastrar Times"},
            {value: "addTeams", label: "Deletar Times"},
            {value: "editTeams", label: "Editar Times"},
            {value: "managersTeams", label: "Gerenciar Gerentes de Equipes"},
            {value: "athletesTeams", label: "Gerenciar Atletas de Equipes"},
            {value: "viewMyTeamsAthletes", label: "Visualisar Minhas equipes (Atleta)"},
            {value: "viewMyTeamsManagers", label: "Visualisar Minhas equipes (Gerente)"},
            {value: "addMyTeamsManagers", label: "Cadatrar Minhas equipes (Gerente)"},
            {value: "editMyTeamsManagers", label: "Editar Minhas equipes (Gerente)"},
            {value: "delMyTeamsManagers", label: "Deletar Minhas equipes (Gerente)"},
            {value: "athletesMyTeamsManagers", label: "Gerenciar atletas Minhas equipes (Gerente)"},
            
        ]},

    {group: "Configurações", items: [
        {value: "settingsSystem", label: "Configurações do Sistema"}
    ]}
    ];

    const form = useForm({
        initialValues: {
            name: "",
            permissions: [],
            user_creator: sessionStorage.getItem("id")
        },
        validate: {
            name: (value)=>(value.length < 3 ? 'O nome do grupo de acesso deve conter no mínimo 3 caracteres.' : null),
            permissions: (value)=>(value.length == 0 ? 'Você deve selecionar no mínimo 1 permissão.' : null)
        }

    });

    const sendData = (values)=>{
        api.post("/access-group/register",values).then((response)=>{
            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            });
            props.getAllAccessGroups();
            props.closeModal();
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: error.response.data.message,
                color: "red"
            })
        })
    }

    return(
    <form onSubmit={form.onSubmit((values)=>{
        sendData(values);
    })}>
        <TextInput radius="xl" placeholder="Nome" leftSection={<IconId></IconId>} {...form.getInputProps("name")}></TextInput>
        <MultiSelect hidePickedOptions data={permissions} radius="xl" placeholder="Permissões" leftSection={<IconLicense></IconLicense>} {...form.getInputProps("permissions")}></MultiSelect>
        <Button type="submit" fullWidth color="green" leftSection={<IconPlus></IconPlus>}> Cadastrar</Button>
    </form>
    )
}