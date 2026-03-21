import Header from "../components/Header";

export default function ECOStages() {
    return (
        <div className="flex-1 bg-gray-100 min-h-screen">
            <Header />

            <div className="p-6">

                <h2 className="text-xl font-semibold mb-4">
                    ECO Stages
                </h2>

                <div className="bg-white p-6 rounded shadow space-y-4">

                    <div>
                        <label className="block mb-1 font-medium">
                            Stage Name *
                        </label>
                        <input
                            type="text"
                            placeholder="New / Done"
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">
                            Approval Type
                        </label>
                        <select className="w-full border p-2 rounded">
                            <option>Required</option>
                            <option>Optional</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">
                            User
                        </label>
                        <input
                            type="text"
                            placeholder="Select User"
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <button className="bg-blue-500 text-white px-4 py-2 rounded">
                        Save Stage
                    </button>

                </div>

            </div>
        </div>
    );
}