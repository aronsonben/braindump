export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm text-gray-800 dark:text-gray-50 p-4">
      {"success" in message && (
        <div className="border-l-2 border-l-gray-800 dark:border-l-gray-50 px-4">
          {message.success}
        </div>
      )}
      {"error" in message && (
        <div className="border-l-2 border-l-gray-800 dark:border-l-gray-50 px-4">
          {message.error.includes("Password") ? 
            ("Password should be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number.") 
            : message.error}
        </div>
      )}
      {"message" in message && (
        <div className="border-l-2 border-l-gray-800 dark:border-l-gray-50 px-4">{message.message}</div>
      )}
    </div>
  );
}
