export default function DiffView({ oldData, newData }) {
    return (
        <div className="bg-white p-4 rounded shadow">

            <h2 className="text-lg font-semibold mb-4">Change Comparison</h2>

            {Object.keys(oldData).map((key) => {
                const oldValue = oldData[key];
                const newValue = newData[key];

                const isChanged = oldValue !== newValue;

                return (
                    <div
                        key={key}
                        className="grid grid-cols-3 gap-4 mb-2 items-center"
                    >
                        {/* Field Name */}
                        <div className="font-medium">{key}</div>

                        {/* Old Value */}
                        <div
                            className={`p-2 border ${isChanged ? "bg-red-200" : ""
                                }`}
                        >
                            {oldValue}
                        </div>

                        {/* New Value */}
                        <div
                            className={`p-2 border ${isChanged ? "bg-green-200" : ""
                                }`}
                        >
                            {newValue}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}