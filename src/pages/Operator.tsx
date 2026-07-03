import React, { useEffect } from 'react';

import NavbarOperator from '../components/layout/NavbarOperator';
import PackageTableOperator from '../components/ui/PackageTableOperator';

function Operator() {

    useEffect(() => {
        document.title = "Operator Page - IDN Paketku";
    }, []);

    return (
        <div className="bg-white dark:bg-slate-900 dark:text-white min-h-screen transition-colors duration-300">
            <header>
                <NavbarOperator />
            </header>

            <main className='px-10 font-jakarta space-y-8 mt-10 pb-12'>
                
                {/* Section 1: Greeting */}
                <section>
                    <h1 className='text-gray-900 dark:text-white font-bold text-3xl'>
                        Assalamu’alaikum, Pak &lt;Satpam&gt;!
                    </h1>
                    <p className='text-gray-500 dark:text-gray-400 mt-2 text-base'>
                        Antum yang sedang bertugas dalam menerima paket.
                    </p>
                </section>

                {/* Section 2: Table Khusus Operator */}
                <section>
                    <PackageTableOperator />
                </section>

            </main>
        </div>
    )
}

export default Operator;