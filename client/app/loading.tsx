import { Loader2 } from 'lucide-react'

function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-orange-600" size={32} />
        </div>
    )
}

export default Loading