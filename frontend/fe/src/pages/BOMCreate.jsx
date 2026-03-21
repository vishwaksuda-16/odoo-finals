import Header from "../components/Header";

export default function BOMCreate() {
    return (
        <div className="flex-1 bg-gray-100 min-h-screen">
            <Header />

            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Create Bill of Materials
                </h2>

                <div className="bg-white p-6 rounded shadow space-y-4">

                    <div>
                        <label className="block mb-1 font-medium">BoM Number *</label>
                        <input type="text" className="w-full border p-2 rounded" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Finished Product *</label>
                        <input type="text" className="w-full border p-2 rounded" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Reference *</label>
                        <input type="text" className="w-full border p-2 rounded" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Quantity *</label>
                        <input type="number" className="w-full border p-2 rounded" />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Version</label>
                        <input
                            type="text"
                            value="1"
                            readOnly
                            className="w-full border p-2 rounded bg-gray-100"
                        />
                    </div>

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