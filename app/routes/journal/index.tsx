import { Link } from "@remix-run/react";

export default function EntryIndexPage() {
  return (
    <p className="mt-6 text-2xl text-zinc-400">
      No entry selected. Select a entry on the left, or{" "}
      <Link to="new" className="text-green-600 underline">
        create a new entry.
      </Link>
    </p>
  );
}
