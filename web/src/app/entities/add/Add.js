'use client'
import api from "@/services/api";
import { TextInput, Button, Select, Fieldset, Flex } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlt, IconBuilding, IconBuildingFactory2, IconBuildingSkyscraper, IconCalendar, IconCategory, IconHistory, IconHome, IconMail, IconMap, IconPlus, IconSchool, IconSignature, IconUsersGroup, IconWorldWww } from "@tabler/icons-react";
import { IMaskInput } from "react-imask";
import {useEffect, useState} from "react";

export default function Add(props){

    const form = useForm({
        initialValues: {
            user_creator: sessionStorage.getItem("id"),
            nature: "",
            cnpj: "",
            inep_code: "",
            name_official: "",
            name_popular: "",
            category: null,
            abbreviation: "",
            email: "",
            site: "",
            cep: "",
            country: "Brasil",
            state: "",
            city: "",
            address: "",
            address_number: "",
            address_complement: "",
            date_foundation: null,
            history: ""
        }, validate: {
            nature: (value)=>(value != "private" && value != "public" ? 'Nenhuma opção foi selecionada' : null),
            cnpj: (value) => (value.length < 18 && value != "" && value != null ? "O CNPJ deve ser preenchido corretamente." : null),
            inep_code: (value) => (RegExp("^[0-9]{8}$").test(value) != true && value != "" && value != null ? "O código do INEP deve ser formado somente por números e possuir 8 dígitos." : null),
            name_official: (value) => (value.length >= 3 ? null : "O nome oficial deve ter no mínimo 3 caracteres."),
            name_popular: (value) => (value.length >= 3 ? null : "O nome popular deve ter no mínimo 3 caracteres."),
            category: (value) => (value != null ? null : "Você deve selecionar alguma categoria."),
            abbreviation: (value) => (value.length == 3 ? null : "A abreviação deve conter exatamente 3 caracteres."),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Verifique esse campo.'),
            site: (value)=>((new RegExp("https?:\/\/[^\s]+")).test(value) == true || value == "" || value == null ? null : 'Esse campo deve ser preenchido com um link que se inicia com HTTPS:// ou HTTP:// .'),
            cep: (value) => (RegExp("^[0-9]{8}$").test(value) != true ? "O CEP deve ser formado somente por números e possuir 8 dígitos." : null),
            country: (value) => (value.length > 0 ? null : 'Você deve preencher esse campo.'),
            state: (value) => (value.length > 0 ? null : 'Você deve preencher esse campo.'),
            city: (value) => (value.length > 0 ? null : 'Você deve preencher esse campo.'),
            address: (value) => (value.length > 0 ? null : 'Você deve preencher esse campo.'),
            address_number: (value) => (value.length > 0 ? null : 'Você deve preencher esse campo.'),
            address_complement: (value) => (value.length > 0 ? null : 'Você deve preencher esse campo.'),
            //date_foundation: (value) => (value != null ? null : 'Você deve preencher esse campo.'),
            //history: (value) => (value.length > 0 ? null : 'Você deve preencher esse campo.'),
        }
    })

    const [categories, setCategories] = useState([]);

    const dataState = [
        { value: "AC", label: "Acre" },
        { value: "AL", label: "Alagoas" },
        { value: "AP", label: "Amapá" },
        { value: "AM", label: "Amazonas" },
        { value: "BA", label: "Bahia" },
        { value: "CE", label: "Ceará" },
        { value: "DF", label: "Distrito Federal" },
        { value: "ES", label: "Espírito Santo" },
        { value: "GO", label: "Goiás" },
        { value: "MA", label: "Maranhão" },
        { value: "MT", label: "Mato Grosso" },
        { value: "MS", label: "Mato Grosso do Sul" },
        { value: "MG", label: "Minas Gerais" },
        { value: "PA", label: "Pará" },
        { value: "PB", label: "Paraíba" },
        { value: "PR", label: "Paraná" },
        { value: "PE", label: "Pernambuco" },
        { value: "PI", label: "Piauí" },
        { value: "RJ", label: "Rio de Janeiro" },
        { value: "RN", label: "Rio Grande do Norte" },
        { value: "RS", label: "Rio Grande do Sul" },
        { value: "RO", label: "Rondônia" },
        { value: "RR", label: "Roraima" },
        { value: "SC", label: "Santa Catarina" },
        { value: "SP", label: "São Paulo" },
        { value: "SE", label: "Sergipe" },
        { value: "TO", label: "Tocantins" }
    ];

    const dataCountries = [
        { value: "Brasil", label: "Brasil" },
        { value: "Afghanistan", label: "Afghanistan" },
        { value: "Åland Islands", label: "Åland Islands" },
        { value: "Albania", label: "Albania" },
        { value: "Algeria", label: "Algeria" },
        { value: "American Samoa", label: "American Samoa" },
        { value: "Andorra", label: "Andorra" },
        { value: "Angola", label: "Angola" },
        { value: "Anguilla", label: "Anguilla" },
        { value: "Antarctica", label: "Antarctica" },
        { value: "Antigua and Barbuda", label: "Antigua and Barbuda" },
        { value: "Argentina", label: "Argentina" },
        { value: "Armenia", label: "Armenia" },
        { value: "Aruba", label: "Aruba" },
        { value: "Australia", label: "Australia" },
        { value: "Austria", label: "Austria" },
        { value: "Azerbaijan", label: "Azerbaijan" },
        { value: "Bahamas", label: "Bahamas" },
        { value: "Bahrain", label: "Bahrain" },
        { value: "Bangladesh", label: "Bangladesh" },
        { value: "Barbados", label: "Barbados" },
        { value: "Belarus", label: "Belarus" },
        { value: "Belgium", label: "Belgium" },
        { value: "Belize", label: "Belize" },
        { value: "Benin", label: "Benin" },
        { value: "Bermuda", label: "Bermuda" },
        { value: "Bhutan", label: "Bhutan" },
        { value: "Bolivia", label: "Bolivia" },
        { value: "Bosnia and Herzegovina", label: "Bosnia and Herzegovina" },
        { value: "Botswana", label: "Botswana" },
        { value: "British Indian Ocean Territory", label: "British Indian Ocean Territory" },
        { value: "Brunei Darussalam", label: "Brunei Darussalam" },
        { value: "Bulgaria", label: "Bulgaria" },
        { value: "Burkina Faso", label: "Burkina Faso" },
        { value: "Burundi", label: "Burundi" },
        { value: "Cambodia", label: "Cambodia" },
        { value: "Cameroon", label: "Cameroon" },
        { value: "Canada", label: "Canada" },
        { value: "Cape Verde", label: "Cape Verde" },
        { value: "Cayman Islands", label: "Cayman Islands" },
        { value: "Central African Republic", label: "Central African Republic" },
        { value: "Chad", label: "Chad" },
        { value: "Chile", label: "Chile" },
        { value: "China", label: "China" },
        { value: "Christmas Island", label: "Christmas Island" },
        { value: "Cocos (Keeling) Islands", label: "Cocos (Keeling) Islands" },
        { value: "Colombia", label: "Colombia" },
        { value: "Comoros", label: "Comoros" },
        { value: "Congo", label: "Congo" },
        { value: "Congo, The Democratic Republic of the", label: "Congo, The Democratic Republic of the" },
        { value: "Cook Islands", label: "Cook Islands" },
        { value: "Costa Rica", label: "Costa Rica" },
        { value: "Cote D'Ivoire", label: "Cote D'Ivoire" },
        { value: "Croatia", label: "Croatia" },
        { value: "Cuba", label: "Cuba" },
        { value: "Cyprus", label: "Cyprus" },
        { value: "Czech Republic", label: "Czech Republic" },
        { value: "Denmark", label: "Denmark" },
        { value: "Djibouti", label: "Djibouti" },
        { value: "Dominica", label: "Dominica" },
        { value: "Dominican Republic", label: "Dominican Republic" },
        { value: "Ecuador", label: "Ecuador" },
        { value: "Egypt", label: "Egypt" },
        { value: "El Salvador", label: "El Salvador" },
        { value: "Equatorial Guinea", label: "Equatorial Guinea" },
        { value: "Eritrea", label: "Eritrea" },
        { value: "Estonia", label: "Estonia" },
        { value: "Ethiopia", label: "Ethiopia" },
        { value: "Falkland Islands (Malvinas)", label: "Falkland Islands (Malvinas)" },
        { value: "Faroe Islands", label: "Faroe Islands" },
        { value: "Fiji", label: "Fiji" },
        { value: "Finland", label: "Finland" },
        { value: "France", label: "France" },
        { value: "French Guiana", label: "French Guiana" },
        { value: "French Polynesia", label: "French Polynesia" },
        { value: "French Southern Territories", label: "French Southern Territories" },
        { value: "Gabon", label: "Gabon" },
        { value: "Gambia", label: "Gambia" },
        { value: "Georgia", label: "Georgia" },
        { value: "Germany", label: "Germany" },
        { value: "Ghana", label: "Ghana" },
        { value: "Gibraltar", label: "Gibraltar" },
        { value: "Greece", label: "Greece" },
        { value: "Greenland", label: "Greenland" },
        { value: "Grenada", label: "Grenada" },
        { value: "Guadeloupe", label: "Guadeloupe" },
        { value: "Guam", label: "Guam" },
        { value: "Guatemala", label: "Guatemala" },
        { value: "Guernsey", label: "Guernsey" },
        { value: "Guinea", label: "Guinea" },
        { value: "Guinea-Bissau", label: "Guinea-Bissau" },
        { value: "Guyana", label: "Guyana" },
        { value: "Haiti", label: "Haiti" },
        { value: "Heard Island and McDonald Islands", label: "Heard Island and McDonald Islands" },
        { value: "Holy See (Vatican City State)", label: "Holy See (Vatican City State)" },
        { value: "Honduras", label: "Honduras" },
        { value: "Hong Kong", label: "Hong Kong" },
        { value: "Hungary", label: "Hungary" },
        { value: "Iceland", label: "Iceland" },
        { value: "India", label: "India" },
        { value: "Indonesia", label: "Indonesia" },
        { value: "Iran, Islamic Republic of", label: "Iran, Islamic Republic of" },
        { value: "Iraq", label: "Iraq" },
        { value: "Ireland", label: "Ireland" },
        { value: "Isle of Man", label: "Isle of Man" },
        { value: "Israel", label: "Israel" },
        { value: "Italy", label: "Italy" },
        { value: "Jamaica", label: "Jamaica" },
        { value: "Japan", label: "Japan" },
        { value: "Jersey", label: "Jersey" },
        { value: "Jordan", label: "Jordan" },
        { value: "Kazakhstan", label: "Kazakhstan" },
        { value: "Kenya", label: "Kenya" },
        { value: "Kiribati", label: "Kiribati" },
        { value: "Korea, Democratic People's Republic of", label: "Korea, Democratic People's Republic of" },
        { value: "Korea, Republic of", label: "Korea, Republic of" },
        { value: "Kuwait", label: "Kuwait" },
        { value: "Kyrgyzstan", label: "Kyrgyzstan" },
        { value: "Lao People's Democratic Republic", label: "Lao People's Democratic Republic" },
        { value: "Latvia", label: "Latvia" },
        { value: "Lebanon", label: "Lebanon" },
        { value: "Lesotho", label: "Lesotho" },
        { value: "Liberia", label: "Liberia" },
        { value: "Libyan Arab Jamahiriya", label: "Libyan Arab Jamahiriya" },
        { value: "Liechtenstein", label: "Liechtenstein" },
        { value: "Lithuania", label: "Lithuania" },
        { value: "Luxembourg", label: "Luxembourg" },
        { value: "Macao", label: "Macao" },
        { value: "Macedonia, The Former Yugoslav Republic of", label: "Macedonia, The Former Yugoslav Republic of" },
        { value: "Madagascar", label: "Madagascar" },
        { value: "Malawi", label: "Malawi" },
        { value: "Malaysia", label: "Malaysia" },
        { value: "Maldives", label: "Maldives" },
        { value: "Mali", label: "Mali" },
        { value: "Malta", label: "Malta" },
        { value: "Marshall Islands", label: "Marshall Islands" },
        { value: "Martinique", label: "Martinique" },
        { value: "Mauritania", label: "Mauritania" },
        { value: "Mauritius", label: "Mauritius" },
        { value: "Mayotte", label: "Mayotte" },
        { value: "Mexico", label: "Mexico" },
        { value: "Micronesia, Federated States of", label: "Micronesia, Federated States of" },
        { value: "Moldova, Republic of", label: "Moldova, Republic of" },
        { value: "Monaco", label: "Monaco" },
        { value: "Mongolia", label: "Mongolia" },
        { value: "Montenegro", label: "Montenegro" },
        { value: "Montserrat", label: "Montserrat" },
        { value: "Morocco", label: "Morocco" },
        { value: "Mozambique", label: "Mozambique" },
        { value: "Myanmar", label: "Myanmar" },
        { value: "Namibia", label: "Namibia" },
        { value: "Nauru", label: "Nauru" },
        { value: "Nepal", label: "Nepal" },
        { value: "Netherlands", label: "Netherlands" },
        { value: "Netherlands Antilles", label: "Netherlands Antilles" },
        { value: "New Caledonia", label: "New Caledonia" },
        { value: "New Zealand", label: "New Zealand" },
        { value: "Nicaragua", label: "Nicaragua" },
        { value: "Niger", label: "Niger" },
        { value: "Nigeria", label: "Nigeria" },
        { value: "Niue", label: "Niue" },
        { value: "Norfolk Island", label: "Norfolk Island" },
        { value: "Northern Mariana Islands", label: "Northern Mariana Islands" },
        { value: "Norway", label: "Norway" },
        { value: "Oman", label: "Oman" },
        { value: "Pakistan", label: "Pakistan" },
        { value: "Palau", label: "Palau" },
        { value: "Palestinian Territory, Occupied", label: "Palestinian Territory, Occupied" },
        { value: "Panama", label: "Panama" },
        { value: "Papua New Guinea", label: "Papua New Guinea" },
        { value: "Paraguay", label: "Paraguay" },
        { value: "Peru", label: "Peru" },
        { value: "Philippines", label: "Philippines" },
        { value: "Pitcairn", label: "Pitcairn" },
        { value: "Poland", label: "Poland" },
        { value: "Portugal", label: "Portugal" },
        { value: "Puerto Rico", label: "Puerto Rico" },
        { value: "Qatar", label: "Qatar" },
        { value: "Reunion", label: "Reunion" },
        { value: "Romania", label: "Romania" },
        { value: "Russia", label: "Russia" },
        { value: "Rwanda", label: "Rwanda" },
        { value: "Saint Barthélemy", label: "Saint Barthélemy" },
        { value: "Saint Helena", label: "Saint Helena" },
        { value: "Saint Kitts and Nevis", label: "Saint Kitts and Nevis" },
        { value: "Saint Lucia", label: "Saint Lucia" },
        { value: "Saint Martin (French part)", label: "Saint Martin (French part)" },
        { value: "Saint Pierre and Miquelon", label: "Saint Pierre and Miquelon" },
        { value: "Saint Vincent and the Grenadines", label: "Saint Vincent and the Grenadines" },
        { value: "Samoa", label: "Samoa" },
        { value: "San Marino", label: "San Marino" },
        { value: "Sao Tome and Principe", label: "Sao Tome and Principe" },
        { value: "Saudi Arabia", label: "Saudi Arabia" },
        { value: "Senegal", label: "Senegal" },
        { value: "Serbia", label: "Serbia" },
        { value: "Seychelles", label: "Seychelles" },
        { value: "Sierra Leone", label: "Sierra Leone" },
        { value: "Singapore", label: "Singapore" },
        { value: "Sint Maarten (Dutch part)", label: "Sint Maarten (Dutch part)" },
        { value: "Slovakia", label: "Slovakia" },
        { value: "Slovenia", label: "Slovenia" },
        { value: "Solomon Islands", label: "Solomon Islands" },
        { value: "Somalia", label: "Somalia" },
        { value: "South Africa", label: "South Africa" },
        { value: "South Georgia and the South Sandwich Islands", label: "South Georgia and the South Sandwich Islands" },
        { value: "South Sudan", label: "South Sudan" },
        { value: "Spain", label: "Spain" },
        { value: "Sri Lanka", label: "Sri Lanka" },
        { value: "Sudan", label: "Sudan" },
        { value: "Suriname", label: "Suriname" },
        { value: "Svalbard and Jan Mayen", label: "Svalbard and Jan Mayen" },
        { value: "Swaziland", label: "Swaziland" },
        { value: "Sweden", label: "Sweden" },
        { value: "Switzerland", label: "Switzerland" },
        { value: "Syrian Arab Republic", label: "Syrian Arab Republic" },
        { value: "Taiwan, Province of China", label: "Taiwan, Province of China" },
        { value: "Tajikistan", label: "Tajikistan" },
        { value: "Tanzania, United Republic of", label: "Tanzania, United Republic of" },
        { value: "Thailand", label: "Thailand" },
        { value: "Timor-Leste", label: "Timor-Leste" },
        { value: "Togo", label: "Togo" },
        { value: "Tokelau", label: "Tokelau" },
        { value: "Tonga", label: "Tonga" },
        { value: "Trinidad and Tobago", label: "Trinidad and Tobago" },
        { value: "Tunisia", label: "Tunisia" },
        { value: "Turkey", label: "Turkey" },
        { value: "Turkmenistan", label: "Turkmenistan" },
        { value: "Turks and Caicos Islands", label: "Turks and Caicos Islands" },
        { value: "Tuvalu", label: "Tuvalu" },
        { value: "Uganda", label: "Uganda" },
        { value: "Ukraine", label: "Ukraine" },
        { value: "United Arab Emirates", label: "United Arab Emirates" },
        { value: "United Kingdom", label: "United Kingdom" },
        { value: "United States", label: "United States" },
        { value: "United States Minor Outlying Islands", label: "United States Minor Outlying Islands" },
        { value: "Uruguay", label: "Uruguay" },
        { value: "Uzbekistan", label: "Uzbekistan" },
        { value: "Vanuatu", label: "Vanuatu" },
        { value: "Venezuela, Bolivarian Republic of", label: "Venezuela, Bolivarian Republic of" },
        { value: "Viet Nam", label: "Viet Nam" },
        { value: "Virgin Islands, British", label: "Virgin Islands, British" },
        { value: "Virgin Islands, U.S.", label: "Virgin Islands, U.S." },
        { value: "Wallis and Futuna", label: "Wallis and Futuna" },
        { value: "Western Sahara", label: "Western Sahara" },
        { value: "Yemen", label: "Yemen" },
        { value: "Zambia", label: "Zambia" },
        { value: "Zimbabwe", label: "Zimbabwe" }
    ];
    
    const getAllCategories = ()=>{

        api.get("/entities/category/select").then((response)=>{
            if(response.data.length > 0){
                let aux = [];
                response.data.forEach((category)=>{
                    aux.push({value: `${category.id}`, label: category.name});
                })
                setCategories(aux);
            }else{
                notifications.show({
                    title: "Erro!",
                    message: "Não existe nehuma categoria de entidade cadastrada no sistema. Você deve ter no mínimo 1 categoria cadastrada para cadastrar uma entidade.",
                    color: "red"
                })
                props.closeModal();
            }
        }).catch((error)=>{
            notifications.show({
                title: "Erro!",
                message: "Não foi possível selecionar as categorias de entidade.",
                color: "red"
            })
        })

    }

    const sendData = (values)=>{
        api.post("/entities/register", values).then((response)=>{
            

            notifications.show({
                title: "Sucesso!",
                message: response.data.message,
                color: "green"
            })
            props.getAllEntities();
            props.closeModal();
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
        getAllCategories();
    },[])

    return(
        <form onSubmit={form.onSubmit((e)=>{sendData(e)})}>
            <Fieldset legend="Identificação">
                <Flex gap="1vh" direction={"column"}>
                    <Select radius="xl" placeholder="Natureza" data={[{value: "private", label: "Privada"},{value: "public", label: "Pública"}]} {...form.getInputProps("nature")} leftSection={<IconUsersGroup></IconUsersGroup>}></Select>
                    <TextInput component={IMaskInput} mask="00.000.000/0000-00" radius="xl" placeholder="CNPJ" {...form.getInputProps("cnpj")} leftSection={<IconBuildingFactory2></IconBuildingFactory2>}></TextInput>
                    <TextInput component={IMaskInput} mask="00000000" radius="xl" placeholder="Código INEP" {...form.getInputProps("inep_code")} leftSection={<IconSchool></IconSchool>}></TextInput>
                    <TextInput radius="xl" placeholder="Nome oficial" {...form.getInputProps("name_official")} leftSection={<IconSignature></IconSignature>}></TextInput>
                    <TextInput radius="xl" placeholder="Nome popular" {...form.getInputProps("name_popular")} leftSection={<IconSignature></IconSignature>}></TextInput>
                    <Select radius="xl" placeholder="Categoria" data={categories} searchable leftSection={<IconCategory></IconCategory>} {...form.getInputProps("category")}></Select>
                    <TextInput radius="xl" placeholder="Abreviação (SIGLA)" {...form.getInputProps("abbreviation")} leftSection={<IconAlt></IconAlt>}></TextInput>
                </Flex>
            </Fieldset>
            <Fieldset legend="Contato">
                <Flex gap="1vh" direction={"column"}>
                    <TextInput radius="xl" placeholder="E-mail" {...form.getInputProps("email")} leftSection={<IconMail></IconMail>}></TextInput>
                    <TextInput radius="xl" placeholder="Site" {...form.getInputProps("site")} leftSection={<IconWorldWww></IconWorldWww>}></TextInput>
                </Flex>
            </Fieldset>
            <Fieldset legend="Endereço">
                <Flex gap="1vh" direction={"column"}>
                    <Select radius="xl" placeholder="País" data={dataCountries} searchable leftSection={<IconMap></IconMap>} {...form.getInputProps("country")}></Select>
                    <TextInput component={IMaskInput} mask="00000000" radius="xl" placeholder="CEP" {...form.getInputProps("cep")} leftSection={<IconBuildingSkyscraper></IconBuildingSkyscraper>} ></TextInput>
                    <Select radius="xl" placeholder="Estado" data={dataState} searchable leftSection={<IconMap></IconMap>} {...form.getInputProps("state")}></Select>
                    <TextInput radius="xl" placeholder="Cidade" {...form.getInputProps("city")} leftSection={<IconBuildingSkyscraper></IconBuildingSkyscraper>}></TextInput>
                    <TextInput radius="xl" placeholder="Endereço (Rua, bairro...)" {...form.getInputProps("address")} leftSection={<IconMap></IconMap>}></TextInput>
                    <TextInput radius="xl" placeholder="Número" {...form.getInputProps("address_number")} leftSection={<IconHome></IconHome>}></TextInput>
                    <TextInput radius="xl" placeholder="Complemento" {...form.getInputProps("address_complement")} leftSection={<IconHome></IconHome>}></TextInput>
                </Flex>
            </Fieldset>
            <Fieldset legend="História">
                <Flex gap="1vh" direction={"column"}>
                    <DatePickerInput radius="xl" placeholder="Data de fundação" {...form.getInputProps("date_foundation")} leftSection={<IconCalendar></IconCalendar>}></DatePickerInput>
                <TextInput radius="xl" placeholder="História" {...form.getInputProps("history")} leftSection={<IconHistory></IconHistory>}></TextInput>
                </Flex>
            </Fieldset>
            
            <Button type="submit" color="green" leftSection={<IconPlus></IconPlus>}>Cadastrar</Button>
        </form>
    )
}