import React from 'react'
import numeral from "numeral";
import './Table.css'

const Table=({countries})=>{
    return (
        <div className="table">
            {countries.map(({country,cases})=>{
                return (
                    <tr>
                        <td>{country}</td>
                        <td> <strong>{numeral(cases).format("0,0")}</strong></td>
                    </tr>
                )
            })}
        </div>
    )
}

export default Table