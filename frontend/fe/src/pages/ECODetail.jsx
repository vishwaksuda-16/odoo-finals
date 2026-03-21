import Header from "../components/Header";

export default function ECODetail() {
    return (
        <div className="flex-1 bg-gray-100 min-h-screen">

            {/* Header */}
            <Header />

            <div className="p-6">

                {/* Top Section */}
                <div className="flex justify-between items-center mb-4">

                    {/* Stage */}
                    <span className="px-3 py-1 bg-gray-200 rounded">
                        New
                    </span>

                    {/* Approval Button */}
                    <button className="bg-green-500 text-white px-4 py-2 rounded">
                        Approve
                    </button>

                </div>

                {/* ECO Details */}
                <div className="bg-white p-6 rounded shadow space-y-4">

                    <div>
                        <label className="font-medium">Title</label>
                        <p>Change Screws</p>
                    </div>

                    <div>
                        <label className="font-medium">ECO Type</label>
                        <p>BoM</p>
                    </div>

                    <div>
                        <label className="font-medium">Product</label>
                        <p>Wooden Table</p>
                    </div>

                    <div>
                        <label className="font-medium">Bill of Materials</label>
                        <p>BoM v1</p>
                    </div>

                    <div>
                        <label className="font-medium">User</label>
                        <p>Admin</p>
                    </div>

                    <div>
                        <label className="font-medium">Effective Date</label>
                        <p>-</p>
                    </div>

                    <div>
                        <label className="font-medium">Version Update</label>
                        <p>Yes</p>
                    </div>

                </div>

                {/* Changes Section */}
                <div className="mt-6 bg-white p-6 rounded shadow">

                    <h3 className="text-lg font-semibold mb-3">
                        Changes
                    </h3>

                    <p className="text-blue-500 cursor-pointer">
                        View Changes
                    </p>

                </div>

            </div>

        </div>
    );
}