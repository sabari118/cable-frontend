import { ChangeEvent } from "react";

type RoleOptionProp={
    value:string;
    label:string;
    checked:boolean;
    onChange:(e:ChangeEvent<HTMLInputElement>) => void
}

export default function RoleOption({value,label,checked,onChange}:RoleOptionProp){
    return (
        <label>
            <input
            type="radio"
            name="role"
            value={value}
            checked={checked}
            onChange={onChange}
            />{" "}
            {label}
        </label>
    )
}