'use client'
import {Flex, Table} from "@mantine/core";
import "./filters.css";

export default function Filters(props){
    return(
        <form className="boxFilter" onSubmit={props.onSubmit}>
            <Flex
            direction={"column"}
            wrap={"wrap"}
            >
                <div className="filterHeader">
                    <h2>{props.title}</h2>
                </div>
                {props.children != undefined?
                (<div className="filterInputs">
                <Flex direction={"row"}
                    gap={"1vh"}>
                    {props.children}
                    </Flex>
                </div>)
                :
                (null)}
                <div className="filterButtons">
                    <Flex direction={"row"}
                        gap={"1vh"}>
                        {props.buttons}
                    </Flex>
                </div>
            </Flex>
        </form>
    )
}