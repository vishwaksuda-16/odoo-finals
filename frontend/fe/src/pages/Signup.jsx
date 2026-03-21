export default function Signup() {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">

            <div className="bg-white p-6 rounded shadow w-80">

                {/* Logo / Title */}
                <h2 className="text-2xl font-bold text-center mb-4">
                    PLM Sentry
                </h2>

                {/* Login ID */}
                <input
                    type="text"
                    placeholder="Login ID"
                    className="w-full mb-2 p-2 border rounded"
                />

                {/* Email */}
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-2 p-2 border rounded"
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-2 p-2 border rounded"
                />

                {/* Confirm Password */}
                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full mb-3 p-2 border rounded"
                />

                {/* Sign Up Button */}
                <button className="w-full bg-green-500 text-white p-2 rounded">
                    Sign Up
                </button>

            </div>

        </div>
    );
}