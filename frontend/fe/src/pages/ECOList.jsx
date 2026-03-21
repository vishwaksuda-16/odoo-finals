import Header from "../components/Header";

export default function ECOList() {
    return (
        <div className="flex-1 bg-gray-100 min-h-screen">

            {/* Header */}
            <Header />

            <div className="p-6">

                {/* Top Controls */}
                <div className="flex justify-between items-center mb-4">

                    {/* New Button */}
                    <button className="bg-blue-500 text-white px-4 py-2 rounded">
                        New
                    </button>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search..."
                        className="border p-2 rounded"
                    />

                </div>

                {/* ECO Table */}
                <div className="bg-white rounded shadow p-4">

                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Title</th>
                                <th className="p-2">ECO Type</th>
                                <th className="p-2">Product</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr className="border-b">
                                <td className="p-2">Change Screws</td>
                                <td className="p-2">BoM</td>
                                <td className="p-2">Wooden Table</td>
                            </tr>

                            <tr className="border-b">
                                <td className="p-2">Update Price</td>
                                <td className="p-2">Product</td>
                                <td className="p-2">Chair</td>
                            </tr>
                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}