export const AdminFooter = () => {
    return (
        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-500">
                    © {new Date().getFullYear()} TableTap. All rights reserved.
                </p>
                <div className="flex gap-6 text-sm text-gray-500">
                    <a href="#" className="hover:text-orange-600">Privacy Policy</a>
                    <a href="#" className="hover:text-orange-600">Terms of Service</a>
                    <a href="#" className="hover:text-orange-600">Support</a>
                </div>
            </div>
        </footer>
    );
};
