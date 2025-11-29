"use client"

export default function Error() {

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow p-6 max-w-sm text-center">
                <h2 className="text-xl font-semibold mb-2">Oops, something went wrong</h2>
                <p className="text-gray-600 mb-4">Please try again or refresh the page.</p>
                <div className="flex gap-2 justify-center">

                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Refresh</button>
                </div>
            </div>
        </div>
    )
}
