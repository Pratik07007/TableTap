export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await params;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white border border-gray-200 rounded-xl p-10 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Under Development
        </h1>
        <p className="text-gray-500">
          Payment page is currently under development.
        </p>
      </div>
    </div>
  );
}
