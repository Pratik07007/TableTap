
import { LayoutDashboard } from "lucide-react";

export const Footer = async () => (
< footer className="bg-white border-t border-gray-100 pt-16 pb-8" >
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 text-orange-600 mb-6">
                    <LayoutDashboard className="h-6 w-6" />
                    <span className="text-lg font-bold text-gray-900">TableTap</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                    The complete operating system for modern restaurants.
                </p>
            </div>

            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-sm">Product</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                    <li><a href="#features" className="hover:text-orange-600 transition-colors">System Features</a></li>
                    <li><a href="#benefits" className="hover:text-orange-600 transition-colors">QR Solution</a></li>
                    <li><a href="#faq" className="hover:text-orange-600 transition-colors">FAQ</a></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-sm">Contact Us</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                    <li>
                        <a href="tel:+9779807373150" className="hover:text-orange-600 transition-colors">+977 9807373150</a>
                    </li>
                    <li>
                        <a href="mailto:s.dhimal006@gmail.com" className="hover:text-orange-600 transition-colors">s.dhimal006@gmail.com</a>
                    </li>
                    <li className="text-gray-500">Sano Gaucharan, Naxal, Nepal</li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-gray-900 mb-4 text-sm">Follow Us</h4>
                <div className="flex gap-3">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-orange-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733a4.67 4.67 0 0 0 2.048-2.578 9.3 9.3 0 0 1-2.958 1.13a4.66 4.66 0 0 0-7.938 4.25 13.229 13.229 0 0 1-9.602-4.868c-.333.564-.523 1.234-.523 1.962a4.66 4.66 0 0 0 2.072 3.878 4.63 4.63 0 0 1-2.11-.583v.06a4.66 4.66 0 0 0 3.737 4.568 4.69 4.69 0 0 1-2.104.08 4.66 4.66 0 0 0 4.35 3.234 9.348 9.348 0 0 1-5.786 1.995 9.5 9.5 0 0 1-1.112-.065 13.175 13.175 0 0 0 7.14 2.093c8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602a9.47 9.47 0 0 0 2.323-2.41z" /></svg>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-orange-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.116 0-3.472.012-4.695.068-2.61.12-3.832 1.343-3.952 3.952-.056 1.223-.067 1.578-.067 4.695s.011 3.472.067 4.695c.12 2.61 1.342 3.832 3.952 3.952 1.223.056 1.578.067 4.695.067s3.472-.011 4.695-.067c2.61-.12 3.832-1.342 3.952-3.952.056-1.223.067-1.578.067-4.695s-.011-3.472-.067-4.695c-.12-2.61-1.342-3.832-3.952-3.952-1.223-.056-1.578-.067-4.695-.067zm0 3.068a5.938 5.938 0 1 0 0 11.876 5.938 5.938 0 0 0 0-11.876zm0 9.808a3.87 3.87 0 1 1 0-7.74 3.87 3.87 0 0 1 0 7.74zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" /></svg>
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-orange-600 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                    </a>
                </div>
            </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} TableTap by Pratik Dhimal
            </p>
            <div className="flex gap-4">

            </div>
        </div>
    </div>
</footer >
);