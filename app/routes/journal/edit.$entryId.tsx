import * as React from "react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getEntry, updateEntry } from "~/models/entry.server";
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
  await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { title: "Title is required", body: null } },
      { status: 400 }
    );
  }

  if (typeof body !== "string" || body.length === 0) {
    return json(
      { errors: { title: null, body: "Body is required" } },
      { status: 400 }
    );
  }

  const entry = await updateEntry({
    id: params.entryId as string,
    title,
    body
  });

  return redirect(`/journal/${entry.id}`);
}

export default function NewEntryPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form className="flex flex-col gap-6" method="post">
      <div>
        <h2 className="mb-4 flex-auto text-3xl font-semibold text-zinc-900">
          Edit entry
        </h2>
        <h3 className="mb-4 flex-auto text-xl font-semibold text-zinc-900">
          Prompts
        </h3>
        <div className="mb-4">
          <ul className="list-disc pl-4">
            <li className="mb-4">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos
              deleniti obcaecati voluptatem a amet doloribus, est consectetur
              nesciunt illum sapiente? Eligendi nostrum voluptate, autem quo
              veniam sit omnis odit doloremque.
            </li>
            <li className="mb-4">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos
              deleniti obcaecati voluptatem a amet doloribus, est consectetur
              nesciunt illum sapiente? Eligendi nostrum voluptate, autem quo
              veniam sit omnis odit doloremque.
            </li>
            <li className="mb-4">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eos
              deleniti obcaecati voluptatem a amet doloribus, est consectetur
              nesciunt illum sapiente? Eligendi nostrum voluptate, autem quo
              veniam sit omnis odit doloremque.
            </li>
          </ul>
        </div>
        <label className="flex w-full flex-col gap-1">
          <span>Title: </span>
          <input
            ref={titleRef}
            name="title"
            className="flex-1 rounded-md border-2 border-green-600 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
            defaultValue={loaderData.entry.title}
          />
        </label>
        {actionData?.errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Entry: </span>
          <textarea
            ref={bodyRef}
            name="body"
            rows={15}
            className="w-full flex-1 rounded-md border-2 border-green-600 py-2 px-3 text-lg leading-6"
            aria-invalid={actionData?.errors?.body ? true : undefined}
            aria-errormessage={
              actionData?.errors?.body ? "body-error" : undefined
            }
            defaultValue={loaderData.entry.body}
          />
        </label>
        {actionData?.errors?.body && (
          <div className="pt-1 text-red-700" id="body-error">
            {actionData.errors.body}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-green-600 py-2 px-4 text-white hover:bg-green-600 focus:bg-green-400"
        >
          Update
        </button>
      </div>
    </Form>
  );
}
