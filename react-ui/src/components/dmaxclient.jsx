import React, { useEffect, useRef, useState } from 'react';
// import onSubmit function from dmax.js
import { onSubmit } from '../public/dmax.js';


const DmaxPage = () => {
    const [amount, setAmount] = useState(1);
    const formRef = useRef(null);

    useEffect(() => {
        MDS.init(function () {
            console.log("MDS ready");
        });

        if(formRef.current) {
            formRef.current.addEventListener("submit", function (event) {
                event.preventDefault();
                console.log("amount: " + amount);
                onSubmit(amount);
            });
        }

    }, [amount]);

    const handleAmountChange = (event) => {
        setAmount(event.target.value);
    }

    return (
        <div>
            <h1>dmax client</h1>
            <div id="js-main">
                <form ref={formRef}>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={handleAmountChange}
                        min="1" 
                        max="100" 
                    />
                    <input type="submit" value="Submit" />
                </form>
            </div>
        </div>
    )
};

export default DmaxPage;
