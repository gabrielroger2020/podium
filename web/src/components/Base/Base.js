'use client'
import {useState, useEffect} from "react";
import {AppShell, Burger, NavLink, Group, Text, Avatar, Modal} from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import {IconHome, IconUser, IconSettings, IconLogout2, IconUsersGroup, IconFileText, IconReport, IconPhotoSearch, IconBuilding, IconCategory, IconPlayFootball} from "@tabler/icons-react";
import VerifyAuth from "../VerifyAuth/VerifyAuth";
import IdCard from "../IdCard/IdCard";
import "./base.css";
import api from "@/services/api";
import configUrl from "@/services/configUrl";

export default function Base(props){

    /* INÍCIO DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    let keywordUsers = "viewUsers";
    let keywordGroupAccess = "viewGroups";
    let keywordDocs = "viewDocs";
    let keywordDocsAnalysis = "viewDocsAnalysis";
    let keywordImageProfileAnalysis = "viewImagesProfileAnalysis";
    let keywordEntitiesCategory = "viewEntitiesCategories";
    let keywordEntity = "viewEntities";
    let keywordMyEntities = "viewMyEntities";
    let keywordShieldsEntitiesAnalysis = "viewShieldsEntitiesAnalysis";
    let keywordModalities = "viewModalities";
    let keywordTeams = "viewTeams";
    let keywordMyTeamsManagers = "viewMyTeamsManagers";
    let keywordMyTeamsAthletes = "viewMyTeamsAthletes";

    const [rkeywordGroupAccess, setRkeywordGroupAccess] = useState(null);
    const [rkeywordUsers, setRkeywordUsers] = useState(null);
    const [rkeywordDocs, setRkeywordDocs] = useState(null);
    const [rkeywordDocsAnalysis, setRkeywordDocAnalysis] = useState(null);
    const [rkeyrwordImageProfileAnalysis, setRkeyrwordImageProfileAnalysis] = useState(null);
    const [rkeywordEntitiesCategory, setRkeywordEntitiesCategory] = useState(null);
    const [rkeywordEntity, setRkeywordEntity] = useState(null);
    const [rkeywordMyEntities, setRkeywordMyEntities] = useState(null);
    const [rkeywordShieldsEntitiesAnalysis, setRkeywordShieldsEntitiesAnalysis] = useState(null);
    const [rkeywordModalities, setRkeywordModalities] = useState(null);
    const [rkeywordTeams, setRkeywordTeams] = useState(null);
    const [rkeywordMyTeamsManagers, setRkeywordMyTeamsManagers] = useState(null);
    const [rkeywordMyTeamsAthletes, setRkeywordMyTeamsAthletes] = useState(null);

    /* FIM DO LOCAL PARA DEFINIÇÃO DE PALAVRAS CHAVES DAS PÁGINAS E COMPONENTES E SEUS RETORNOS*/

    const [opened, { toggle }] = useDisclosure();
    const [idCardModal, idCardModalHandlers] = useDisclosure(false, {onClose:()=>{}, onOpen: ()=>{}});
    const [pathname, setPathName] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [userInfos, setUserInfos] = useState("");


    const logout = ()=>{
        sessionStorage.removeItem("id");
        sessionStorage.removeItem("token-login");
        sessionStorage.removeItem("token");
        window.location.replace("/");
    }

    const verifyPermissions = ()=>{
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordGroupAccess}`).then((response)=>{
            setRkeywordGroupAccess(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordUsers}`).then((response)=>{
            setRkeywordUsers(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordDocs}`).then((response)=>{
            setRkeywordDocs(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordDocsAnalysis}`).then((response)=>{
            setRkeywordDocAnalysis(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordImageProfileAnalysis}`).then((response)=>{
            setRkeyrwordImageProfileAnalysis(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordEntitiesCategory}`).then((response)=>{
            setRkeywordEntitiesCategory(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordEntity}`).then((response)=>{
            setRkeywordEntity(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordMyEntities}`).then((response)=>{
            setRkeywordMyEntities(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordShieldsEntitiesAnalysis}`).then((response)=>{
            setRkeywordShieldsEntitiesAnalysis(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordModalities}`).then((response)=>{
            setRkeywordModalities(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordTeams}`).then((response)=>{
            setRkeywordTeams(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordMyTeamsManagers}`).then((response)=>{
            setRkeywordMyTeamsManagers(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordMyTeamsManagers}`).then((response)=>{
            setRkeywordMyTeamsManagers(response.data.access);
        });
        api.get(`/access-group/verify-user-access/${sessionStorage.getItem("id")}?keyword=${keywordMyTeamsAthletes}`).then((response)=>{
            setRkeywordMyTeamsAthletes(response.data.access);
        });
       
    }

    

    useEffect(()=>{
        api.get(`/users/profile-image/${sessionStorage.getItem("id")}`).then((response)=>{
            if(response.data.path != undefined){
                setProfileImage("http://" + configUrl.ip+ ":" +configUrl.port+ "/user-images/" + response.data.path);
            }
        }).catch((error)=>{
            setProfileImage("");
        })
        if(typeof window !== "undefined"){
            setPathName(window.location.pathname);
        }
        verifyPermissions();
    },[])

    return(
        <>
        <VerifyAuth/>
    <AppShell
    header={{ height: 60 }}
    footer={{ height: 50 }}
    navbar={{
    width: 300,
    breakpoint: 'sm',
    collapsed: { mobile: !opened },
    }}
    >
        <AppShell.Header>
        <Burger
        opened={opened}
        onClick={toggle}
        hiddenFrom="sm"
        size="sm"
        />
        <h1>Podium 🏆</h1>
        </AppShell.Header>
        <AppShell.Footer>
            <div className="footer">
                <Text size="sm" ta="center" c="dimmed">Desenvolvido por:  www.spacecodes.com.br 🚀</Text>
            </div>
        </AppShell.Footer>

        <AppShell.Navbar>
            <Group className="menu">
            <Group className="menuItems">
                <NavLink href="/home" active={pathname === "/home"} label="Home" leftSection={<IconHome></IconHome>}/>
                {(rkeywordUsers == true) ? (
                    <NavLink label="Usuários" leftSection={<IconUser></IconUser>}>
                        {(rkeywordUsers == true) ? (<NavLink href="/users" active={pathname === "/users"} label="Cadastro de usuários" leftSection={<IconUser></IconUser>}/>) : (null)}
                        {(rkeyrwordImageProfileAnalysis == true) ? (<NavLink href="/users/image-profile-analysis" active={pathname === "/users/image-profile-analysis"} label="Análise de fotos de perfil" leftSection={<IconPhotoSearch></IconPhotoSearch>}></NavLink>) : (null)}
                    </NavLink>
                ) : (null)}
                {(rkeywordGroupAccess == true) ? (<NavLink href="/access-groups" active={pathname === "/access-groups"} label="Grupos de acesso" leftSection={<IconUsersGroup></IconUsersGroup>}/>) : (null)}
                {(rkeywordDocs == true) ? (
                    <NavLink label="Documentos" leftSection={<IconFileText></IconFileText>}>
                        {(rkeywordDocs == true ? (<NavLink href="/docs" active={pathname === "/docs"} label="Cadastro de documentos" leftSection={<IconFileText></IconFileText>}/>) : (null))}
                        {(rkeywordDocsAnalysis == true ? (<NavLink href="/docs-analysis" active={pathname === "/docs-analysis"} label="Análise de documentos" leftSection={<IconReport></IconReport>}/>) : (null))}
                    </NavLink>
                ) : (null)}
                {(rkeywordEntity == true || rkeywordEntitiesCategory == true || rkeywordMyEntities == true || rkeywordShieldsEntitiesAnalysis == true)?(<NavLink label={"Entidades"} leftSection={<IconBuilding></IconBuilding>}>
                {(rkeywordMyEntities == true)? (<NavLink href="/entities/my" active={pathname === "/entities/my"} label="Minhas entidades" leftSection={<IconBuilding></IconBuilding>}/>) : (null)}
                {(rkeywordEntity == true) ? (<NavLink href="/entities/" active={pathname === "/entities/"} label="Cadastro de entidades" leftSection={<IconBuilding></IconBuilding>}/>) : (null)}
                {(rkeywordEntitiesCategory == true) ? (<NavLink href="/entities/categories" active={pathname === "/entities/categories"} label="Categorias de entidades" leftSection={<IconCategory></IconCategory>}/>) : (null)}
                {(rkeywordShieldsEntitiesAnalysis == true) ? (<NavLink href="/entities/image-analysis" active={pathname === "/entities/image-analysis"} label="Análise de escudos" leftSection={<IconPhotoSearch></IconPhotoSearch>}/>):(null)}
                </NavLink>) : (null)}
                {(rkeywordTeams == true || rkeywordMyTeamsManagers == true) ? (
                    <NavLink label="Equipes" leftSection={<IconUsersGroup></IconUsersGroup>}>
                        {(rkeywordTeams == true ? (<NavLink href="/teams" active={pathname === "/teams"} label="Cadastro de equipes" leftSection={<IconUsersGroup></IconUsersGroup>}/>) : (null))}
                        {(rkeywordMyTeamsAthletes == true ? (<NavLink href="/teams/my/athlete" active={pathname === "/teams/my/athlete"} label="Minhas equipes (Atleta)" leftSection={<IconUsersGroup></IconUsersGroup>}/>) : (null))}
                        {(rkeywordMyTeamsManagers == true ? (<NavLink href="/teams/my" active={pathname === "/teams/my"} label="Minhas equipes (Gerente)" leftSection={<IconUsersGroup></IconUsersGroup>}/>) : (null))}
                    </NavLink>
                ) : (null)}
                {(rkeywordModalities == true) ? (<NavLink href="/modalities" active={pathname === "/modalities"} label="Modalidades" leftSection={<IconPlayFootball></IconPlayFootball>}/>):(null)}
            </Group>
            <Group className="menuItems">
                <NavLink label="Carteira de identificação" onClick={()=>{idCardModalHandlers.open()}} leftSection={<Avatar size={"sm"} src={profileImage}></Avatar>}/>
                <NavLink href="/settings" active={pathname === "/settings"} label="Configurações" leftSection={<IconSettings></IconSettings>}/>
                <NavLink onClick={()=>{logout()}} label="Sair" leftSection={<IconLogout2></IconLogout2>}/>
            </Group>
            </Group>
        </AppShell.Navbar>

        <AppShell.Main>
        {/* Modal da carteira de identificação */}
        <Modal title="Carteira de identificação" size="auto" opened={idCardModal} onClose={idCardModalHandlers.close}>
            <IdCard></IdCard>
        </Modal>
            {props.children}
        </AppShell.Main>

        
    </AppShell>
    </>
    )
}