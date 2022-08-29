import { PlusIcon } from "@heroicons/react/solid";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useCatch, useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import invariant from "tiny-invariant";

import { getEntry, deleteEntry } from "~/models/entry.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request);
  invariant(params.entryId, "entryId not found");

  const entry = await getEntry({ userId, id: params.entryId });
  if (!entry) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ entry });
}

export async function action({ request, params }: ActionArgs) {
  const userId = await requireUserId(request);
  invariant(params.entryId, "entryId not found");

  await deleteEntry({ userId, id: params.entryId });

  return redirect("/journal");
}

export default function EntryDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="flex justify-end gap-3">
        <Link
          to="/journal/new"
          className="flex items-center gap-2 rounded bg-green-600 py-2 px-4 text-white hover:bg-green-600 focus:bg-green-400"
        >
          <PlusIcon className="h-6 w-6" />
          New entry
        </Link>
        <Link
          to={`/journal/edit/${data.entry.id}`}
          className="rounded border border-green-600 py-2 px-4 text-green-600 hover:bg-zinc-200 active:bg-zinc-200"
        >
          Edit
        </Link>
        <Form method="post">
          <button
            type="submit"
            className="rounded border-transparent bg-red-600 py-2 px-4 text-white hover:bg-red-700 focus:bg-red-700 active:bg-red-700"
          >
            Delete
          </button>
        </Form>
      </div>
      <hr className="my-6 block border-zinc-300" />
      <h3 className="text-3xl font-bold">{data.entry.title}</h3>
      <div className="py-6 prose" dangerouslySetInnerHTML={{ __html: marked.parse(data.entry.body) }}></div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Entry not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
