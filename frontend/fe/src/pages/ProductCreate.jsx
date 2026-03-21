import Header from "../components/Header";

export default function ProductCreate() {
    return (
        <div className="flex-1 bg-gray-100 min-h-screen">

            {/* Header */}
            <Header />

            <div className="p-6">

                <h2 className="text-xl font-semibold mb-4">
                    Create Product
                </h2>

                <div className="bg-white p-6 rounded shadow space-y-4">

                    {/* Product Name */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    {/* Sales Price */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Sales Price *
                        </label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    {/* Cost Price */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Cost Price *
                        </label>
                        <input
                            type="number"
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    {/* Attachments */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Attachments
                        </label>
                        <input
                            type="file"
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    {/* Version */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Version
                        </label>
                        <input
                            type="text"
                            value="1"
                            readOnly
                            className="w-full border p-2 rounded bg-gray-100"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded">
                            Save
                        </button>

                        <button className="bg-gray-500 text-white px-4 py-2 rounded">
                            Back
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
}