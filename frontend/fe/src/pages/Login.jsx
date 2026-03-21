export default function Login() {
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
                    className="w-full mb-3 p-2 border rounded"
                />

                {/* Password */}
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-3 p-2 border rounded"
                />

                {/* Sign In Button */}
                <button className="w-full bg-blue-500 text-white p-2 rounded">
                    Sign In
                </button>

                {/* Links */}
                <div className="flex justify-between mt-3 text-sm text-blue-500">
                    <span className="cursor-pointer">Forgot Password</span>
                    <span className="cursor-pointer">Sign Up</span>
                </div>

            </div>

        </div>
    );
}