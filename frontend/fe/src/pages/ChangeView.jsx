import Header from "../components/Header";
import DiffView from "../components/DiffView";

export default function ChangeView() {
    // Dummy data for now (later from backend)
    const oldData = {
        screws: 12,
        price: 100,
    };

    const newData = {
        screws: 16,
        price: 120,
    };

    return (
        <div className="flex-1 bg-gray-100 min-h-screen">

            {/* Header */}
            <Header />

            <div className="p-6">

                <h2 className="text-xl font-semibold mb-4">
                    ECO Changes
                </h2>

                {/* Diff View Component */}
                <DiffView oldData={oldData} newData={newData} />

            </div>

        </div>
    );
}