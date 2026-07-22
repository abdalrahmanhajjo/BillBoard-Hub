type ModulePlaceholderPageProps = {
  title: string;
  description: string;
};

export function ModulePlaceholderPage({
  title,
  description,
}: ModulePlaceholderPageProps) {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col justify-center gap-2 px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-zinc-600">{description}</p>
    </section>
  );
}
