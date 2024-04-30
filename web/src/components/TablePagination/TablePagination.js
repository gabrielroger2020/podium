'use client'
import {Table, Pagination} from "@mantine/core";
import { useEffect, useState } from "react";
import "./TablePagination.css";

export default function TablePagination (props) {

    const [head, setHead] = useState([]);
    const [data, setData] = useState([]);
    const [dataPage, setDataPage] = useState([]);
    const [activePage, setActivePage] = useState(1);

    useEffect(()=>{

        let numMaxRegsPags = props.numMaxRegsPags;

        let auxNumRegs = 0;
        let dataPagination = [];

        let auxRegs = [];
        
        if(props.data.length > 0){
            props.data.forEach((element)=>{
                 if(auxNumRegs == numMaxRegsPags){
                     dataPagination.push(auxRegs);
                     auxRegs = [];
                     auxNumRegs = 0;
                     auxRegs.push(element);
                 }else{
                    auxRegs.push(element);
                    auxNumRegs++;
                 }
                 
             })
             if(auxRegs.length != 0){
                dataPagination.push(auxRegs);
             }
     
             setData(dataPagination);
             constructRows(dataPagination[0]);
        }

    }, [props.data])

    const constructRows = (elementsRows)=>{
        let rows = [];
        if(elementsRows != undefined){
            elementsRows.forEach(element => {
                if(typeof element == "object"){
                    let aux = [];
                    Object.keys(element).forEach((key)=>{
                        aux.push(<Table.Td>{element[key]}</Table.Td>)
                    })    
                    rows.push(<Table.Tr>{aux}</Table.Tr>)
                }
                
               
            })
        }
        
        setDataPage(rows);
    }

    const constructHead = (elementHead) =>{
        if(head.length == 0){
            elementHead.forEach((value)=>{
                head.push(<Table.Th>{value}</Table.Th>);
            });
        }
        
    }

    useEffect(()=>{
        constructHead(props.head);
        constructRows(data[0]);
    },[])

    return(
        <div className="tablePagination">
            <Table striped withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        {head}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {dataPage}
                </Table.Tbody>
            </Table>
            
            <Pagination value={activePage} total={data.length} onChange={(value)=>{setActivePage(value); constructRows(data[value-1])}}></Pagination>

        </div>
    )
}