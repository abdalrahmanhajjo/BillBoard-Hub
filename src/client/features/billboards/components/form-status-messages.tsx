type FormStatusMessagesProps = {
  error?: string | null;
  success?: string | null;
};

export function FormStatusMessages({ error, success }: FormStatusMessagesProps) {
  return (
    <>
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      {success ? (
        <p
          role="status"
          className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
        >
          {success}
        </p>
      ) : null}
    </>
  );
}
