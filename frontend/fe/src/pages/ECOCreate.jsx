import Header from "../components/Header";

export default function ECOCreate() {
    return (
        <div className="flex-1 bg-gray-100 min-h-screen">

            {/* Header */}
            <Header />

            <div className="p-6">

                <h2 className="text-xl font-semibold mb-4">Create ECO</h2>

                <div className="bg-white p-6 rounded shadow space-y-4">

                    {/* Title */}
                    <div>
                        <label className="block mb-1 font-medium">Title *</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    {/* ECO Type */}
                    <div>
                        <label className="block mb-1 font-medium">ECO Type *</label>
                        <select className="w-full border p-2 rounded">
                            <option>Product</option>
                            <option>BoM</option>
                        </select>
                    </div>

                    {/* Product */}
                    <div>
                        <label className="block mb-1 font-medium">Product *</label>
                        <select className="w-full border p-2 rounded">
                            <option>Select Product</option>
                        </select>
                    </div>

                    {/* BoM */}
                    <div>
                        <label className="block mb-1 font-medium">Bill of Materials *</label>
                        <select className="w-full border p-2 rounded">
                            <option>Select BoM</option>
                        </select>
                    </div>

                    {/* User */}
                    <div>
                        <label className="block mb-1 font-medium">User *</label>
                        <input
                            type="text"
                            value="Current User"
                            readOnly
                            className="w-full border p-2 rounded bg-gray-100"
                        />
                    </div>

                    {/* Effective Date */}
                    <div>
                        <label className="block mb-1 font-medium">Effective Date</label>
                        <input
                            type="datetime-local"
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    {/* Version Update */}
                    <div className="flex items-center gap-2">
                        <input type="checkbox" />
                        <label>Version Update</label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded">
                            Save
                        </button>

                        <button className="bg-green-500 text-white px-4 py-2 rounded">
                            Start
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
}