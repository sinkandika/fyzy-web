"use client";

import { error } from "console";
import { useState, useEffect } from "react";

export default function TestPage () {

    const [pesan, setPesan] = useState("");

    useEffect (() => {
        fetch("/test/api/hello")
        .then((res) => res.json())
        .then((data) => setPesan(data.message))
        .catch((error) => console.error(error));
    }, []);

    return (
        //it will appear in http://localhost:3000/test/test_ui (look the folder)
        <main>
            <p  className=" flex flex-col"> 
                {`it's message from backend:`}
                <span>{pesan}</span>
            </p>
        </main>

    );
}