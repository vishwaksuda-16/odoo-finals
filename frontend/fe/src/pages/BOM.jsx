import Header from "../components/Header";

export default function BOM() {
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
                        placeholder="Search BoM..."
                        className="border p-2 rounded"
                    />

                </div>

                {/* BoM Table */}
                <div className="bg-white rounded shadow p-4">

                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Finished Product</th>
                                <th className="p-2">Reference</th>
                                <th className="p-2">Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr className="border-b">
                                <td className="p-2">Wooden Table</td>
                                <td className="p-2">BOM-001</td>
                                <td className="p-2">Active</td>
                            </tr>

                            <tr className="border-b">
                                <td className="p-2">Chair</td>
                                <td className="p-2">BOM-002</td>
                                <td className="p-2">Archived</td>
                            </tr>
                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}