import { LayoutDashboard } from 'lucide-react'

const LeftImage = () => {
    return (
        <div className="min-h-screen hidden md:flex md:w-1/2 bg-linear-to-br from-orange-600 to-amber-200 items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent"></div>

            <div className="relative z-10 text-center px-8">
                <div className="flex items-center justify-center gap-3 text-white mb-4">
                    <LayoutDashboard className="h-10 w-10" />
                    <span className="text-4xl font-bold tracking-tighter">
                        Table<span className="text-orange-200">Tap</span>
                    </span>
                </div>
                <p className="text-orange-100 text-lg font-light max-w-md mx-auto">
                    Join thousands of restaurant owners streamlining their operations today.
                </p>
            </div>
        </div>
    )
}

export default LeftImage
