import Header from "../components/Header";

export default function Settings() {
    return (
        <div className="flex-1 bg-gray-100 min-h-screen">
            <Header />

            <div className="p-6">

                <h2 className="text-xl font-semibold mb-4">
                    Settings
                </h2>

                <div className="bg-white p-4 rounded shadow space-y-3">

                    <div className="cursor-pointer text-blue-500">
                        ECO Stages
                    </div>

                    <div className="cursor-pointer text-blue-500">
                        Approvals
                    </div>

                </div>

            </div>
        </div>
    );
}