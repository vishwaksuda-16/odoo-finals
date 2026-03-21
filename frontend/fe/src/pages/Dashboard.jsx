import Header from "../components/Header";

export default function Dashboard() {
    return (
        <div className="flex-1 bg-gray-100 min-h-screen">

            {/* Top Header */}
            <Header />

            {/* Main Content */}
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">
                    Welcome to PLM Sentry 🚀
                </h1>

                {/* Placeholder for ECO list */}
                <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-600">
                        ECO data will be displayed here
                    </p>
                </div>
            </div>

        </div>
    );
}