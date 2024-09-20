export default async function SignInConfirmation() {
  return (
    <div className="h-[100svh] w-full flex items-center justify-center">
      <div className="rounded-lg p-5 bg-blue-500 text-white text-center">
        <h2 className="font-semibold text-lg">Account confirmed.</h2>
        <h3 className="text-sm">You can close this page now.</h3>
      </div>
    </div>
  );
}
