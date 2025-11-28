import LeftImage from "../_components/auth/LeftImage";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex ">
            <LeftImage />
            {children}
        </div>
    );
}
