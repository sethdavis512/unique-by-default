import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getEntryListItems } from "~/models/entry.server";
import Calendar from "~/components/Calendar";
import { PlusIcon } from "@heroicons/react/solid";

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const entryListItems = await getEntryListItems({ userId });

  return json({ entryListItems });
}

export default function EntriesPage() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex flex-col md:flex-row items-center justify-between bg-green-800 p-4 text-white">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">
            <Link to=".">Unique by Default</Link>
          </h1>
        </div>
        <div className="flex gap-4">
          <span className="rounded-full bg-amber-400 px-4 py-2 text-black">
            {user.email}
          </span>
          <Form action="/logout" method="post">
            <button
              type="submit"
              className="rounded bg-green-600 py-2 px-4 text-green-100 hover:bg-green-600 active:bg-green-600"
            >
              Logout
            </button>
          </Form>
        </div>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-1/2 border-r bg-zinc-50">
          <Calendar data={data} />
        </div>

        <div className="flex-1 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
