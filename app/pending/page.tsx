export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Account Pending Approval</h1>
        <p className="text-gray-500 mb-6">
          Your account has been created. Please wait for your agency admin to approve your access.
          You will be able to log in once approved.
        </p>
        <a href="/login" className="text-sm text-blue-600 hover:underline">
          Back to login
        </a>
      </div>
    </div>
  )
}