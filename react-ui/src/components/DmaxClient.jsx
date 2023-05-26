import React, { useEffect, useRef, useState } from 'react';
import { handleDmaxClientSubmit } from '../minima';




const DmaxClient = () => {
    const [amount, setAmount] = useState(1);
    const formRef = useRef(null);

    useEffect(() => {
        window.MDS.init(function () {
            console.log("MDS ready");
        });

        if (formRef.current) {
            formRef.current.addEventListener("submit", function (event) {
                event.preventDefault();
                console.log("amount: " + amount);
               handleDmaxClientSubmit(amount);
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

export default DmaxClient;