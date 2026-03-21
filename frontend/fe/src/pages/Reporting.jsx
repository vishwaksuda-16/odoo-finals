import Header from "../components/Header";

export default function Reporting() {
    return (
        <div className="flex-1 bg-gray-100 min-h-screen">
            <Header />

            <div className="p-6">

                <h2 className="text-xl font-semibold mb-4">
                    ECO Reports
                </h2>

                <div className="bg-white rounded shadow p-4">

                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">ECO Title</th>
                                <th className="p-2">ECO Type</th>
                                <th className="p-2">Product</th>
                                <th className="p-2">Changes</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr className="border-b">
                                <td className="p-2">Change Screws</td>
                                <td className="p-2">BoM</td>
                                <td className="p-2">Wooden Table</td>
                                <td className="p-2 text-blue-500 cursor-pointer">
                                    View Changes
                                </td>
                            </tr>
                        </tbody>

                    </table>

                </div>

            </div>
        </div>
    );
}